import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/utils/supabase/server";
import { canGenerateWorkoutPlan, formatRemainingTime } from "@/utils/Workoutratelimit/workoutRateLimit";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GOAL_SHOWS_FOCUS_AREAS = ["muscle-gain", "fat-loss", "strength", "body-recomposition"];

export async function POST(request) {
    const encoder = new TextEncoder();
    const encode = (step, payload = {}) =>
        encoder.encode(JSON.stringify({ step, ...payload }) + "\n");

    // ── 1. Auth ──────────────────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return Response.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    // ── 2. Rate limit ────────────────────────────────────────────────────────
    const rateLimitResult = await canGenerateWorkoutPlan(user.id);

    if (!rateLimitResult.canGenerate) {
        const timeLabel = formatRemainingTime(
            rateLimitResult.remainingDays,
            rateLimitResult.remainingHours
        );
        return Response.json(
            {
                error: `You can only generate one workout plan every 72 hours. Your next plan will be available in ${timeLabel}.`,
                remainingDays: rateLimitResult.remainingDays,
                remainingHours: rateLimitResult.remainingHours,
                remainingTimeLabel: timeLabel,
                nextAvailableAt: rateLimitResult.nextAvailableAt?.toISOString() ?? null,
            },
            { status: 429 }
        );
    }

    // ── 3. Parse body ────────────────────────────────────────────────────────
    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "Invalid request body." }, { status: 400 });
    }

    const {
        age, gender, weight, height, goal, fitnessLevel,
        targetWeight, daysPerWeek, equipment, focusAreas,
        workoutLocation, sessionDuration, activityLevel,
        injuries, injuryDetails, medicalConditions,
        medicalConditionDetails, exercisePreferences,
    } = body;

    // ── 4. Validate and coerce types ─────────────────────────────────────────
    if (!age || !gender || !goal || !fitnessLevel || !workoutLocation || !sessionDuration || !activityLevel) {
        return Response.json({ error: "Missing required fields." }, { status: 400 });
    }

    const ageNum = Number(age);
    const weightNum = Number(weight);
    const heightNum = Number(height);
    const daysNum = Number(daysPerWeek);
    const targetWeightNum = targetWeight ? Number(targetWeight) : null;

    if (!Number.isFinite(ageNum) || ageNum < 10 || ageNum > 120)
        return Response.json({ error: "Invalid age (must be 10–120)." }, { status: 400 });
    if (!Number.isFinite(weightNum) || weightNum <= 0)
        return Response.json({ error: "Invalid weight." }, { status: 400 });
    if (!Number.isFinite(heightNum) || heightNum <= 0)
        return Response.json({ error: "Invalid height." }, { status: 400 });
    if (!Number.isFinite(daysNum) || daysNum < 1 || daysNum > 7)
        return Response.json({ error: "Days per week must be 1–7." }, { status: 400 });

    // ── 5. Derived values ────────────────────────────────────────────────────
    const equipmentList = Object.entries(equipment || {})
        .filter(([, selected]) => selected)
        .map(([key]) => key);

    const hasHealthConcerns =
        (Array.isArray(injuries) && injuries.length > 0 && !injuries.includes("none")) ||
        (Array.isArray(medicalConditions) && medicalConditions.length > 0 && !medicalConditions.includes("none"));

    // ── 6. Build AI prompt ───────────────────────────────────────────────────
    const prompt = `You are a certified personal trainer and sports medicine specialist. Generate a complete, safe, personalized ${daysNum}-day workout plan.
${hasHealthConcerns ? "IMPORTANT: This user has health concerns. You MUST avoid exercises that could aggravate their conditions and provide safer alternatives. Add clear safety warnings where applicable." : ""}
Return ONLY valid JSON — no markdown, no explanation, no code blocks.

JSON structure:
{"weeklySchedule":[{"day":"","focus":"","sessionDuration":"","warmup":"","cooldown":"","exercises":[{"name":"","sets":0,"reps":"","rest":"","notes":"","alternativeFor":""}]}],"progressionStrategy":"","safetyNotes":[],"nutritionTips":[],"recoveryRecommendations":[],"estimatedResults":""}

USER PROFILE:
- Age: ${ageNum}, Gender: ${gender}
- Weight: ${weightNum} kg, Height: ${heightNum} ft
- Goal: ${goal}
- Fitness Level: ${fitnessLevel}
- Activity Level (outside workouts): ${activityLevel}
- ${daysNum} workout days/week, ${sessionDuration} per session
- Workout location: ${workoutLocation}
- Equipment: ${equipmentList.length > 0 ? equipmentList.join(", ") : "bodyweight only"}
- Focus areas: ${GOAL_SHOWS_FOCUS_AREAS.includes(goal) && Array.isArray(focusAreas) && focusAreas.length > 0 ? focusAreas.join(", ") : "full body"}
- ${Array.isArray(injuries) && injuries.length > 0 && !injuries.includes("none") ? `Injuries/limitations: ${injuries.join(", ")}${injuryDetails ? ` (${injuryDetails})` : ""}.` : "No injuries or limitations."}
- ${Array.isArray(medicalConditions) && medicalConditions.length > 0 && !medicalConditions.includes("none") ? `Medical conditions: ${medicalConditions.join(", ")}${medicalConditionDetails ? ` (${medicalConditionDetails})` : ""}.` : "No medical conditions."}
- ${Array.isArray(exercisePreferences) && exercisePreferences.length > 0 ? `Preferred training styles: ${exercisePreferences.join(", ")}.` : ""}
- ${targetWeightNum ? `Target weight: ${targetWeightNum} kg.` : ""}

Requirements:
- Each workout must fit within the session duration (${sessionDuration})
- Exercise selection must match location (${workoutLocation}) and available equipment
- Include warmup, main exercises with sets/reps/rest, and cooldown for each day
- Rest days should include light activity or active recovery suggestions
- Provide a clear progression strategy for weeks 1-4
- ${hasHealthConcerns ? "For each exercise that could be risky, provide a safer alternative in the alternativeFor field" : ""}
- Make the plan realistic, progressive, and safe`.trim();

    // ── 7. NDJSON stream ─────────────────────────────────────────────────────
    const stream = new ReadableStream({
        async start(controller) {
            let formId = null;

            try {
                // ── Step: save questionnaire (status = 'pending') ─────────
                controller.enqueue(encode("saving-profile"));

                const { data: formRecord, error: formError } = await supabase
                    .from("workout_forms")
                    .insert({
                        user_id: user.id,
                        age: ageNum,
                        gender,
                        weight: weightNum,
                        weight_unit: "kg",
                        height: heightNum,
                        height_unit: "ft",
                        fitness_goal: goal,
                        fitness_level: fitnessLevel,
                        target_weight: targetWeightNum,
                        target_weight_unit: "kg",
                        workout_days_per_week: daysNum,
                        equipment_available: equipmentList,
                        focus_areas: Array.isArray(focusAreas) ? focusAreas : [],
                        workout_location: workoutLocation,
                        session_duration: sessionDuration,
                        activity_level: activityLevel,
                        injuries: Array.isArray(injuries) ? injuries : [],
                        injury_details: injuryDetails || null,
                        medical_conditions: Array.isArray(medicalConditions) ? medicalConditions : [],
                        medical_condition_details: medicalConditionDetails || null,
                        exercise_preferences: Array.isArray(exercisePreferences) ? exercisePreferences : [],
                        status: "pending",
                    })
                    .select("id")
                    .single();

                if (formError) {
                    console.error("DB insert (workout_forms):", formError);
                    controller.enqueue(encode("error", { message: "Failed to save your profile. Please try again." }));
                    return;
                }

                formId = formRecord.id;

                // ── Step: call Gemini ─────────────────────────────────────
                controller.enqueue(encode("analysing-profile"));
                controller.enqueue(encode("generating-plan"));

                let rawText;
                try {
                    const response = await ai.models.generateContent({
                        model: "gemini-3-flash-preview",
                        contents: prompt,
                    });
                    rawText = response.text;
                } catch (aiError) {
                    console.error("Gemini API error:", aiError);
                    await supabase
                        .from("workout_forms")
                        .update({ status: "failed" })
                        .eq("id", formId);
                    controller.enqueue(encode("error", { message: "AI failed to generate your plan. Please try again." }));
                    return;
                }

                // ── Step: parse AI response ───────────────────────────────
                controller.enqueue(encode("structuring-plan"));

                let generatedPlan;
                try {
                    const cleaned = rawText
                        .replace(/^```json\s*/i, "")
                        .replace(/^```\s*/i, "")
                        .replace(/```\s*$/i, "")
                        .trim();
                    generatedPlan = JSON.parse(cleaned);
                } catch (parseError) {
                    console.error("JSON parse error:", parseError);
                    await supabase
                        .from("workout_forms")
                        .update({ status: "failed" })
                        .eq("id", formId);
                    controller.enqueue(encode("error", { message: "AI returned an unexpected format. Please try again." }));
                    return;
                }

                // ── Step: save generated plan (status = 'active') ─────────
                controller.enqueue(encode("saving-plan"));

                const { data: planRecord, error: planError } = await supabase
                    .from("workout_plans")
                    .insert({
                        user_id: user.id,
                        form_id: formId,
                        generated_plan: generatedPlan,
                        status: "active",
                    })
                    .select("id")
                    .single();

                if (planError) {
                    console.error("DB insert (workout_plans):", planError);
                    await supabase
                        .from("workout_forms")
                        .update({ status: "failed" })
                        .eq("id", formId);
                    controller.enqueue(encode("error", { message: "Failed to save your workout plan. Please try again." }));
                    return;
                }

                // ── Mark form as completed ────────────────────────────────
                await supabase
                    .from("workout_forms")
                    .update({ status: "completed" })
                    .eq("id", formId);

                // ── Step: done ────────────────────────────────────────────
                controller.enqueue(encode("finalizing"));
                controller.enqueue(encode("completed", {
                    planId: planRecord.id,
                    formId,
                    generatedPlan,
                }));

            } catch (err) {
                console.error("Unexpected error in /api/generate-workout:", err);
                if (formId) {
                    await supabase
                        .from("workout_forms")
                        .update({ status: "failed" })
                        .eq("id", formId)
                        .catch(() => { });
                }
                controller.enqueue(encode("error", { message: "An unexpected server error occurred." }));
            } finally {
                try { controller.close(); } catch { }
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "application/x-ndjson",
            "Transfer-Encoding": "chunked",
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    });
}