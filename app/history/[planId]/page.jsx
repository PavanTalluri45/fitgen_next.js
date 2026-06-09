"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
    CheckCircle,
    Heart,
    RefreshCw,
    TrendingUp,
    ShieldCheck,
    Salad,
    CalendarDays,
    Clock,
    ChevronDown,
    ChevronUp,
    ArrowLeft,
} from 'lucide-react';

// ─── Animation variants ───────────────────────────────────────────────────────

const pageVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const staggerContainer = {
    visible: { transition: { staggerChildren: 0.08 } },
};

// ─── Goal label map ───────────────────────────────────────────────────────────

const GOAL_LABELS = {
    'muscle-gain': 'Muscle Gain',
    'fat-loss': 'Fat Loss',
    'strength': 'Strength',
    'body-recomposition': 'Body Recomposition',
    'general-fitness': 'General Fitness',
    'endurance': 'Endurance',
    'athletic-performance': 'Athletic Performance',
    'flexibility-mobility': 'Flexibility & Mobility',
    // legacy keys kept for backward compat
    'weight-loss': 'Weight Loss',
    'flexibility': 'Flexibility',
};

// ─── DayCard — collapsible day block ─────────────────────────────────────────

const DayCard = ({ day }) => {
    const [open, setOpen] = useState(true);

    return (
        <div className="bg-gray-800/70 rounded-2xl overflow-hidden border border-gray-700">
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-700/50 transition-colors"
            >
                <div className="flex items-start gap-3 text-left">
                    <div>
                        <p className="text-white font-bold text-base">{day.day}</p>
                        <p className="text-[#B1F82A] text-sm font-medium">{day.focus}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    {day.sessionDuration && (
                        <span className="hidden sm:flex items-center gap-1 text-gray-400 text-xs bg-gray-700 px-2.5 py-1 rounded-full">
                            <Clock className="w-3 h-3" />
                            {day.sessionDuration}
                        </span>
                    )}
                    {open
                        ? <ChevronUp className="w-4 h-4 text-gray-400" />
                        : <ChevronDown className="w-4 h-4 text-gray-400" />
                    }
                </div>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-5 space-y-4 border-t border-gray-700 pt-4">
                            {day.warmup && (
                                <p className="text-xs text-gray-400">
                                    <span className="font-semibold text-gray-300">Warm-up: </span>
                                    {day.warmup}
                                </p>
                            )}
                            {day.exercises?.length > 0 && (
                                <ul className="space-y-2">
                                    {day.exercises.map((ex, i) => (
                                        <li
                                            key={i}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 border-b border-gray-700 last:border-b-0 gap-1"
                                        >
                                            <div>
                                                <span className="font-semibold text-white text-sm">{ex.name}</span>
                                                {ex.notes && (
                                                    <p className="text-gray-500 text-xs mt-0.5">{ex.notes}</p>
                                                )}
                                            </div>
                                            <span className="text-gray-400 text-xs sm:text-right whitespace-nowrap">
                                                {ex.sets} sets × {ex.reps}
                                                {ex.rest ? ` — ${ex.rest} rest` : ''}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {(!day.exercises || day.exercises.length === 0) && (
                                <p className="text-gray-400 text-sm italic">Rest day — light activity recommended.</p>
                            )}
                            {day.cooldown && (
                                <p className="text-xs text-gray-400">
                                    <span className="font-semibold text-gray-300">Cool-down: </span>
                                    {day.cooldown}
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── SectionCard wrapper ──────────────────────────────────────────────────────

const SectionCard = ({ icon: Icon, title, children }) => (
    <motion.div variants={itemVariants} className="bg-gray-800/70 p-6 rounded-2xl">
        <h3 className="text-xl font-semibold text-[#B1F82A] mb-4 flex items-center gap-2">
            <Icon className="w-5 h-5 shrink-0" />
            {title}
        </h3>
        {children}
    </motion.div>
);

// ─── Build a userInfo object from a workout_forms DB row ──────────────────────
// Simplified: height stored as single decimal ft, weight always kg

const buildUserInfo = (form) => {
    if (!form) return {};
    return {
        gender: form.gender,
        age: form.age,
        weight: form.weight,
        // height is already the decimal ft value (e.g. 5.9)
        height: form.height,
        goal: form.fitness_goal,
        fitnessLevel: form.fitness_level,
        focusAreas: form.focus_areas ?? [],
        daysPerWeek: form.workout_days_per_week,
        workoutLocation: form.workout_location,
        sessionDuration: form.session_duration,
        activityLevel: form.activity_level,
        injuries: form.injuries ?? [],
        medicalConditions: form.medical_conditions ?? [],
        exercisePreferences: form.exercise_preferences ?? [],
    };
};

// ─── Main HistoryPlanDetails page ─────────────────────────────────────────────

export default function HistoryPlanDetails() {
    const router = useRouter();
    const params = useParams();
    const planId = params?.planId;

    const [workoutPlan, setWorkoutPlan] = useState(null);
    const [rateLimitInfo, setRateLimitInfo] = useState(null);

    // Fetch plan data
    useEffect(() => {
        if (!planId) return;

        const fetchPlan = async () => {
            const supabase = createClient();

            const { data, error } = await supabase
                .from('workout_plans')
                .select(`
                    id,
                    created_at,
                    generated_plan,
                    workout_forms (
                        age,
                        gender,
                        weight,
                        weight_unit,
                        height,
                        height_unit,
                        fitness_goal,
                        fitness_level,
                        focus_areas,
                        workout_days_per_week,
                        workout_location,
                        session_duration,
                        activity_level,
                        injuries,
                        medical_conditions,
                        exercise_preferences
                    )
                `)
                .eq('id', planId)
                .single();

            if (error || !data) return;

            const plan = data.generated_plan ?? {};
            const userInfo = buildUserInfo(data.workout_forms);

            setWorkoutPlan({
                ...plan,
                planId: data.id,
                createdAt: data.created_at,
                userInfo,
            });
        };

        fetchPlan();
    }, [planId]);

    // Fetch rate limit status
    useEffect(() => {
        const fetchRateLimit = async () => {
            try {
                const res = await fetch('/api/check-rate-limit');
                if (res.ok) {
                    const data = await res.json();
                    setRateLimitInfo(data);
                }
            } catch {
                // Fail open
            }
        };
        fetchRateLimit();
    }, []);

    if (!workoutPlan) return null;

    const {
        weeklySchedule = [],
        progressionStrategy,
        progressionAdvice,
        safetyNotes = [],
        nutritionTips = [],
        estimatedResults,
        userInfo = {},
        createdAt,
    } = workoutPlan;

    const progression = progressionStrategy || progressionAdvice;

    const formattedDate = createdAt
        ? new Date(createdAt).toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric',
        })
        : null;

    const canGenerate = !rateLimitInfo || rateLimitInfo.canGenerate;
    const rateLimitLabel = rateLimitInfo && !rateLimitInfo.canGenerate
        ? rateLimitInfo.remainingTimeLabel
        : null;

    return (
        <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-[#0C0C0C] py-16 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Page header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white">
                        Your Personalized{' '}
                        <span className="text-[#B1F82A]">Workout Plan</span>
                    </h1>
                    <p className="text-gray-400 mt-3">
                        {formattedDate
                            ? `Generated on ${formattedDate}`
                            : 'Generated just for you — follow the schedule below.'}
                    </p>
                </div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="space-y-6"
                >
                    {/* ── User profile summary ── */}
                    {userInfo && Object.keys(userInfo).length > 0 && (
                        <SectionCard icon={CheckCircle} title="Your Profile">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-gray-300 text-sm">
                                {userInfo.gender && (
                                    <div><span className="text-gray-500">Gender</span><br /><span className="capitalize">{userInfo.gender}</span></div>
                                )}
                                {userInfo.age && (
                                    <div><span className="text-gray-500">Age</span><br />{userInfo.age}</div>
                                )}
                                {userInfo.weight && (
                                    <div><span className="text-gray-500">Weight</span><br />{userInfo.weight} kg</div>
                                )}
                                {userInfo.height && (
                                    <div><span className="text-gray-500">Height</span><br />{userInfo.height} ft</div>
                                )}
                                {userInfo.goal && (
                                    <div><span className="text-gray-500">Goal</span><br />{GOAL_LABELS[userInfo.goal] ?? userInfo.goal}</div>
                                )}
                                {userInfo.fitnessLevel && (
                                    <div><span className="text-gray-500">Fitness Level</span><br /><span className="capitalize">{userInfo.fitnessLevel}</span></div>
                                )}
                                {userInfo.daysPerWeek && (
                                    <div><span className="text-gray-500">Days/Week</span><br />{userInfo.daysPerWeek}</div>
                                )}
                                {userInfo.focusAreas?.length > 0 && (
                                    <div className="col-span-2 sm:col-span-3">
                                        <span className="text-gray-500">Focus Areas</span><br />
                                        {userInfo.focusAreas.join(', ')}
                                    </div>
                                )}
                            </div>
                        </SectionCard>
                    )}

                    {/* ── Weekly schedule ── */}
                    {weeklySchedule.length > 0 && (
                        <motion.div variants={itemVariants} className="space-y-3">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <CalendarDays className="w-6 h-6 text-[#B1F82A]" />
                                Weekly Schedule
                            </h2>
                            {weeklySchedule.map((day, i) => (
                                <DayCard key={i} day={day} />
                            ))}
                        </motion.div>
                    )}

                    {/* ── Progression advice ── */}
                    {progression && (
                        <SectionCard icon={TrendingUp} title="Progression Advice">
                            <p className="text-gray-300 leading-relaxed">{progression}</p>
                        </SectionCard>
                    )}

                    {/* ── Safety notes ── */}
                    {safetyNotes.length > 0 && (
                        <SectionCard icon={ShieldCheck} title="Safety Notes">
                            <ul className="space-y-2 text-gray-300">
                                {safetyNotes.map((note, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                        <ShieldCheck className="w-4 h-4 text-[#B1F82A] mt-0.5 shrink-0" />
                                        {note}
                                    </li>
                                ))}
                            </ul>
                        </SectionCard>
                    )}

                    {/* ── Nutrition tips ── */}
                    {nutritionTips.length > 0 && (
                        <SectionCard icon={Salad} title="Nutrition Tips">
                            <ul className="space-y-2 text-gray-300">
                                {nutritionTips.map((tip, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                        <Heart className="w-4 h-4 text-[#B1F82A] mt-0.5 shrink-0" />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </SectionCard>
                    )}

                    {/* ── Estimated results ── */}
                    {estimatedResults && (
                        <motion.div
                            variants={itemVariants}
                            className="bg-[#B1F82A]/10 border border-[#B1F82A]/30 rounded-2xl p-6"
                        >
                            <h3 className="text-lg font-semibold text-[#B1F82A] mb-2 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                What to Expect
                            </h3>
                            <p className="text-gray-300">{estimatedResults}</p>
                        </motion.div>
                    )}
                </motion.div>

                {/* Bottom CTAs */}
                <div className="flex flex-col items-center gap-4 pt-4">


                    <div className="flex flex-wrap gap-4 justify-center">
                        {canGenerate ? (
                            <Button
                                onClick={() => router.push('/plan-builder')}
                                size="xl"
                                className="px-8 py-4 text-lg font-semibold rounded-full bg-[#B1F82A] text-black hover:bg-[#B1F82A]/90 transition-all duration-300 shadow-lg flex items-center gap-2"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Generate New Plan
                            </Button>
                        ) : (
                            <Button
                                disabled
                                size="xl"
                                className="px-8 py-4 text-lg font-semibold rounded-full bg-[#B1F82A]/40 text-black/50 cursor-not-allowed shadow-none flex items-center gap-2"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Generate New Plan
                            </Button>
                        )}

                        <Button
                            onClick={() => router.push('/history')}
                            size="xl"
                            className="px-8 py-4 text-lg font-semibold rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-all duration-300 flex items-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to History
                        </Button>
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

            </div>
        </motion.div>
    );
}