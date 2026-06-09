"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Plus,
    Check,
    ChevronUp,
    ChevronDown,
    Dumbbell,
    Dumbbell as Barbell,
    GitBranch,
    Binary,
    CheckCircle2,
} from 'lucide-react';

// ─── localStorage draft key ───────────────────────────────────────────────────

const DRAFT_KEY = 'fitgen-questionnaire-draft';

// ─── Status definitions ───────────────────────────────────────────────────────

const STATUS_MESSAGES = {
    "saving-profile": "Saving your profile...",
    "analysing-profile": "Analysing your profile...",
    "generating-plan": "Generating your personalized workout plan...",
    "structuring-plan": "Structuring your workout schedule...",
    "saving-plan": "Saving your workout plan...",
    "finalizing": "Finalizing everything...",
    "completed": "Workout plan ready!",
};

const STATUS_ORDER = [
    "saving-profile",
    "analysing-profile",
    "generating-plan",
    "structuring-plan",
    "saving-plan",
    "finalizing",
    "completed",
];

// ─── Static data ──────────────────────────────────────────────────────────────

const focusAreasData = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

// Goals for which "Focus Areas" is relevant
const GOAL_SHOWS_FOCUS_AREAS = [
    'muscle-gain',
    'strength',
    'body-recomposition',
    'fat-loss',
];

// Goals that show target weight field
const GOAL_SHOWS_TARGET_WEIGHT = ['fat-loss', 'body-recomposition'];

const equipmentData = [
    { id: 'dumbbells', label: 'Dumbbells', icon: <Dumbbell className="w-5 h-5" /> },
    { id: 'barbell', label: 'Barbell', icon: <Barbell className="w-5 h-5" /> },
    { id: 'resistanceBands', label: 'Resistance Bands', icon: <GitBranch className="w-5 h-5" /> },
    { id: 'machine', label: 'Gym Machines', icon: <Binary className="w-5 h-5" /> },
    { id: 'kettlebells', label: 'Kettlebells', icon: <Dumbbell className="w-5 h-5" /> },
    { id: 'pullUpBar', label: 'Pull-up Bar', icon: <GitBranch className="w-5 h-5" /> },
    { id: 'cableMachine', label: 'Cable Machine', icon: <Binary className="w-5 h-5" /> },
    { id: 'none', label: 'None / Bodyweight Only', icon: <Check className="w-5 h-5" /> },
];

const injuryOptions = [
    { id: 'none', label: 'None' },
    { id: 'knee-pain', label: 'Knee Pain' },
    { id: 'lower-back-pain', label: 'Lower Back Pain' },
    { id: 'shoulder-pain', label: 'Shoulder Pain' },
    { id: 'wrist-pain', label: 'Wrist Pain' },
    { id: 'ankle-issues', label: 'Ankle Issues' },
    { id: 'other', label: 'Other' },
];

const medicalConditionOptions = [
    { id: 'none', label: 'None' },
    { id: 'high-blood-pressure', label: 'High Blood Pressure' },
    { id: 'diabetes', label: 'Diabetes' },
    { id: 'asthma', label: 'Asthma' },
    { id: 'heart-condition', label: 'Heart Condition' },
    { id: 'other', label: 'Other' },
];

const exercisePreferenceOptions = [
    { id: 'free-weights', label: 'Free Weights' },
    { id: 'machines', label: 'Machines' },
    { id: 'bodyweight', label: 'Bodyweight Training' },
    { id: 'cardio', label: 'Cardio' },
    { id: 'hiit', label: 'HIIT' },
    { id: 'functional', label: 'Functional Fitness' },
];



const DEFAULT_FORM_DATA = {
    weight: '70',
    height: '5.9',

    // Step 2 — About You
    age: '',
    gender: '',
    goal: '',
    fitnessLevel: '',
    focusAreas: [],
    targetWeight: '',
    daysPerWeek: 3,

    // Step 3 — Workout Preferences
    workoutLocation: '',
    sessionDuration: '',
    activityLevel: '',
    equipment: {},

    // Step 4 — Health & Training
    injuries: [],
    injuryDetails: '',
    medicalConditions: [],
    medicalConditionDetails: '',
    exercisePreferences: [],
};

// ─── Validation helpers ───────────────────────────────────────────────────────

