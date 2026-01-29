import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Play, Square, Mic, Video,
    Monitor, Settings, Circle,
    Volume2, Users, MessageSquare
} from 'lucide-react';
import { cn } from '../../lib/utils';

const StudioPreview = () => {
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(t => t + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const participants = [
        { name: "Sarah (Host)", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", quality: "high" },
        { name: "Mike (Guest)", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike", quality: "high" },
        { name: "Emma (Guest)", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma", quality: "medium" }
    ];

    return (
        <div className="relative mt-20 max-w-5xl mx-auto group">
            {/* Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-accent-purple/30 via-accent-pink/30 to-accent-cyan/30 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />

            {/* Main Studio Frame */}
            <div className="relative glass rounded-[40px] overflow-hidden shadow-2xl shadow-black/50 aspect-video flex flex-col">
                {/* Header */}
                <div className="h-12 border-b border-white/5 bg-white/5 flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">REC</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-white/50">{formatTime(timer)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-accent-cyan uppercase tracking-wider">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan" /> Live Studio
                        </div>
                    </div>
                </div>

                {/* Video Grid */}
                <div className="flex-1 p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {participants.map((p, i) => (
                        <div key={i} className="relative rounded-3xl bg-black/40 border border-white/5 overflow-hidden group/p">
                            <img src={p.avatar} alt={p.name} className="w-full h-full object-cover opacity-50 transition-transform group-hover/p:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                            {/* Metadata Overlay */}
                            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-white flex items-center gap-1.5">
                                        <span className={cn("w-1.5 h-1.5 rounded-full", p.quality === 'high' ? "bg-green-500" : "bg-yellow-500")} />
                                        {p.name}
                                    </p>
                                    {/* Audio Bar Animation */}
                                    <div className="mt-2 flex gap-0.5 h-3 items-end">
                                        {Array.from({ length: 12 }).map((_, j) => (
                                            <motion.div
                                                key={j}
                                                className="w-1 bg-accent-purple"
                                                animate={{ height: [`${Math.random() * 100}%`, `${Math.random() * 100}%`, `${Math.random() * 100}%`] }}
                                                transition={{ duration: 0.5, repeat: Infinity, delay: j * i * 0.1 }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <div className="w-6 h-6 rounded-lg bg-black/40 flex items-center justify-center border border-white/10"><Mic className="w-3 h-3" /></div>
                                    <div className="w-6 h-6 rounded-lg bg-black/40 flex items-center justify-center border border-white/10"><Video className="w-3 h-3" /></div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* Empty Slot */}
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2">
                            <Users className="w-4 h-4 text-white/30" />
                        </div>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Invite Guest</p>
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="h-16 border-t border-white/5 bg-white/5 backdrop-blur-md flex items-center justify-between px-8">
                    <div className="flex items-center gap-3">
                        <ControlBtn icon={Mic} active />
                        <ControlBtn icon={Video} active />
                        <div className="w-px h-6 bg-white/10 mx-1" />
                        <ControlBtn icon={Monitor} />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30 animate-pulse">
                            <Square className="w-4 h-4 fill-current" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <ControlBtn icon={MessageSquare} />
                        <ControlBtn icon={Users} />
                        <ControlBtn icon={Settings} />
                    </div>
                </div>
            </div>

            {/* Floating Elements (Requested) */}
            <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-12 -left-12 p-6 glass rounded-2xl hidden lg:block"
            >
                <div className="w-10 h-10 rounded-xl bg-accent-purple/20 flex items-center justify-center mb-3">
                    <Mic className="text-accent-purple" />
                </div>
                <p className="text-xs font-bold whitespace-nowrap">Local Audio Capturing</p>
            </motion.div>

            <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -bottom-8 -right-8 p-6 glass rounded-2xl hidden lg:block"
            >
                <div className="w-10 h-10 rounded-xl bg-accent-cyan/20 flex items-center justify-center mb-3">
                    <Video className="text-accent-cyan" />
                </div>
                <p className="text-xs font-bold whitespace-nowrap">4K Quality Track</p>
            </motion.div>
        </div>
    );
};

const ControlBtn = ({ icon: Icon, active }) => (
    <button className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
        active ? "bg-white/10 text-white" : "text-white/30 hover:bg-white/5"
    )}>
        <Icon className="w-4 h-4" />
    </button>
);

export default StudioPreview;
