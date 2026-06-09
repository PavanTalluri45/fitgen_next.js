import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { canGenerateWorkoutPlan, formatRemainingTime } from "@/utils/Workoutratelimit/workoutRateLimit";
import { CalendarDays, Dumbbell, Timer, ChevronRight, ClipboardList, Clock } from "lucide-react";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const GOAL_LABELS = {
    "muscle-gain": "Muscle Gain",
    "fat-loss": "Fat Loss",
    "strength": "Strength",
    "body-recomposition": "Body Recomposition",
    "general-fitness": "General Fitness",
    "endurance": "Endurance",
    "athletic-performance": "Athletic Performance",
    "flexibility-mobility": "Flexibility & Mobility",
    // Legacy values kept for backward compatibility
    "weight-loss": "Weight Loss",
    "flexibility": "Flexibility",
};

const SESSION_LABELS = {
    "20min": "20 min",
    "30min": "30 min",
    "45min": "45 min",
    "60min": "60 min",
    "90min": "90 min",
};

const LEVEL_COLORS = {
    beginner: "text-green-400 bg-green-400/10 border-green-400/30",
    intermediate: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    advanced: "text-red-400 bg-red-400/10 border-red-400/30",
};

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

// ── Page component (Server Component) ────────────────────────────────────────

export default async function HistoryPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // Run plan fetch and rate limit check in parallel
    const [plansResult, rateLimitResult] = await Promise.all([
        supabase
            .from("workout_plans")
            .select(`
                id,
                created_at,
                generated_plan,
                workout_forms (
                    fitness_goal,
                    fitness_level,
                    workout_days_per_week,
                    session_duration,
                    focus_areas,
                    workout_location,
                    age,
                    gender
                )
            `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
        canGenerateWorkoutPlan(user.id),
    ]);

    const { data: plans, error } = plansResult;
    if (error) console.error("Error fetching workout history:", error);

    const hasPlans = plans && plans.length > 0;

    const canGenerate = rateLimitResult.canGenerate;
    const rateLimitLabel = canGenerate
        ? null
        : formatRemainingTime(rateLimitResult.remainingDays, rateLimitResult.remainingHours);

    return (
        <main className="min-h-screen bg-[#0C0C0C] text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-white">
                        Workout <span className="text-[#B1F82A]">History</span>
                    </h1>
                    <p className="text-gray-400 mt-3">
                        All your previously generated workout plans in one place.
                    </p>
                </div>

                {/* Empty state */}
                {!hasPlans && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <ClipboardList className="w-16 h-16 text-gray-600 mb-6" />
                        <h2 className="text-2xl font-semibold text-gray-300 mb-3">No plans yet</h2>
                        <p className="text-gray-500 mb-8 max-w-sm">
                            You haven&apos;t generated any workout plans yet. Head to the plan builder to get started.
                        </p>
                        <a
                            href="/plan-builder"
                            className="px-8 py-3 bg-[#B1F82A] text-black font-semibold rounded-full hover:bg-[#B1F82A]/90 transition-colors"
                        >
                            Build a Plan
                        </a>
                    </div>
                )}

                {/* Plan cards */}
                {hasPlans && (
                    <div className="space-y-4">
                        {plans.map((plan) => {
                            const form = plan.workout_forms;
                            const goalLabel = GOAL_LABELS[form?.fitness_goal] ?? form?.fitness_goal ?? "—";
                            const levelColor = LEVEL_COLORS[form?.fitness_level] ?? "text-gray-400 bg-gray-700/30 border-gray-600";
                            const sessionLabel = SESSION_LABELS[form?.session_duration];

                            return (
                                <a key={plan.id} href={`/history/${plan.id}`} className="group block">
                                    <Card className="flex flex-row items-center justify-between bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-[#B1F82A]/50 hover:bg-gray-800/60 transition-all duration-300 gap-0 py-6 shadow-none ring-0">
                                        <CardContent className="flex-1 min-w-0 p-0">
                                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                                                <CardTitle className="text-lg font-bold text-white truncate">
                                                    {goalLabel}
                                                </CardTitle>
                                                <Badge className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize h-auto ${levelColor}`}>
                                                    {form?.fitness_level ?? "—"}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                                <span className="flex items-center gap-1.5">
                                                    <CalendarDays className="w-4 h-4 text-[#B1F82A]" />
                                                    {formatDate(plan.created_at)}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Dumbbell className="w-4 h-4 text-[#B1F82A]" />
                                                    {form?.workout_days_per_week ?? "—"} days/week
                                                </span>
                                                {sessionLabel && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Timer className="w-4 h-4 text-[#B1F82A]" />
                                                        {sessionLabel}/session
                                                    </span>
                                                )}
                                                {!sessionLabel && form?.focus_areas?.length > 0 && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Timer className="w-4 h-4 text-[#B1F82A]" />
                                                        {form.focus_areas.slice(0, 3).join(", ")}
                                                        {form.focus_areas.length > 3 ? ` +${form.focus_areas.length - 3}` : ""}
                                                    </span>
                                                )}
                                            </div>
                                        </CardContent>
                                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[#B1F82A] transition-colors ml-4 shrink-0" />
                                    </Card>
                                </a>
                            );
                        })}
                    </div>
                )}

                {/* Bottom CTAs */}
                {hasPlans && (
                    <div className="mt-10 flex flex-col items-center gap-4">


                        <div className="flex items-center justify-center gap-4">
                            <a href="/">
                                <Button
                                    size="xl"
                                    className="flex-1 px-6 py-3 text-lg font-semibold rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-all duration-300"
                                >
                                    Back
                                </Button>
                            </a>

                            {canGenerate ? (
                                <a href="/plan-builder">
                                    <Button
                                        size="xl"
                                        className="px-8 py-3 bg-[#B1F82A] text-black font-semibold rounded-full hover:bg-[#B1F82A]/90 transition-colors shadow-lg"
                                    >
                                        Generate New Plan
                                    </Button>
                                </a>
                            ) : (
                                <Button
                                    size="xl"
                                    disabled
                                    className="px-8 py-3 bg-[#B1F82A]/40 text-black/50 font-semibold rounded-full cursor-not-allowed shadow-none"
                                >
                                    Generate New Plan
                                </Button>
                            )}
                        </div>
                        {/* Rate limit alert — shown above the disabled button */}
                        {!canGenerate && rateLimitLabel && (
                            <Alert className="w-full max-w-md bg-gray-800/80 border-gray-700 text-white">
                                <Clock className="h-4 w-4 text-[#B1F82A]" />
                                <AlertTitle className="text-white">Workout Plan Unavailable</AlertTitle>
                                <AlertDescription className="text-gray-400">
                                    Next plan available in {rateLimitLabel}.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}