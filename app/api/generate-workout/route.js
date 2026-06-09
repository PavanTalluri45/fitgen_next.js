import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/utils/supabase/server";
import { canGenerateWorkoutPlan, formatRemainingTime } from "@/utils/Workoutratelimit/workoutRateLimit";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Goals for which focus-area selection is relevant
const GOAL_SHOWS_FOCUS_AREAS = ["muscle-gain", "fat-loss", "strength", "body-recomposition"];

export async function POST(request) {
    // ── 1. Auth ────────────────────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return Response.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    // ── 2. Rate limit check ────────────────────────────────────────────────────
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

    // ── 3. Parse body ──────────────────────────────────────────────────────────
    const {
        age,
        gender,
        weight,
        height,
        goal,
        fitnessLevel,
        targetWeight,
        daysPerWeek,
        equipment,
        focusAreas,
        workoutLocation,
        sessionDuration,
        activityLevel,
        injuries,
        injuryDetails,
        medicalConditions,
        medicalConditionDetails,
        exercisePreferences,
    } = await request.json();

    // ── 4. Validate ────────────────────────────────────────────────────────────
    if (!age || !gender || !goal || !fitnessLevel || !workoutLocation || !sessionDuration || !activityLevel) {
        return Response.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (Number(age) < 10 || Number(age) > 120 || Number(weight) <= 0 || Number(height) <= 0) {
        return Response.json({ error: "Invalid measurements. Check age, weight, and height." }, { status: 400 });
    }

    // ── 5. Derived values ──────────────────────────────────────────────────────

    // Human-readable height string for the AI prompt
    const heightDisplay = `${height} ft`;

    // Flatten equipment object → array of selected keys
    const equipmentList = Object.entries(equipment || {})
        .filter(([, selected]) => selected)
        .map(([key]) => key);

    // True when the user reported injuries or medical conditions
    const hasHealthConcerns =
        (injuries?.length > 0 && !injuries.includes("none")) ||
        (medicalConditions?.length > 0 && !medicalConditions.includes("none"));

    // ── 6. Build AI prompt ─────────────────────────────────────────────────────
    const prompt = `You are a certified personal trainer and sports medicine specialist. Generate a complete, safe, personalized ${daysPerWeek}-day workout plan.
${hasHealthConcerns ? "IMPORTANT: This user has health concerns. You MUST avoid exercises that could aggravate their conditions and provide safer alternatives. Add clear safety warnings where applicable." : ""}
Return ONLY valid JSON — no markdown, no explanation, no code blocks.

JSON structure:
{"weeklySchedule":[{"day":"","focus":"","sessionDuration":"","warmup":"","cooldown":"","exercises":[{"name":"","sets":0,"reps":"","rest":"","notes":"","alternativeFor":""}]}],"progressionStrategy":"","safetyNotes":[],"nutritionTips":[],"recoveryRecommendations":[],"estimatedResults":""}

USER PROFILE:
- Age: ${age}, Gender: ${gender}
- Weight: ${weight} kg, Height: ${heightDisplay}
- Goal: ${goal}
- Fitness Level: ${fitnessLevel}
- Activity Level (outside workouts): ${activityLevel}
- ${daysPerWeek} workout days/week, ${sessionDuration} per session
- Workout location: ${workoutLocation}
- Equipment: ${equipmentList.length > 0 ? equipmentList.join(", ") : "bodyweight only"}
- Focus areas: ${GOAL_SHOWS_FOCUS_AREAS.includes(goal) && focusAreas?.length > 0 ? focusAreas.join(", ") : "full body"}
- ${injuries?.length > 0 && !injuries.includes("none") ? `Injuries/limitations: ${injuries.join(", ")}${injuryDetails ? ` (${injuryDetails})` : ""}.` : "No injuries or limitations."}
- ${medicalConditions?.length > 0 && !medicalConditions.includes("none") ? `Medical conditions: ${medicalConditions.join(", ")}${medicalConditionDetails ? ` (${medicalConditionDetails})` : ""}.` : "No medical conditions."}
- ${exercisePreferences?.length > 0 ? `Preferred training styles: ${exercisePreferences.join(", ")}.` : ""}
- ${targetWeight ? `Target weight: ${targetWeight} kg.` : ""}

Requirements:
- Each workout must fit within the session duration (${sessionDuration})
- Exercise selection must match location (${workoutLocation}) and available equipment
- Include warmup, main exercises with sets/reps/rest, and cooldown for each day
- Rest days should include light activity or active recovery suggestions
- Provide a clear progression strategy for weeks 1-4
- ${hasHealthConcerns ? "For each exercise that could be risky, provide a safer alternative in the alternativeFor field" : ""}
- Make the plan realistic, progressive, and safe`.trim();

    // ── 7. NDJSON stream ───────────────────────────────────────────────────────
    const encoder = new TextEncoder();
    const encode = (step, payload = {}) =>
        encoder.encode(JSON.stringify({ step, ...payload }) + "\n");

    const stream = new ReadableStream({
        async start(controller) {
            try {
                // ── Step: save questionnaire ─────────────────────────────────
                controller.enqueue(encode("saving-profile"));

                const { data: formRecord, error: formError } = await supabase
                    .from("workout_forms")
                    .insert({
                        user_id: user.id,
                        age: Number(age),
                        gender,
                        weight: Number(weight),
                        weight_unit: 'kg',
                        height: Number(height),
                        height_unit: 'ft',
                        fitness_goal: goal,
                        fitness_level: fitnessLevel,
                        target_weight: targetWeight ? Number(targetWeight) : null,
                        target_weight_unit: 'kg',
                        workout_days_per_week: Number(daysPerWeek) || 3,
                        equipment_available: equipmentList,
                        focus_areas: focusAreas || [],
                        workout_location: workoutLocation,
                        session_duration: sessionDuration,
                        activity_level: activityLevel,
                        injuries: injuries || [],
                        injury_details: injuryDetails || null,
                        medical_conditions: medicalConditions || [],
                        medical_condition_details: medicalConditionDetails || null,
                        exercise_preferences: exercisePreferences || [],
                    })
                    .select()
                    .single();

                if (formError) {
                    console.error("Supabase insert (workout_forms):", formError);
                    controller.enqueue(encode("error", { message: "Failed to save your questionnaire. Please try again." }));
                    return;
                }

                // ── Step: call Gemini ────────────────────────────────────────
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
                    controller.enqueue(encode("error", { message: "AI failed to generate your plan. Please try again." }));
                    return;
                }

                // ── Step: parse AI response ──────────────────────────────────
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
                    controller.enqueue(encode("error", { message: "AI returned an unexpected format. Please try again." }));
                    return;
                }

                // ── Step: save generated plan ────────────────────────────────
                controller.enqueue(encode("saving-plan"));

                const { data: planRecord, error: planError } = await supabase
                    .from("workout_plans")
                    .insert({
                        user_id: user.id,
                        form_id: formRecord.id,
                        generated_plan: generatedPlan,
                    })
                    .select()
                    .single();

                if (planError) {
                    console.error("Supabase insert (workout_plans):", planError);
                    controller.enqueue(encode("error", { message: "Failed to save your workout plan. Please try again." }));
                    return;
                }

                // ── Step: done ───────────────────────────────────────────────
                controller.enqueue(encode("finalizing"));
                controller.enqueue(encode("completed", {
                    planId: planRecord.id,
                    formId: formRecord.id,
                    generatedPlan,
                }));

            } catch (err) {
                console.error("Unexpected error in /api/generate-workout:", err);
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