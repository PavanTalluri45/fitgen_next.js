import { createClient } from "@/utils/supabase/server";
import { canGenerateWorkoutPlan, formatRemainingTime } from "@/utils/Workoutratelimit/workoutRateLimit";

export async function GET() {
    const supabase = await createClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return Response.json(
            {
                canGenerate: false,
                remainingDays: 0,
                remainingHours: 0,
                remainingTimeLabel: "",
                nextAvailableAt: null,
            },
            { status: 401 }
        );
    }

    const result = await canGenerateWorkoutPlan(user.id);
    const remainingTimeLabel = result.canGenerate
        ? ""
        : formatRemainingTime(result.remainingDays, result.remainingHours);

    return Response.json({
        canGenerate: result.canGenerate,
        remainingDays: result.remainingDays,
        remainingHours: result.remainingHours,
        remainingTimeLabel,
        nextAvailableAt: result.nextAvailableAt
            ? result.nextAvailableAt.toISOString()
            : null,
    });
}