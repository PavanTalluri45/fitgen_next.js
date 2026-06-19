"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function CallToAction() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [rateLimitInfo, setRateLimitInfo] = useState(null);
    const [rateLimitLoading, setRateLimitLoading] = useState(false);
    const navigating = useRef(false);

    const fetchRateLimit = useCallback(async () => {
        setRateLimitLoading(true);
        try {
            const res = await fetch("/api/check-rate-limit");
            if (res.ok) {
                const data = await res.json();
                setRateLimitInfo(data);
                return data;
            }
        } catch {
        } finally {
            setRateLimitLoading(false);
        }
        return null;
    }, []);

    useEffect(() => {
        if (!loading && user) {
            fetchRateLimit();
        }
    }, [loading, user, fetchRateLimit]);

    const handleGeneratePlan = useCallback(async () => {
        if (!user) {
            router.push("/login");
            return;
        }

        if (navigating.current) return;
        navigating.current = true;

        try {
            let info = rateLimitInfo;
            if (info === null) {
                info = await fetchRateLimit();
            }

            if (info && !info.canGenerate) {
                toast.error("Plan generation unavailable", {
                    description: `You already generated a workout plan. Your next plan will be available in ${info.remainingTimeLabel}.`,
                    duration: 5000,
                });
                return;
            }

            router.push("/plan-builder");
        } finally {
            navigating.current = false;
        }
    }, [user, rateLimitInfo, fetchRateLimit, router]);

    const isButtonLoading = !loading && user && (rateLimitLoading && rateLimitInfo === null);

    return (
        <section className="bg-[#0C0C0C] py-20 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 sm:p-12 lg:p-16 overflow-hidden">

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">

                        {/* Left - Text */}
                        <div className="lg:w-1/2 text-center lg:text-left">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                                Ready for Your <span className="text-[#B1F82A]">Transformation?</span>
                            </h2>
                            <p className="mt-4 text-lg text-gray-300">
                                Stop guessing, start training. Get your personalized workout plan in minutes
                                and take the first step towards a stronger, healthier you.
                            </p>
                            <div className="mt-8">
                                <Button
                                    size="xl"
                                    onClick={handleGeneratePlan}
                                    disabled={isButtonLoading}
                                    className="px-8 py-3 bg-[#B1F82A] text-black font-semibold rounded-full hover:bg-[#B1F82A]/90 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-wait"
                                >
                                    {isButtonLoading ? "Checking..." : "Generate New Plan"}
                                </Button>
                            </div>
                        </div>

                        {/* Right - Image */}
                        <div className="relative mt-6 sm:mt-8 lg:mt-0 lg:w-1/2 flex justify-center items-center">
                            <div className="relative w-full max-w-lg h-56 sm:h-72 lg:h-80 rounded-xl overflow-hidden shadow-2xl">
                                <Image
                                    src="/calltoanactionimage.webp"
                                    alt="Man lifting weights"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Background glow blobs */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#B1F82A] rounded-full filter blur-3xl" />
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#1E04FB] rounded-full filter blur-3xl" />
                    </div>

                </div>
            </div>
        </section>
    );
}