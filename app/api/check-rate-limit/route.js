import { createClient } from "@/utils/supabase/server";
import { canGenerateWorkoutPlan, formatRemainingTime } from "@/utils/Workoutratelimit/workoutRateLimit";

/**
 * GET /api/check-rate-limit
 *
 * Returns the current user's rate-limit status so client components can
 * check without doing a full Supabase query from the browser.
 *
 * Response shape:
 * {
 *   canGenerate: boolean,
 *   remainingDays: number,
 *   remainingHours: number,
 *   remainingTimeLabel: string,   // e.g. "2 days 5 hours"
 *   nextAvailableAt: string|null, // ISO date string
 * }
 */
export async function GET() {
    const supabase = await createClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    // Not authenticated — tell the client they can't generate (they'll be
    // redirected to login when they actually try anyway)
    if (authError || !user) {
        return Response.json(
            { canGenerate: false, remainingDays: 0, remainingHours: 0, remainingTimeLabel: "", nextAvailableAt: null },
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