"use client";

const features = [
    {
        number: '01',
        title: 'Personalized Plans',
        description: 'Get workout routines crafted specifically for your body type, goals, and fitness level.',
    },
    {
        number: '02',
        title: 'Achieve Your Goals',
        description: "Whether it's muscle gain, weight loss, or flexibility, we help you hit your targets faster.",
    },
    {
        number: '03',
        title: 'Track Your Progress',
        description: 'Monitor your improvements and stay motivated with intuitive progress tracking tools.',
    },
];

export default function FeaturesSection() {
    return (
        <section className="bg-[#0C0C0C] py-20 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl lg:max-w-4xl mx-auto text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Why Choose <span className="text-[#B1F82A]">FitGen</span>?
                    </h2>
                    <p className="mt-4 text-lg text-gray-400">
                        Experience the difference with a workout plan designed just for you.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="relative p-8 rounded-2xl bg-gray-900/50 border border-gray-800 flex flex-col items-start text-left transition-all duration-300"
                        >
                            <div className="absolute top-0 left-0 -mt-4 -ml-4 h-16 w-16 flex items-center justify-center rounded-full bg-[#B1F82A] text-black text-2xl font-bold shadow-md">
                                {feature.number}
                            </div>
                            <div className="mt-8">
                                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                                <p className="mt-2 text-gray-300">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}