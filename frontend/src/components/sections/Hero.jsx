import React from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Mic, Video, Radio, ShieldCheck } from 'lucide-react';
import StudioPreview from './StudioPreview';
import { cn } from '../../lib/utils';

const Hero = ({ onStart }) => {
    return (
        <section className="relative pt-32 pb-40 overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-20 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[#0a0a0f]" />
                <div className="absolute top-[-20%] left-[-10%] w-[140%] h-[140%] gradient-animate opacity-20 blur-[120px]" />
            </div>

            {/* Animated Floating Assets */}
            <FloatingAsset icon={Mic} color="text-accent-purple" className="top-24 left-[10%]" delay={0} />
            <FloatingAsset icon={Video} color="text-accent-pink" className="top-40 right-[15%]" delay={0.5} />
            <FloatingAsset icon={Radio} color="text-accent-cyan" className="bottom-60 left-[15%]" delay={1} />
            <FloatingAsset icon={ShieldCheck} color="text-accent-purple" className="bottom-80 right-[10%]" delay={1.5} />

            <div className="max-w-7xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-accent-cyan text-sm font-bold mb-8 inline-flex items-center gap-2 group cursor-default">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan"></span>
                        </span>
                        New: 4K Local Recording Now Available
                    </span>

                    <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-[1.05] tracking-tight glow-text">
                        Record studio-quality <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-purple via-accent-pink to-accent-cyan animate-gradient bg-[length:200%_auto]">
                            podcasts & videos
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                        PodNest captures crystal clear audio and video locally from each guest,
                        eliminating internet glitches from your content forever.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
                        <button
                            onClick={onStart}
                            className="w-full sm:w-auto px-10 py-5 bg-accent-purple hover:bg-accent-purple/90 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.5)]"
                        >
                            Start Recording Free <ArrowRight className="w-6 h-6" />
                        </button>
                        <button className="w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all">
                            <Play className="w-6 h-6 fill-current" /> Watch Demo
                        </button>
                    </div>

                    {/* Social Proof */}
                    <div className="flex flex-col items-center gap-4 opacity-50 mb-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} className="w-8 h-8 rounded-full border-2 border-[#0a0a0f]" />
                            ))}
                        </div>
                        <p className="text-sm font-bold tracking-wide">TRUSTED BY 10,000+ CREATORS WORLDWIDE</p>
                        <p className="text-xs font-bold text-accent-cyan tracking-tighter">NO CREDIT CARD REQUIRED • FREE FOREVER</p>
                    </div>
                </motion.div>

                {/* Studio Mockup Interface */}
                <StudioPreview />
            </div>
        </section>
    );
};

const FloatingAsset = ({ icon: Icon, color, className, delay }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{
            opacity: [0.1, 0.3, 0.1],
            y: [-20, 20, -20],
            rotate: [-10, 10, -10]
        }}
        transition={{ duration: 7, repeat: Infinity, delay }}
        className={cn("absolute hidden xl:block pointer-events-none", className, color)}
    >
        <Icon className="w-24 h-24 stroke-[0.5]" />
    </motion.div>
);

export default Hero;
