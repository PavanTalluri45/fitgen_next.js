import { createClient } from "@/utils/supabase/server";

const RATE_LIMIT_HOURS = 72;

/**
 * Check whether a user is allowed to generate a new workout plan.
 *
 * Queries the `workout_plans` table for the user's most recent plan and
 * compares its `created_at` timestamp against the 72-hour window.
 *
 * @param {string} userId  - The authenticated user's UUID
 * @returns {Promise<{
 *   canGenerate: boolean,
 *   remainingHours: number,
 *   remainingDays: number,
 *   nextAvailableAt: Date | null,
 * }>}
 */
export async function canGenerateWorkoutPlan(userId) {
    const supabase = await createClient();

    const { data: lastPlan, error } = await supabase
        .from("workout_plans")
        .select("created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error || !lastPlan) {
        return {
            canGenerate: true,
            remainingHours: 0,
            remainingDays: 0,
            nextAvailableAt: null,
        };
    }

    const lastGeneratedAt = new Date(lastPlan.created_at);
    const nextAvailableAt = new Date(
        lastGeneratedAt.getTime() + RATE_LIMIT_HOURS * 60 * 60 * 1000
    );
    const now = new Date();

    if (now >= nextAvailableAt) {
        return {
            canGenerate: true,
            remainingHours: 0,
            remainingDays: 0,
            nextAvailableAt: null,
        };
    }

    const remainingMs = nextAvailableAt.getTime() - now.getTime();
    const remainingHoursTotal = Math.ceil(remainingMs / (1000 * 60 * 60));
    const remainingDays = Math.floor(remainingHoursTotal / 24);
    const remainingHours = remainingHoursTotal % 24;

    return {
        canGenerate: false,
        remainingHours,
        remainingDays,
        nextAvailableAt,
    };
}

/**
 * Format remaining time into a human-readable string.
 *
 * @param {number} remainingDays
 * @param {number} remainingHours
 * @returns {string}
 */
export function formatRemainingTime(remainingDays, remainingHours) {
    if (remainingDays > 0 && remainingHours > 0) {
        return `${remainingDays} day${remainingDays !== 1 ? "s" : ""} ${remainingHours} hour${remainingHours !== 1 ? "s" : ""}`;
    }
    if (remainingDays > 0) {
        return `${remainingDays} day${remainingDays !== 1 ? "s" : ""}`;
    }
    return `${remainingHours} hour${remainingHours !== 1 ? "s" : ""}`;
}