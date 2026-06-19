-- ============================================================
-- workout_forms
-- ============================================================
CREATE TABLE IF NOT EXISTS public.workout_forms (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- ── Step 1: Body Measurements ────────────────────────────
    weight                      NUMERIC(6,2) NOT NULL CHECK (weight > 0),
    -- kg only — no unit conversion needed
    weight_unit                 TEXT NOT NULL DEFAULT 'kg',

    -- Height stored as a single decimal value in feet (e.g. 5.9, 6.1)
    height                      NUMERIC(5,2) NOT NULL CHECK (height > 0),
    height_unit                 TEXT NOT NULL DEFAULT 'ft',

    -- ── Step 2: Tell Us About Yourself ──────────────────────
    age                         INTEGER NOT NULL CHECK (age BETWEEN 10 AND 120),

    gender                      TEXT NOT NULL
                                    CHECK (gender IN (
                                        'male',
                                        'female',
                                        'prefer-not-to-say'
                                    )),

    fitness_goal                TEXT NOT NULL
                                    CHECK (fitness_goal IN (
                                        'muscle-gain',
                                        'fat-loss',
                                        'strength',
                                        'body-recomposition',
                                        'general-fitness',
                                        'endurance',
                                        'athletic-performance',
                                        'flexibility-mobility'
                                    )),

    fitness_level               TEXT NOT NULL
                                    CHECK (fitness_level IN (
                                        'beginner',
                                        'intermediate',
                                        'advanced'
                                    )),

    -- Only populated when goal is muscle-gain / strength /
    -- body-recomposition / fat-loss
    focus_areas                 TEXT[] NOT NULL DEFAULT '{}',

    -- Only populated when goal is fat-loss / body-recomposition
    target_weight               NUMERIC(6,2),
    -- kg only
    target_weight_unit          TEXT DEFAULT 'kg',

    workout_days_per_week       INTEGER NOT NULL
                                    CHECK (workout_days_per_week BETWEEN 1 AND 7),

    -- ── Step 3: Workout Preferences ─────────────────────────
    workout_location            TEXT NOT NULL
                                    CHECK (workout_location IN (
                                        'commercial-gym',
                                        'home-gym',
                                        'home-limited',
                                        'home-none',
                                        'outdoors'
                                    )),

    session_duration            TEXT NOT NULL
                                    CHECK (session_duration IN (
                                        '20min',
                                        '30min',
                                        '45min',
                                        '60min',
                                        '90min'
                                    )),

    activity_level              TEXT NOT NULL
                                    CHECK (activity_level IN (
                                        'sedentary',
                                        'lightly-active',
                                        'moderately-active',
                                        'very-active'
                                    )),

    equipment_available         TEXT[] NOT NULL DEFAULT '{}',

    -- ── Step 4: Health & Training ───────────────────────────
    injuries                    TEXT[] NOT NULL DEFAULT '{}',
    injury_details              TEXT,

    medical_conditions          TEXT[] NOT NULL DEFAULT '{}',
    medical_condition_details   TEXT,

    -- Optional training style preferences
    exercise_preferences        TEXT[] NOT NULL DEFAULT '{}',

    -- ── Status ───────────────────────────────────────────────
    -- Tracks whether the AI generation for this form succeeded or failed.
    -- pending    → form saved, generation not yet started
    -- completed  → plan saved successfully in workout_plans
    -- failed     → AI call or DB save failed
    status                      TEXT NOT NULL DEFAULT 'pending'
                                    CHECK (status IN ('pending', 'completed', 'failed')),

    -- ── Metadata ─────────────────────────────────────────────
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- workout_plans
-- Stores the AI-generated plan linked to a form submission.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.workout_plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id         UUID NOT NULL
                        REFERENCES auth.users(id) ON DELETE CASCADE,

    form_id         UUID NOT NULL
                        REFERENCES public.workout_forms(id) ON DELETE CASCADE,

    generated_plan  JSONB NOT NULL,

    -- ── Status ───────────────────────────────────────────────
    -- Reflects whether this plan is ready to be shown to the user.
    -- active  → plan generated and available
    -- deleted → user removed this plan (soft delete)
    status          TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'deleted')),

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_workout_forms_user_id
    ON public.workout_forms(user_id);

CREATE INDEX IF NOT EXISTS idx_workout_plans_user_id
    ON public.workout_plans(user_id);

CREATE INDEX IF NOT EXISTS idx_workout_plans_form_id
    ON public.workout_plans(form_id);

CREATE INDEX IF NOT EXISTS idx_workout_plans_created_at
    ON public.workout_plans(created_at DESC);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.workout_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;

-- workout_forms policies
CREATE POLICY "Users can insert their own forms"
    ON public.workout_forms FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own forms"
    ON public.workout_forms FOR SELECT
    USING (auth.uid() = user_id);

-- Needed so the API can update status to 'completed' or 'failed'
CREATE POLICY "Users can update their own forms"
    ON public.workout_forms FOR UPDATE
    USING (auth.uid() = user_id);

-- workout_plans policies
CREATE POLICY "Users can insert their own plans"
    ON public.workout_plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own plans"
    ON public.workout_plans FOR SELECT
    USING (auth.uid() = user_id);

-- Needed so the API can soft-delete plans (status = 'deleted')
CREATE POLICY "Users can update their own plans"
    ON public.workout_plans FOR UPDATE
    USING (auth.uid() = user_id);