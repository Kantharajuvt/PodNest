import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
    {
        name: "Caleb Johnson",
        role: "Founding Producer, Tech Daily",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Caleb",
        quote: "PodNest has completely changed my production workflow. The local 4K recording is a game changer for remote interviews. I no longer worry about a guest's weak Wi-Fi ruining a take."
    },
    {
        name: "Elena Rodriguez",
        role: "Host, The Creative Edge",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
        quote: "The separate tracks are perfect. It saves me hours in post-production. The interface is intuitive, and my guests always comment on how professional it looks and feels."
    },
    {
        name: "Marcus Thorne",
        role: "Creative Director, Visionary Media",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
        quote: "We've tried every platform available, and nothing competes with PodNest's stability. The AI transcription is also shockingly accurate. It's an all-in-one powerhouse."
    }
];

const Testimonials = () => {
    const [index, setIndex] = useState(0);

    const next = () => setIndex((i) => (i + 1) % testimonials.length);
    const prev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

    return (
        <section className="py-24 relative bg-accent-purple/[0.02]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="max-w-xl text-center md:text-left">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Loved by top <br /> creators worldwide.</h2>
                        <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-accent-cyan text-accent-cyan" />)}
                            </div>
                            <span className="font-bold text-lg">5/5 Stars</span>
                        </div>
                        <p className="text-white/50 text-xl font-medium">Join 10,000+ creators who trust PodNest for their professional content.</p>

                        <div className="flex gap-4 mt-12 mb-8 md:mb-0 justify-center md:justify-start">
                            <NavBtn icon={ChevronLeft} onClick={prev} />
                            <NavBtn icon={ChevronRight} onClick={next} />
                        </div>
                    </div>

                    <div className="flex-1 w-full max-w-2xl relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="glass p-12 rounded-[56px] relative overflow-hidden"
                            >
                                <Quote className="absolute top-10 right-10 w-20 h-20 text-white/[0.03] rotate-180" />

                                <p className="text-2xl md:text-3xl font-medium leading-relaxed italic mb-10 relative">
                                    "{testimonials[index].quote}"
                                </p>

                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10">
                                        <img src={testimonials[index].avatar} alt={testimonials[index].name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xl">{testimonials[index].name}</h4>
                                        <p className="text-accent-cyan text-sm font-bold uppercase tracking-wider">{testimonials[index].role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
};

const NavBtn = ({ icon: Icon, onClick }) => (
    <button
        onClick={onClick}
        className="w-14 h-14 rounded-2xl glass hover:bg-white/10 flex items-center justify-center transition-all group active:scale-95"
    >
        <Icon className="w-6 h-6 group-hover:text-accent-purple transition-colors" />
    </button>
);

export default Testimonials;
