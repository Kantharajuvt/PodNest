import React from 'react';
import { motion } from 'framer-motion';
import { Video, Mic2, CloudUpload, FileText } from 'lucide-react';

const FeatureHighlightsBar = () => {
    const highlights = [
        { icon: Video, title: "4K Video Recording" },
        { icon: Mic2, title: "Separate Tracks" },
        { icon: CloudUpload, title: "Auto Upload" },
        { icon: FileText, title: "AI Transcription" }
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {highlights.map((h, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5, borderColor: 'rgba(139, 92, 246, 0.3)' }}
                        className="glass flex items-center gap-4 p-6 rounded-[28px] transition-all cursor-default"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-accent-purple/10 flex items-center justify-center">
                            <h.icon className="w-6 h-6 text-accent-purple" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">{h.title}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default FeatureHighlightsBar;
