"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const Card = ({ className, children }) => (
    <div className={cn("relative group rounded-3xl p-6 flex flex-col justify-between", className)}>
        {children}
    </div>
);

export default function BentoGrid() {
    return (
        <section className="bg-[#0C0C0C] py-20 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-[600px]">

                    {/* Large card - Community */}
                    <Card className="md:col-span-2 md:row-span-2 bg-gray-900 overflow-hidden">
                        <div className="flex flex-col h-full">
                            <p className="text-sm font-semibold text-gray-400">OUR COMMUNITY</p>
                            <h3 className="text-3xl font-bold text-white mt-2">
                                More than just a workout.
                            </h3>
                            <div className="flex-grow mt-4 relative rounded-2xl overflow-hidden">
                                <Image
                                    src="/communityimage.webp"
                                    alt="Group of people running together outdoors"
                                    fill
                                    className="object-cover transition-transform duration-500"
                                    sizes="(max-width: 768px) 100vw, 66vw"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Blog card */}
                    <Card className="bg-gray-800 text-white overflow-hidden">
                        <Image
                            src="/blogimage.jpg"
                            alt="Abstract colorful spheres"
                            fill
                            className="object-cover opacity-10 transition-opacity duration-300 rounded-3xl"
                            sizes="(max-width: 768px) 100vw, 33vw"
                        />
                        <div className="relative">
                            <p className="text-sm font-semibold text-gray-400">WORLD OF FITNESS</p>
                            <h3 className="text-3xl font-bold mt-4">View our blog</h3>
                        </div>
                    </Card>

                    {/* Bottom two small cards */}
                    <div className="grid grid-cols-2 gap-6">
                        <Card className="bg-[#1E04FB] text-white">
                            <p className="text-xs font-bold uppercase tracking-widest opacity-70">Discover</p>
                            <h3 className="mt-auto text-2xl font-bold">About us</h3>
                        </Card>
                        <Card className="bg-[#B1F82A] text-black">
                            <p className="text-xs font-bold uppercase tracking-widest">Have Questions?</p>
                            <h3 className="mt-auto text-2xl font-bold">Contact us</h3>
                        </Card>
                    </div>

                </div>
            </div>
        </section>
    );
}