"use client";

import { Dumbbell, Flame, Leaf } from 'lucide-react';

const workoutCategories = [
    {
        title: 'Body Building',
        description: 'Sculpt and strengthen your physique with targeted muscle growth programs.',
        icon: <Dumbbell className="h-10 w-10 text-[#B1F82A]" />,
        intensity: [
            { label: 'Strength', value: 90 },
            { label: 'Hypertrophy', value: 75 },
            { label: 'Cardio', value: 25 },
        ],
    },
    {
        title: 'Calorie Burning',
        description: 'Boost your metabolism and shed unwanted fat with high-intensity cardio and circuits.',
        icon: <Flame className="h-10 w-10 text-[#B1F82A]" />,
        intensity: [
            { label: 'Cardio', value: 95 },
            { label: 'HIIT', value: 85 },
            { label: 'Endurance', value: 70 },
        ],
    },
    {
        title: 'Overall Flexibility',
        description: 'Improve your range of motion, reduce stiffness, and enhance recovery with dynamic stretches.',
        icon: <Leaf className="h-10 w-10 text-[#B1F82A]" />,
        intensity: [
            { label: 'Mobility', value: 90 },
            { label: 'Stretching', value: 80 },
            { label: 'Balance', value: 65 },
        ],
    },
];

function IntensityBar({ label, value }) {
    return (
        <div className="w-full text-left">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                    {label}
                </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                    className="bg-[#1e04fb] h-2.5 rounded-full"
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}

export default function WorkoutTypes() {
    return (
        <section className="bg-[#0C0C0C] py-20 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl lg:max-w-4xl mx-auto text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Explore Our <span className="text-[#B1F82A]">Workout Types</span>
                    </h2>
                    <p className="mt-4 text-lg text-gray-400">
                        Find the perfect training style to match your fitness aspirations.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {workoutCategories.map((category, index) => (
                        <div
                            key={index}
                            className="relative p-8 rounded-2xl bg-gray-900/50 border border-gray-800 flex flex-col transition-all duration-300"
                        >
                            <div className="flex flex-col items-center text-center flex-grow">
                                <div className="mb-4">{category.icon}</div>
                                <h3 className="text-xl font-bold text-white">{category.title}</h3>
                                <p className="mt-2 text-gray-300 flex-grow">{category.description}</p>
                            </div>

                            <div className="w-full mt-6 mb-8 space-y-4">
                                {category.intensity.map((item) => (
                                    <IntensityBar key={item.label} label={item.label} value={item.value} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}