import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Users, Download, ArrowRight } from 'lucide-react';

const steps = [
    {
        icon: Settings,
        title: "Create Studio",
        desc: "Set up your virtual studio in seconds. Custom name, logo, and pre-recording checks."
    },
    {
        icon: Users,
        title: "Invite Guests",
        desc: "Send a magic link to your guests. No account or app download required to join."
    },
    {
        icon: Download,
        title: "Record & Download",
        desc: "Record locally in 4K. Download separate tracks once the session ends."
    }
];

const HowItWorks = () => {
    return (
        <section id="how-it-works" className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple 3-step workflow</h2>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto">
                        From setup to final tracks, PodNest makes professional recording effortless.
                    </p>
                </div>

                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                    {/* Connector Line (Desktop) */}
                    <div className="absolute top-1/4 left-0 w-full h-px border-t-2 border-dashed border-white/10 hidden md:block -z-10" />

                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.2 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center text-center p-8 rounded-[40px] glass group hover:border-accent-purple/30 transition-all"
                        >
                            <div className="w-20 h-20 rounded-3xl bg-accent-purple/10 flex items-center justify-center mb-8 relative group-hover:scale-110 transition-transform">
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-accent-purple flex items-center justify-center text-sm font-bold shadow-lg">
                                    {i + 1}
                                </div>
                                <step.icon className="w-10 h-10 text-accent-purple" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                            <p className="text-white/50 leading-relaxed">
                                {step.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
