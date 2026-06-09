"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useAuth } from "@/context/AuthContext";
import { Dumbbell, Activity, Expand as Stretch } from "lucide-react";
import { toast } from "sonner";

export default function HeroSection() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Rate limit state — only fetched once the user is confirmed authenticated
    const [rateLimitInfo, setRateLimitInfo] = useState(null);

    const fetchRateLimit = useCallback(async () => {
        try {
            const res = await fetch("/api/check-rate-limit");
            if (res.ok) {
                const data = await res.json();
                setRateLimitInfo(data);
            }
        } catch {
            // Fail open — don't block the button if the check itself errors
        }
    }, []);

    useEffect(() => {
        if (!loading && user) {
            fetchRateLimit();
        }
    }, [loading, user, fetchRateLimit]);

    const handleGeneratePlan = () => {
        // Guest users → go to login
        if (!user) {
            router.push("/login");
            return;
        }

        // Authenticated but still within 72-hour window → show toast, don't navigate
        if (rateLimitInfo && !rateLimitInfo.canGenerate) {
            toast.error("Plan generation unavailable", {
                description: `You already generated a workout plan. Your next plan will be available in ${rateLimitInfo.remainingTimeLabel}.`,
                duration: 5000,
            });
            return;
        }

        // Good to go
        router.push("/plan-builder");
    };

    return (
        <section className="relative w-full min-h-screen h-auto flex flex-col items-center justify-center overflow-hidden py-16 md:h-screen md:py-0">
            {/* Navbar */}
            <div className="absolute top-8 left-4 sm:left-6 lg:left-8 right-4 sm:right-6 lg:right-8 z-20 flex items-center justify-between text-white">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                    <Dumbbell className="h-10 w-10 text-[#B1F82A]" />
                    <span className="text-3xl font-bold">FitGen</span>
                </div>

                {/* Auth Controls */}
                <div className="flex items-center gap-3">
                    {!loading && (
                        <>
                            {user ? (
                                /* Authenticated — show avatar */
                                <UserAvatar />
                            ) : (
                                /* Guest — show Login + Signup */
                                <>
                                    <a href="/login">
                                        <Button
                                            className="h-11 rounded-full border border-white/20 text-white bg-transparent hover:bg-[#B1F82A] hover:text-black hover:border-[#B1F82A] transition-all duration-300 px-6 font-semibold"
                                        >
                                            Login
                                        </Button>
                                    </a>
                                    <a href="/signup">
                                        <Button
                                            className="h-11 rounded-full bg-[#B1F82A] text-black hover:bg-[#B1F82A]/90 px-6 font-semibold shadow-lg shadow-[#B1F82A]/20 transition-all duration-300"
                                        >
                                            Sign Up
                                        </Button>
                                    </a>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Background */}
            <div className="absolute inset-0">
                <Image
                    src="/herosectionimage.webp"
                    alt="Athlete working out with dumbbells on a rooftop at sunset"
                    className="w-full h-full object-cover"
                    fill
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-24 md:pt-0">
                <div className="max-w-lg">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[0.95] mt-10">
                        Unlock Your <span className="text-[#B1F82A]">Potential</span>
                        <br />
                        Personalized Workouts
                    </h1>
                    <p className="mt-4 text-lg text-gray-300 max-w-md">
                        Generate custom workout plans tailored to your body, goals, and fitness level.
                        Start your transformation today!
                    </p>
                    <div className="mt-8">
                        <Button
                            size="xl"
                            onClick={handleGeneratePlan}
                            className="bg-[#B1F82A] text-black hover:bg-[#B1F82A]/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            Generate workout plan
                        </Button>
                    </div>
                </div>

                {/* Feature Cards */}
                <div className="flex flex-col gap-4 justify-center mt-8 md:mt-0">
                    <div className="cursor-pointer bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex items-center text-left">
                        <Dumbbell size={32} className="text-[#B1F82A] mr-4 flex-shrink-0" />
                        <div>
                            <h3 className="text-lg font-bold text-white">Strength</h3>
                            <p className="text-gray-300 text-sm">Build muscle and power with our targeted workouts.</p>
                        </div>
                    </div>
                    <div className="cursor-pointer bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex items-center text-left">
                        <Activity size={32} className="text-[#B1F82A] mr-4 flex-shrink-0" />
                        <div>
                            <h3 className="text-lg font-bold text-white">Endurance</h3>
                            <p className="text-gray-300 text-sm">Boost your stamina and go the extra mile.</p>
                        </div>
                    </div>
                    <div className="cursor-pointer bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex items-center text-left">
                        <Stretch size={32} className="text-[#B1F82A] mr-4 flex-shrink-0" />
                        <div>
                            <h3 className="text-lg font-bold text-white">Mobility</h3>
                            <p className="text-gray-300 text-sm">Improve flexibility and range of motion for life.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}