// Step 1 — Body Measurements
const validateStep1 = (formData) => {
    const weight = parseFloat(formData.weight);
    if (!formData.weight || isNaN(weight) || weight <= 0)
        return { title: 'Invalid weight', description: 'Please enter a valid weight greater than 0.' };
    if (weight < 20 || weight > 500)
        return { title: 'Weight out of range', description: 'Please enter a weight between 20 kg and 500 kg.' };

    const height = parseFloat(formData.height);
    if (!formData.height || isNaN(height) || height <= 0)
        return { title: 'Invalid height', description: 'Please enter a valid height in ft (e.g. 5.9).' };
    if (height < 1.5 || height > 9.0)
        return { title: 'Height out of range', description: 'Please enter a realistic height between 1.5 ft and 9.0 ft.' };

    return null;
};

// Step 2 — About You (age, gender, goal, fitnessLevel, focusAreas conditional)
const validateStep2 = (formData) => {
    const age = parseInt(formData.age, 10);
    if (!formData.age || isNaN(age))
        return { title: 'Age is required', description: 'Please enter your age to continue.' };
    if (age < 10 || age > 120)
        return { title: 'Age out of range', description: 'Please enter a realistic age between 10 and 120.' };
    if (!formData.gender)
        return { title: 'Gender is required', description: 'Please select your gender to continue.' };
    if (!formData.goal)
        return { title: 'Fitness goal is required', description: 'Please select your primary fitness goal.' };
    if (!formData.fitnessLevel)
        return { title: 'Fitness level is required', description: 'Please select your current fitness level.' };
    if (GOAL_SHOWS_FOCUS_AREAS.includes(formData.goal) && formData.focusAreas.length === 0)
        return { title: 'Select a focus area', description: 'Please choose at least one body part to focus on for your goal.' };
    return null;
};

// Step 3 — Workout Preferences
const validateStep3 = (formData) => {
    if (!formData.workoutLocation)
        return { title: 'Workout location required', description: 'Please select where you will primarily work out.' };
    if (!formData.sessionDuration)
        return { title: 'Session duration required', description: 'Please select how long your sessions will be.' };
    if (!formData.activityLevel)
        return { title: 'Activity level required', description: 'Please select your current activity level outside workouts.' };
    return null;
};

// Step 4 — Health & Training (all optional)
const validateStep4 = () => null;

// ─── Loading Overlay ──────────────────────────────────────────────────────────

