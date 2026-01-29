import React from 'react';
import { motion } from 'framer-motion';
import {
    Zap, Database, Mic2,
    Video, Globe, Monitor,
    CheckCircle2
} from 'lucide-react';

const features = [
    { icon: Video, title: "Local Recording", desc: "4K video recorded locally on each participant's device for maximum quality." },
    { icon: Mic2, title: "Multi-Track", desc: "Receive individual audio and video tracks for seamless editing in your DAW." },
    { icon: Globe, title: "Live Streaming", desc: "Stream your sessions directly to YouTube, Twitch, and more in real-time." },
    { icon: Zap, title: "AI Transcription", desc: "Get high-accuracy transcripts instantly with speaker labels and timestamps." },
    { icon: Database, title: "Cloud Storage", desc: "Unlimited cloud storage for your raw tracks and finished episodes." },
    { icon: Monitor, title: "Screen Share", desc: "Collaborate effortlessly with high-fidelity screen sharing during sessions." }
];

const DetailedFeatures = () => {
    return (
        <section id="features" className="py-24 relative bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20 md:flex md:items-end md:justify-between md:text-left">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-bold mb-6">Powerhouse features <br /> for power users</h2>
                        <p className="text-white/60 text-lg max-w-xl">
                            Every tool you need to create, manage, and scale your media empire.
                        </p>
                    </div>
                    <button className="mt-8 md:mt-0 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all flex items-center gap-2">
                        View All Features <CheckCircle2 className="w-5 h-5 text-accent-cyan" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="p-10 rounded-[40px] glass group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-accent-purple/10 transition-colors" />
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:bg-accent-purple/10 transition-colors">
                                <f.icon className="w-8 h-8 text-white/40 group-hover:text-accent-purple transition-colors" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                            <p className="text-white/50 leading-relaxed font-medium">
                                {f.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DetailedFeatures;
