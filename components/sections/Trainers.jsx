"use client";

import Image from "next/image";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

const trainers = [
    {
        name: "Jessica Miles",
        specialty: "HIIT & Cardio",
        imageAlt: "Portrait of Jessica Miles, a fitness trainer",
        imageSrc: "/trainer1.webp",
    },
    {
        name: "Mark Johnson",
        specialty: "Strength & Bodybuilding",
        imageAlt: "Portrait of Mark Johnson, a fitness trainer",
        imageSrc: "/trainer2.webp",
    },
    {
        name: "Emily Chen",
        specialty: "Yoga & Flexibility",
        imageAlt: "Portrait of Emily Chen, a fitness trainer",
        imageSrc: "/trainer3.webp",
    },
    {
        name: "David Lee",
        specialty: "Functional Fitness",
        imageAlt: "Portrait of David Lee, a fitness trainer lifting a dumbbell",
        imageSrc: "/trainer4.webp",
    },
    {
        name: "Sophia Rodriguez",
        specialty: "CrossFit & Endurance",
        imageAlt: "Portrait of Sophia Rodriguez, a fitness trainer in a stretching pose",
        imageSrc: "/trainer5.webp",
    },
];

export default function Trainers() {
    return (
        <section className="bg-[#0C0C0C] py-20 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl lg:max-w-4xl mx-auto text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Meet Our <span className="text-[#B1F82A]">World-Class</span> Trainers
                    </h2>
                    <p className="mt-4 text-lg text-gray-400">
                        Our certified experts are here to guide you on your fitness journey, no matter your goal.
                    </p>
                </div>

                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                        {trainers.map((trainer, index) => (
                            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                <div className="p-1">
                                    <div className="group relative flex flex-col h-full bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden p-6 transition-all">
                                        <div className="relative rounded-lg overflow-hidden mb-6 aspect-[4/5]">
                                            <Image
                                                src={trainer.imageSrc}
                                                alt={trainer.imageAlt}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">{trainer.name}</h3>
                                        <p className="text-[#B1F82A] font-semibold">{trainer.specialty}</p>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="text-white bg-gray-800 hover:bg-[#1e04fb] hover:text-white" />
                    <CarouselNext className="text-white bg-gray-800 hover:bg-[#1e04fb] hover:text-white" />
                </Carousel>
            </div>
        </section>
    );
}