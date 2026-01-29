import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const AudioStage = ({ participants, currentUser, localStream, isRecording }) => {
    const [audioLevels, setAudioLevels] = useState(Array(48).fill(16));
    const requestRef = useRef();

    useEffect(() => {
        if (!localStream || !isRecording) {
            setAudioLevels(Array(48).fill(16));
            return;
        }

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(localStream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const update = () => {
                analyser.getByteFrequencyData(dataArray);

                // Map the frequency data to our 48 bars
                const newLevels = [];
                const step = Math.floor(bufferLength / 48);

                for (let i = 0; i < 48; i++) {
                    const value = dataArray[i * step] || 0;
                    // Scale height between 16 and 96
                    const height = (value / 255) * 80 + 16;
                    newLevels.push(height);
                }

                setAudioLevels(newLevels);
                requestRef.current = requestAnimationFrame(update);
            };

            update();

            return () => {
                cancelAnimationFrame(requestRef.current);
                audioContext.close();
            };
        } catch (e) {
            console.warn("Global Waveform Error:", e);
        }
    }, [localStream, isRecording]);

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
            {/* Background Ambient Pulse */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <motion.div
                    animate={{
                        scale: isRecording ? [1, 1.1, 1] : 1,
                        opacity: isRecording ? [0.1, 0.3, 0.1] : 0.1
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className={cn(
                        "w-[600px] h-[600px] rounded-full blur-[120px] transition-colors duration-1000",
                        isRecording ? "bg-red-500/20" : "bg-accent-purple/30"
                    )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 w-full max-w-6xl relative z-10">
                {/* Host Area (Always first) */}
                <AvatarItem
                    name={currentUser?.fullName || 'Host'}
                    stream={localStream}
                    isHost={true}
                    isSelf={true}
                />

                {/* Remote Participants */}
                {participants.map((p) => (
                    <AvatarItem
                        key={p.id}
                        name={p.name}
                        stream={p.stream}
                        isHost={false}
                        isSelf={false}
                    />
                ))}
            </div>

            {/* Central Waveform Visualization */}
            <AnimatePresence>
                {isRecording && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mt-20 w-full max-w-2xl h-32 flex items-end justify-center gap-1"
                    >
                        {audioLevels.map((height, i) => (
                            <motion.div
                                key={i}
                                className="w-1.5 bg-red-500/60 rounded-full"
                                animate={{ height }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const AvatarItem = ({ name, stream, isHost, isSelf }) => {
    const [level, setLevel] = useState(0);

    useEffect(() => {
        if (!stream) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            let animationId;
            const update = () => {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;
                setLevel(average);
                animationId = requestAnimationFrame(update);
            };

            update();

            return () => {
                cancelAnimationFrame(animationId);
                audioContext.close();
            };
        } catch (e) {
            console.warn("Audio Context error:", e);
        }
    }, [stream]);

    const active = level > 5;

    return (
        <div className="flex flex-col items-center gap-6 group">
            <div className="relative">
                {/* Speaking Ring */}
                <AnimatePresence>
                    {active && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.2, opacity: 1 }}
                            exit={{ scale: 1.4, opacity: 0 }}
                            className="absolute -inset-4 rounded-full border-2 border-accent-purple/50 pointer-events-none"
                        />
                    )}
                </AnimatePresence>

                {/* Avatar Circle */}
                <div className={cn(
                    "w-40 h-40 rounded-full flex items-center justify-center text-4xl font-bold transition-all duration-300 relative z-10 border-4",
                    active
                        ? "bg-accent-purple/20 border-accent-purple scale-105 shadow-[0_0_40px_rgba(168,85,247,0.4)]"
                        : "bg-white/5 border-white/10 grayscale-[0.5]"
                )}>
                    {name[0]}
                    {isHost && (
                        <div className="absolute -top-2 -right-2 px-3 py-1 bg-yellow-500 rounded-full text-[10px] uppercase font-black text-black shadow-lg">
                            Host
                        </div>
                    )}
                </div>

                {/* Mic Indicator */}
                <div className={cn(
                    "absolute -bottom-2 right-4 w-10 h-10 rounded-full border-2 border-background flex items-center justify-center transition-all",
                    active ? "bg-accent-purple text-white" : "bg-card text-white/40"
                )}>
                    <Mic className="w-5 h-5" />
                </div>
            </div>

            <div className="text-center">
                <h3 className={cn(
                    "text-xl font-bold transition-colors",
                    active ? "text-white" : "text-white/40"
                )}>
                    {name}
                    {isSelf && <span className="text-sm font-normal ml-2 opacity-40">(You)</span>}
                </h3>
            </div>
        </div>
    );
};

export default AudioStage;
