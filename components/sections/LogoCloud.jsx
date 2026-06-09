"use client";

import { motion } from "framer-motion";

const logos = [
    "FIT-FORCE",
    "Zenith",
    "Apex",
    "Synergy",
    "Momentum",
    "Vigor",
    "Pulse",
    "Elevate",
];

export default function LogoCloud() {
    return (
        <div className="py-12 bg-[#0C0C0C] sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-center text-lg font-semibold text-gray-400">
                    Trusted by top fitness enthusiasts worldwide
                </h2>
                <div className="mt-8 relative w-full overflow-hidden">
                    <motion.div
                        className="flex w-max"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 20,
                            ease: "linear",
                        }}
                    >
                        {[...logos, ...logos].map((logo, index) => (
                            <div
                                key={index}
                                className="flex-shrink-0 mx-8 flex items-center justify-center"
                            >
                                <span className="text-2xl font-bold text-gray-500 tracking-wider">
                                    {logo}
                                </span>
                            </div>
                        ))}
                    </motion.div>

                    {/* Fade edges */}
                    <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0C0C0C] to-transparent pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0C0C0C] to-transparent pointer-events-none" />
                </div>
            </div>
        </div>
    );
}