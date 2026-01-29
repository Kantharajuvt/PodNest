import React from 'react';
import { motion } from 'framer-motion';
import { Video, Mic2, FileText, Share2, Globe, Cpu } from 'lucide-react';

const FEATURE_DATA = [
    {
        title: "4K Video Quality",
        description: "Crystal clear local recording that doesn't depend on your internet speed.",
        icon: Video,
        color: "text-accent-purple"
    },
    {
        title: "Separate Tracks",
        description: "Get individual audio and video tracks for every participant to make editing a breeze.",
        icon: Mic2,
        color: "text-accent-pink"
    },
    {
        title: "Auto-Transcription",
        description: "Lightning-fast AI transcription for your episodes in over 100 languages.",
        icon: FileText,
        color: "text-accent-cyan"
    },
    {
        title: "Live Streaming",
        description: "Stream directly to YouTube, Twitch, and Facebook while recording in high quality.",
        icon: Globe,
        color: "text-accent-purple"
    }
];

const Features = () => {
    return (
        <section id="features" className="py-24 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Everything you need for <br /> professional content</h2>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto">
                        Powerful tools designed for creators, from solo podcasters to global media networks.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {FEATURE_DATA.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-3xl bg-card border border-white/5 hover:border-white/10 transition-colors group cursor-default"
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color}`}>
                                <feature.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-white/50 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