const LoadingOverlay = ({ status }) => {
    const currentIndex = STATUS_ORDER.indexOf(status);

    return (
        <motion.div
            key="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0C0C0C]"
        >
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(177,248,42,0.06) 0%, transparent 70%)',
                }}
            />

            <div className="relative w-full max-w-md mx-4">
                {/* Spinner ring */}
                <div className="flex justify-center mb-10">
                    <div className="relative w-20 h-20">
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                        </svg>
                        <svg className="absolute inset-0 w-full h-full animate-spin" viewBox="0 0 80 80" style={{ animationDuration: '1.2s' }}>
                            <circle cx="40" cy="40" r="34" fill="none" stroke="#B1F82A" strokeWidth="4" strokeLinecap="round" strokeDasharray="60 154" strokeDashoffset="0" />
                        </svg>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.p
                        key={status}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="text-center text-white text-xl font-semibold mb-10 tracking-tight"
                    >
                        {STATUS_MESSAGES[status] ?? "Processing..."}
                    </motion.p>
                </AnimatePresence>

                <div className="space-y-2.5 px-2">
                    {STATUS_ORDER.filter(s => s !== 'completed').map((s, i) => {
                        const isDone = i < currentIndex;
                        const isCurrent = i === currentIndex;
                        const isPending = i > currentIndex;

                        return (
                            <motion.div
                                key={s}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: isPending ? 0.3 : 1, x: 0 }}
                                transition={{ delay: i * 0.06, duration: 0.3 }}
                                className="flex items-center gap-3"
                            >
                                <div className="shrink-0 w-5 h-5 flex items-center justify-center">
                                    {isDone ? (
                                        <CheckCircle2 className="w-5 h-5 text-[#B1F82A]" />
                                    ) : isCurrent ? (
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#B1F82A] animate-pulse" />
                                    ) : (
                                        <div className="w-2 h-2 rounded-full bg-gray-600" />
                                    )}
                                </div>
                                <span className={`text-sm font-medium transition-colors duration-300 ${isDone ? 'text-[#B1F82A]' : isCurrent ? 'text-white' : 'text-gray-600'}`}>
                                    {STATUS_MESSAGES[s]}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

// ─── Shared sub-components ────────────────────────────────────────────────────

/** Checkbox row used for injuries, medical conditions, and exercise preferences */
const CheckboxRow = ({ id, label, checked, onCheckedChange }) => (
    <label
        htmlFor={id}
        className={`flex items-center gap-3 p-4 rounded-none border transition-all duration-300 cursor-pointer ${checked ? 'bg-[#B1F82A]/10 border-[#B1F82A]' : 'bg-gray-800/80 border-gray-700 hover:border-gray-600'}`}
    >
        <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} className="hidden" />
        <div className={`w-6 h-6 border-2 flex items-center justify-center transition-all duration-300 ${checked ? 'bg-[#B1F82A] border-[#B1F82A]' : 'border-gray-500'}`}>
            {checked && <Check className="w-4 h-4 text-black" />}
        </div>
        <span className={`text-sm font-medium ${checked ? 'text-white' : 'text-gray-300'}`}>{label}</span>
    </label>
);

const selectCls = "w-full bg-gray-800 border-gray-700 text-white mt-2 rounded-none border";
const selectContentCls = "bg-gray-800 text-white border-gray-700 rounded-none border";

// ─── Step 1 — Body Measurements ───────────────────────────────────────────────

/** Simple weight input: kg only, no unit toggle */
const WeightInput = ({ value, onValueChange }) => {
    const handleIncrement = () => onValueChange((Number(value) + 1).toString());
    const handleDecrement = () => onValueChange(Math.max(0, Number(value) - 1).toString());

    return (
        <div className="flex flex-col items-center gap-4">
            <h3 className="text-xl font-semibold text-white">
                Your <span className="text-[#B1F82A]">Weight</span>
            </h3>
            <div className="flex items-center gap-4">
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onValueChange(e.target.value)}
                    className="w-48 text-center bg-transparent text-6xl font-bold text-white focus:outline-none appearance-none"
                    style={{ MozAppearance: 'textfield' }}
                />
                <div className="flex flex-col gap-2">
                    <motion.button onClick={handleIncrement} className="p-2 bg-gray-700/50 rounded-full hover:bg-gray-600 transition-colors" whileTap={{ scale: 0.9 }}>
                        <ChevronUp size={24} />
                    </motion.button>
                    <motion.button onClick={handleDecrement} className="p-2 bg-gray-700/50 rounded-full hover:bg-gray-600 transition-colors" whileTap={{ scale: 0.9 }}>
                        <ChevronDown size={24} />
                    </motion.button>
                </div>
            </div>
            {/* Static kg label */}
            <div className="flex gap-2 p-1 rounded-full">
                <span className="px-4 py-1 rounded-full text-sm font-semibold bg-[#B1F82A] text-black">kg</span>
            </div>
        </div>
    );
};

/** Single decimal height input in ft (e.g. 5.9) */
const HeightInput = ({ value, onValueChange }) => {
    const handleIncrement = () => onValueChange((Math.round((Number(value) + 0.1) * 10) / 10).toString());
    const handleDecrement = () => {
        const next = Math.round((Number(value) - 0.1) * 10) / 10;
        if (next > 0) onValueChange(next.toString());
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <h3 className="text-xl font-semibold text-white">
                Your <span className="text-[#B1F82A]">Height</span>
            </h3>
            <div className="flex items-center gap-4">
                <input
                    type="number"
                    value={value}
                    step="0.1"
                    onChange={(e) => onValueChange(e.target.value)}
                    className="w-48 text-center bg-transparent text-6xl font-bold text-white focus:outline-none appearance-none"
                    style={{ MozAppearance: 'textfield' }}
                />
                <div className="flex flex-col gap-2">
                    <motion.button onClick={handleIncrement} className="p-2 bg-gray-700/50 rounded-full hover:bg-gray-600 transition-colors" whileTap={{ scale: 0.9 }}>
                        <ChevronUp size={24} />
                    </motion.button>
                    <motion.button onClick={handleDecrement} className="p-2 bg-gray-700/50 rounded-full hover:bg-gray-600 transition-colors" whileTap={{ scale: 0.9 }}>
                        <ChevronDown size={24} />
                    </motion.button>
                </div>
            </div>
            {/* Static ft label */}
            <div className="flex gap-2 p-1 rounded-full">
                <span className="px-4 py-1 rounded-full text-sm font-semibold bg-[#B1F82A] text-black">ft</span>
            </div>
        </div>
    );
};

// Step 1 card — no Back button (it's the first step)
const BodyMeasurementForm = ({ formData, setFormData, onNext }) => (
    <div className="w-full max-w-2xl bg-gray-900/50 border border-gray-800 rounded-3xl py-[64px] px-6 sm:px-8 lg:px-10 shadow-2xl text-center">
        <h2 className="text-3xl font-bold text-white mb-12">
            Your <span className="text-[#B1F82A]">Measurements</span>
        </h2>
        <div className="flex flex-col md:flex-row justify-around items-center gap-12 my-8">
            <WeightInput
                value={formData.weight}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, weight: val }))}
            />
            <HeightInput
                value={formData.height}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, height: val }))}
            />
        </div>
        <div className="flex justify-center mt-12">
            <Button onClick={onNext} size="xl" className="w-full sm:w-auto px-10 py-3 text-lg font-semibold rounded-full bg-[#B1F82A] text-black hover:bg-[#B1F82A]/90 transition-all duration-300 shadow-lg">
                Next
            </Button>
        </div>
    </div>
);

// ─── Step 2 — Tell Us About Yourself (+ conditional Focus Areas) ──────────────

const UserDetailsForm = ({
    formData,
    handleChange,
    handleSelectChange,
    handleSliderChange,
    toggleFocusArea,
    onNext,
    onBack,
}) => {
    const showTargetWeight = GOAL_SHOWS_TARGET_WEIGHT.includes(formData.goal);
    const showFocusAreas = GOAL_SHOWS_FOCUS_AREAS.includes(formData.goal);

    return (
        <div className="w-full max-w-2xl bg-gray-900/50 border border-gray-800 rounded-3xl py-[64px] px-6 sm:px-8 lg:px-10 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
                Tell Us About <span className="text-[#B1F82A]">Yourself</span>
            </h2>

            <div className="space-y-8">
                {/* Age */}
                <div>
                    <Label htmlFor="age" className="text-gray-300">Age *</Label>
                    <Input
                        type="number" id="age" name="age"
                        value={formData.age} onChange={handleChange}
                        placeholder="e.g., 30" min={10} max={120}
                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 mt-2 rounded-none border"
                    />
                </div>

                {/* Gender */}
                <div>
                    <Label className="text-gray-300">Gender *</Label>
                    <Select name="gender" onValueChange={(v) => handleSelectChange('gender', v)} value={formData.gender}>
                        <SelectTrigger className={selectCls}><SelectValue placeholder="Select Gender" /></SelectTrigger>
                        <SelectContent position="popper" sideOffset={4} className={selectContentCls}>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer Not To Say</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Goal + Fitness level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label className="text-gray-300">Fitness Goal *</Label>
                        <Select name="goal" onValueChange={(v) => handleSelectChange('goal', v)} value={formData.goal}>
                            <SelectTrigger className={selectCls}><SelectValue placeholder="Select your primary goal" /></SelectTrigger>
                            <SelectContent position="popper" sideOffset={4} className={selectContentCls}>
                                <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                                <SelectItem value="fat-loss">Fat Loss</SelectItem>
                                <SelectItem value="strength">Strength</SelectItem>
                                <SelectItem value="body-recomposition">Body Recomposition</SelectItem>
                                <SelectItem value="general-fitness">General Fitness</SelectItem>
                                <SelectItem value="endurance">Endurance</SelectItem>
                                <SelectItem value="athletic-performance">Athletic Performance</SelectItem>
                                <SelectItem value="flexibility-mobility">Flexibility &amp; Mobility</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="text-gray-300">Current Fitness Level *</Label>
                        <Select name="fitnessLevel" onValueChange={(v) => handleSelectChange('fitnessLevel', v)} value={formData.fitnessLevel}>
                            <SelectTrigger className={selectCls}><SelectValue placeholder="Select your fitness level" /></SelectTrigger>
                            <SelectContent position="popper" sideOffset={4} className={selectContentCls}>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Focus Areas — only visible when goal is muscle/strength-related */}
                <AnimatePresence>
                    {showFocusAreas && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Label className="text-gray-300 mb-4 block">
                                Areas to focus on *
                            </Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {focusAreasData.map((area) => (
                                    <motion.button
                                        key={area}
                                        type="button"
                                        onClick={() => toggleFocusArea(area)}
                                        className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-full transition-all duration-300 transform
                                            ${formData.focusAreas.includes(area)
                                                ? 'bg-[#B1F82A] text-black border-transparent'
                                                : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
                                            }`}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        {formData.focusAreas.includes(area) ? <Check size={16} /> : <Plus size={16} />}
                                        <span className="font-semibold text-sm">{area}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Target weight — conditional on fat-loss / body-recomposition (kg only) */}
                <AnimatePresence>
                    {showTargetWeight && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Label className="text-gray-300">Target Weight (kg)</Label>
                            <Input
                                type="number" name="targetWeight"
                                value={formData.targetWeight} onChange={handleChange}
                                placeholder="e.g., 75"
                                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 mt-2 rounded-none border"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Days per week */}
                <div>
                    <Label htmlFor="daysPerWeek" className="flex justify-between items-center text-gray-300">
                        <span>Workout Days Per Week</span>
                        <span className="text-[#B1F82A] font-bold text-lg">{formData.daysPerWeek}</span>
                    </Label>
                    <Slider
                        id="daysPerWeek" min={1} max={7} step={1}
                        value={[formData.daysPerWeek]} onValueChange={handleSliderChange}
                        className="mt-4 [&_[role=slider]]:bg-[#B1F82A] [&_[role=slider]]:border-[#B1F82A] [&_[role=slider]]:shadow-none [&>.bg-primary]:bg-[#B1F82A] [&_[data-slot=slider-range]]:bg-[#B1F82A]"
                    />
                </div>

                {/* Navigation */}
                <div className="flex justify-between gap-4 mt-10">
                    <Button type="button" size="xl" onClick={onBack} className="flex-1 px-6 py-3 text-lg font-semibold rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-all duration-300">
                        Back
                    </Button>
                    <Button type="button" size="xl" onClick={onNext} className="flex-1 px-6 py-3 text-lg font-semibold rounded-full bg-[#B1F82A] text-black hover:bg-[#B1F82A]/90 transition-all duration-300 shadow-lg">
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ─── Step 3 — Workout Preferences + Equipment ─────────────────────────────────

const WorkoutPreferencesForm = ({
    formData,
    handleSelectChange,
    handleCheckboxChange,
    onNext,
    onBack,
}) => (
    <div className="w-full max-w-2xl bg-gray-900/50 border border-gray-800 rounded-3xl py-[64px] px-6 sm:px-8 lg:px-10 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Workout <span className="text-[#B1F82A]">Preferences</span>
        </h2>

        <div className="space-y-8">
            {/* Workout Location */}
            <div>
                <Label className="text-gray-300">Workout Location *</Label>
                <Select name="workoutLocation" onValueChange={(v) => handleSelectChange('workoutLocation', v)} value={formData.workoutLocation}>
                    <SelectTrigger className={selectCls}><SelectValue placeholder="Select workout location" /></SelectTrigger>
                    <SelectContent position="popper" sideOffset={4} className={selectContentCls}>
                        <SelectItem value="commercial-gym">Commercial Gym</SelectItem>
                        <SelectItem value="home-gym">Home Gym (Well Equipped)</SelectItem>
                        <SelectItem value="home-limited">Home (Limited Equipment)</SelectItem>
                        <SelectItem value="home-none">Home (No Equipment)</SelectItem>
                        <SelectItem value="outdoors">Outdoors</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Session Duration */}
            <div>
                <Label className="text-gray-300">Session Duration *</Label>
                <Select name="sessionDuration" onValueChange={(v) => handleSelectChange('sessionDuration', v)} value={formData.sessionDuration}>
                    <SelectTrigger className={selectCls}><SelectValue placeholder="Select session duration" /></SelectTrigger>
                    <SelectContent position="popper" sideOffset={4} className={selectContentCls}>
                        <SelectItem value="20min">20 minutes</SelectItem>
                        <SelectItem value="30min">30 minutes</SelectItem>
                        <SelectItem value="45min">45 minutes</SelectItem>
                        <SelectItem value="60min">60 minutes</SelectItem>
                        <SelectItem value="90min">90 minutes</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Activity Level */}
            <div>
                <Label className="text-gray-300">Activity Level (outside workouts) *</Label>
                <Select name="activityLevel" onValueChange={(v) => handleSelectChange('activityLevel', v)} value={formData.activityLevel}>
                    <SelectTrigger className={selectCls}><SelectValue placeholder="Select activity level" /></SelectTrigger>
                    <SelectContent position="popper" sideOffset={4} className={selectContentCls}>
                        <SelectItem value="sedentary">Sedentary (desk job, mostly sitting)</SelectItem>
                        <SelectItem value="lightly-active">Lightly Active (light walking)</SelectItem>
                        <SelectItem value="moderately-active">Moderately Active (on feet often)</SelectItem>
                        <SelectItem value="very-active">Very Active (physical job / sport)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Equipment */}
            <div>
                <Label className="text-gray-300 mb-3 block">Available Equipment</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {equipmentData.map((eq) => (
                        <CheckboxRow
                            key={eq.id}
                            id={`equipment-${eq.id}`}
                            label={eq.label}
                            checked={!!formData.equipment[eq.id]}
                            onCheckedChange={(checked) => handleCheckboxChange('equipment', eq.id, checked)}
                        />
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between gap-4 mt-10">
                <Button type="button" size="xl" onClick={onBack} className="flex-1 px-6 py-3 text-lg font-semibold rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-all duration-300">
                    Back
                </Button>
                <Button type="button" size="xl" onClick={onNext} className="flex-1 px-6 py-3 text-lg font-semibold rounded-full bg-[#B1F82A] text-black hover:bg-[#B1F82A]/90 transition-all duration-300 shadow-lg">
                    Next
                </Button>
            </div>
        </div>
    </div>
);

// ─── Step 4 — Health & Training ───────────────────────────────────────────────

const HealthAndTrainingForm = ({
    formData,
    handleChange,
    handleCheckboxChange,
    handleSubmit,
    onBack,
    isLoading,
}) => (
    <div className="w-full max-w-2xl bg-gray-900/50 border border-gray-800 rounded-3xl py-[64px] px-6 sm:px-8 lg:px-10 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Health &amp; <span className="text-[#B1F82A]">Training</span>
        </h2>

        <div className="space-y-8">
            {/* Injuries */}
            <div>
                <Label className="text-gray-300 mb-3 block">Any injuries or physical limitations?</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {injuryOptions.map((opt) => (
                        <CheckboxRow
                            key={opt.id}
                            id={`injury-${opt.id}`}
                            label={opt.label}
                            checked={formData.injuries.includes(opt.id)}
                            onCheckedChange={(checked) => handleCheckboxChange('injuries', opt.id, checked)}
                        />
                    ))}
                </div>
                {formData.injuries.some(i => i !== 'none') && (
                    <Textarea
                        name="injuryDetails"
                        value={formData.injuryDetails}
                        onChange={handleChange}
                        placeholder="Describe your injuries or limitations..."
                        className="mt-3 bg-gray-800 border-gray-700 text-white placeholder-gray-500 rounded-none border"
                    />
                )}
            </div>

            {/* Medical Conditions */}
            <div>
                <Label className="text-gray-300 mb-3 block">Any medical conditions?</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {medicalConditionOptions.map((opt) => (
                        <CheckboxRow
                            key={opt.id}
                            id={`medical-${opt.id}`}
                            label={opt.label}
                            checked={formData.medicalConditions.includes(opt.id)}
                            onCheckedChange={(checked) => handleCheckboxChange('medicalConditions', opt.id, checked)}
                        />
                    ))}
                </div>
                {formData.medicalConditions.some(c => c !== 'none') && (
                    <Textarea
                        name="medicalConditionDetails"
                        value={formData.medicalConditionDetails}
                        onChange={handleChange}
                        placeholder="Describe your medical conditions..."
                        className="mt-3 bg-gray-800 border-gray-700 text-white placeholder-gray-500 rounded-none border"
                    />
                )}
            </div>

            {/* Exercise Preferences */}
            <div>
                <Label className="text-gray-300 mb-3 block">Preferred training styles (optional)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {exercisePreferenceOptions.map((opt) => (
                        <CheckboxRow
                            key={opt.id}
                            id={`pref-${opt.id}`}
                            label={opt.label}
                            checked={formData.exercisePreferences.includes(opt.id)}
                            onCheckedChange={(checked) => handleCheckboxChange('exercisePreferences', opt.id, checked)}
                        />
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between gap-4 mt-10">
                <Button type="button" size="xl" onClick={onBack} disabled={isLoading} className="flex-1 px-6 py-3 text-lg font-semibold rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                    Back
                </Button>
                <Button type="button" size="xl" onClick={handleSubmit} disabled={isLoading} className="flex-1 px-6 py-3 text-lg font-semibold rounded-full bg-[#B1F82A] text-black hover:bg-[#B1F82A]/90 transition-all duration-300 shadow-lg disabled:opacity-80 disabled:cursor-not-allowed">
                    Generate Workout
                </Button>
            </div>
        </div>
    </div>
);

// ─── Root questionnaire component ─────────────────────────────────────────────

const TOTAL_STEPS = 4;

const QuestionnaireForm = ({ initialGender }) => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [status, setStatus] = useState("idle");
    const isLoading = status !== "idle";

    const [formData, setFormData] = useState(DEFAULT_FORM_DATA);

    // ── Restore draft from localStorage on mount ───────────────────────────
    useEffect(() => {
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (raw) {
                const draft = JSON.parse(raw);
                if (draft.formData) setFormData(draft.formData);
                if (draft.currentStep && draft.currentStep >= 1 && draft.currentStep <= TOTAL_STEPS) {
                    setStep(draft.currentStep);
                }
            }
        } catch {
            // Corrupt draft — ignore and start fresh
        }
    }, []);

    // ── Apply initialGender prop (overrides draft if provided) ────────────
    useEffect(() => {
        if (initialGender) {
            setFormData((prev) => ({ ...prev, gender: initialGender }));
        }
    }, [initialGender]);

    // ── Auto-save draft to localStorage whenever step or formData changes ──
    useEffect(() => {
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify({ currentStep: step, formData }));
        } catch {
            // Storage unavailable — fail silently
        }
    }, [step, formData]);

    // ── Step navigation ────────────────────────────────────────────────────

    const handleNextStep = () => {
        let error = null;
        if (step === 1) error = validateStep1(formData);
        if (step === 2) error = validateStep2(formData);
        if (step === 3) error = validateStep3(formData);
        if (error) {
            toast.error(error.title, { description: error.description });
            return;
        }
        setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    };

    const handlePrevStep = () => setStep((prev) => Math.max(prev - 1, 1));

    // ── Field handlers ─────────────────────────────────────────────────────

    const toggleFocusArea = (area) =>
        setFormData((prev) => ({
            ...prev,
            focusAreas: prev.focusAreas.includes(area)
                ? prev.focusAreas.filter((a) => a !== area)
                : [...prev.focusAreas, area],
        }));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };
            if (name === 'goal' && !GOAL_SHOWS_FOCUS_AREAS.includes(value)) {
                updated.focusAreas = [];
            }
            return updated;
        });
    };

    const handleSliderChange = (value) =>
        setFormData((prev) => ({ ...prev, daysPerWeek: value[0] }));

    const handleCheckboxChange = (field, id, checked) => {
        setFormData((prev) => {
            const current = prev[field];
            if (Array.isArray(current)) {
                if (id === 'none' && checked) return { ...prev, [field]: ['none'] };
                if (id !== 'none' && checked) return { ...prev, [field]: [...current.filter(v => v !== 'none'), id] };
                return { ...prev, [field]: current.filter(v => v !== id) };
            }
            return { ...prev, [field]: { ...current, [id]: checked } };
        });
    };

    // ── Form submit → streaming /api/generate-workout ──────────────────────

    const handleSubmit = async () => {
        const error = validateStep4(formData);
        if (error) {
            toast.error(error.title, { description: error.description });
            return;
        }

        setStatus("saving-profile");

        // Flatten equipment object → array of selected keys
        const equipmentList = Object.entries(formData.equipment)
            .filter(([, selected]) => selected)
            .map(([key]) => key);

        const payload = {
            age: formData.age,
            gender: formData.gender,
            weight: formData.weight,
            weightUnit: 'kg',
            height: Number(formData.height),
            heightUnit: 'ft',
            goal: formData.goal,
            fitnessLevel: formData.fitnessLevel,
            targetWeight: formData.targetWeight,
            targetWeightUnit: 'kg',
            daysPerWeek: formData.daysPerWeek,
            equipment: formData.equipment,
            focusAreas: formData.focusAreas,
            workoutLocation: formData.workoutLocation,
            sessionDuration: formData.sessionDuration,
            activityLevel: formData.activityLevel,
            injuries: formData.injuries,
            injuryDetails: formData.injuryDetails,
            medicalConditions: formData.medicalConditions,
            medicalConditionDetails: formData.medicalConditionDetails,
            exercisePreferences: formData.exercisePreferences,
        };

        try {
            const res = await fetch('/api/generate-workout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok || !res.body) {
                const data = await res.json().catch(() => ({}));
                toast.error('Failed to generate plan', { description: data.error || 'Something went wrong. Please try again.' });
                setStatus("idle");
                return;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop();

                for (const line of lines) {
                    if (!line.trim()) continue;
                    let event;
                    try { event = JSON.parse(line); } catch { continue; }

                    if (event.step === "error") {
                        toast.error('Failed to generate plan', { description: event.message || 'Something went wrong. Please try again.' });
                        setStatus("idle");
                        return;
                    }

                    if (event.step === "completed") {
                        setStatus("completed");
                        sessionStorage.setItem('workoutPlan', JSON.stringify({
                            ...event.generatedPlan,
                            planId: event.planId,
                            formId: event.formId,
                            userInfo: {
                                gender: formData.gender,
                                age: formData.age,
                                weight: formData.weight,
                                weightUnit: 'kg',
                                height: formData.height,
                                heightUnit: 'ft',
                                goal: formData.goal,
                                fitnessLevel: formData.fitnessLevel,
                                focusAreas: formData.focusAreas,
                                daysPerWeek: formData.daysPerWeek,
                                workoutLocation: formData.workoutLocation,
                                sessionDuration: formData.sessionDuration,
                                activityLevel: formData.activityLevel,
                                injuries: formData.injuries,
                                medicalConditions: formData.medicalConditions,
                                exercisePreferences: formData.exercisePreferences,
                            },
                        }));

                        // ── Clear draft after successful generation ─────────
                        try { localStorage.removeItem(DRAFT_KEY); } catch { }

                        await new Promise((r) => setTimeout(r, 800));
                        router.push('/workout-result');
                        return;
                    }

                    if (STATUS_MESSAGES[event.step]) {
                        setStatus(event.step);
                    }
                }
            }
        } catch (err) {
            console.error("Stream error:", err);
            toast.error('Network error', { description: 'Could not reach the server. Check your connection and try again.' });
            setStatus("idle");
        }
    };

    // ── Animation ──────────────────────────────────────────────────────────

    const formVariants = {
        hidden: { opacity: 0, x: '100%' },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
        exit: { opacity: 0, x: '-100%', transition: { duration: 0.5, ease: 'easeInOut' } },
    };

    return (
        <>
            <AnimatePresence>
                {isLoading && <LoadingOverlay status={status} />}
            </AnimatePresence>

            <div className="min-h-screen flex items-center justify-center py-[120px] px-4 sm:px-6 lg:px-8 bg-[#0C0C0C] overflow-hidden">
                <AnimatePresence mode="wait">
                    {/* ── Step 1: Body Measurements ── */}
                    {step === 1 && (
                        <motion.div key="step1" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="w-full flex justify-center">
                            <BodyMeasurementForm
                                formData={formData}
                                setFormData={setFormData}
                                onNext={handleNextStep}
                            />
                        </motion.div>
                    )}

                    {/* ── Step 2: Tell Us About Yourself ── */}
                    {step === 2 && (
                        <motion.div key="step2" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="w-full flex justify-center">
                            <UserDetailsForm
                                formData={formData}
                                handleChange={handleChange}
                                handleSelectChange={handleSelectChange}
                                handleSliderChange={handleSliderChange}
                                toggleFocusArea={toggleFocusArea}
                                onNext={handleNextStep}
                                onBack={handlePrevStep}
                            />
                        </motion.div>
                    )}

                    {/* ── Step 3: Workout Preferences ── */}
                    {step === 3 && (
                        <motion.div key="step3" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="w-full flex justify-center">
                            <WorkoutPreferencesForm
                                formData={formData}
                                handleSelectChange={handleSelectChange}
                                handleCheckboxChange={handleCheckboxChange}
                                onNext={handleNextStep}
                                onBack={handlePrevStep}
                            />
                        </motion.div>
                    )}

                    {/* ── Step 4: Health & Training ── */}
                    {step === 4 && (
                        <motion.div key="step4" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="w-full flex justify-center">
                            <HealthAndTrainingForm
                                formData={formData}
                                handleChange={handleChange}
                                handleCheckboxChange={handleCheckboxChange}
                                handleSubmit={handleSubmit}
                                onBack={handlePrevStep}
                                isLoading={isLoading}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default QuestionnaireForm;