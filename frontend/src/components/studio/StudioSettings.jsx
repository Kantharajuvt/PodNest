import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Mic, Video, Radio, Settings,
    Bot, Cpu, Monitor, Keyboard,
    Accessibility, RefreshCw, Volume2,
    Check, ChevronRight, Sliders,
    Shield, Eye, ShieldCheck, Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';

const DEFAULT_SETTINGS = {
    audio: {
        device: 'System Default',
        gain: 85,
        noiseSuppression: 'High',
        echoCancellation: true,
        autoGain: false
    },
    video: {
        device: 'FaceTime HD Camera',
        resolution: '1080p',
        fps: '30 FPS',
        blur: 'Soft',
        faceCentering: true,
        studioLighting: true
    },
    recording: {
        resolution: 'H.264 (Standard)',
        format: 'WAV (48kHz Lossless)',
        separateTracks: true,
        autoRecord: false,
        cloudBackup: true
    },
    ai: {
        transcription: true,
        diarization: true,
        highlights: false,
        summary: true
    }
};

const StudioSettings = ({ isOpen, onClose, localStream }) => {
    const [activeTab, setActiveTab] = useState('audio');
    const [showSavedToast, setShowSavedToast] = useState(false);
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('podnest_studio_settings');
        return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    });

    const updateSetting = useCallback((section, key, value) => {
        setSettings(prev => {
            const newSettings = {
                ...prev,
                [section]: {
                    ...prev[section],
                    [key]: value
                }
            };
            localStorage.setItem('podnest_studio_settings', JSON.stringify(newSettings));
            return newSettings;
        });

        setShowSavedToast(true);
        const timer = setTimeout(() => setShowSavedToast(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const resetDefaults = () => {
        setSettings(DEFAULT_SETTINGS);
        localStorage.setItem('podnest_studio_settings', JSON.stringify(DEFAULT_SETTINGS));
        setShowSavedToast(true);
        setTimeout(() => setShowSavedToast(false), 2000);
    };

    const tabs = [
        { id: 'audio', label: 'Audio', icon: Mic },
        { id: 'video', label: 'Video', icon: Video },
        { id: 'recording', label: 'Recording', icon: Radio },
        { id: 'live', label: 'Live & Streaming', icon: Zap },
        { id: 'ai', label: 'AI Features', icon: Bot },
        { id: 'general', label: 'General', icon: Settings },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-2xl bg-[#0A0A10] border-l border-white/5 z-[101] flex overflow-hidden shadow-3xl"
                    >
                        <div className="w-64 border-r border-white/5 bg-black/20 p-6 flex flex-col gap-2">
                            <div className="flex items-center gap-3 mb-8 px-2">
                                <div className="w-8 h-8 rounded-lg bg-accent-purple flex items-center justify-center">
                                    <Settings className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold tracking-tight">Settings</h2>
                            </div>

                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                                        activeTab === tab.id
                                            ? "bg-accent-purple/10 text-accent-purple font-bold"
                                            : "text-white/40 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-accent-purple" : "text-white/20 group-hover:text-white/50")} />
                                    <span className="text-sm tracking-wide">{tab.label}</span>
                                    {activeTab === tab.id && (
                                        <motion.div layoutId="activeTab" className="absolute left-0 w-1 h-6 bg-accent-purple rounded-full" />
                                    )}
                                </button>
                            ))}

                            <div className="mt-auto pt-6 border-t border-white/5">
                                <button
                                    onClick={resetDefaults}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:bg-white/5 hover:text-white transition-all"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    <span className="text-sm">Reset to default</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col min-w-0">
                            <div className="h-20 px-8 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-lg font-bold uppercase tracking-widest text-white/60">
                                    {tabs.find(t => t.id === activeTab)?.label}
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/40 hover:text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="max-w-lg mx-auto">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeTab}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <TabContent
                                                tab={activeTab}
                                                localStream={localStream}
                                                settings={settings}
                                                onUpdate={updateSetting}
                                            />
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {showSavedToast && (
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 50, opacity: 0 }}
                                    className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[102] px-6 py-3 bg-green-500 rounded-2xl shadow-2xl flex items-center gap-3 border border-green-400/50"
                                >
                                    <Check className="w-5 h-5 text-white" />
                                    <span className="text-white font-bold">Changes saved instantly</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const TabContent = ({ tab, localStream, settings, onUpdate }) => {
    switch (tab) {
        case 'audio': return <AudioSettings localStream={localStream} state={settings.audio} onUpdate={(k, v) => onUpdate('audio', k, v)} />;
        case 'video': return <VideoSettings localStream={localStream} state={settings.video} onUpdate={(k, v) => onUpdate('video', k, v)} />;
        case 'recording': return <RecordingSettings state={settings.recording} onUpdate={(k, v) => onUpdate('recording', k, v)} />;
        case 'ai': return <AISettings state={settings.ai} onUpdate={(k, v) => onUpdate('ai', k, v)} />;
        case 'live': return <div className="text-center py-20 text-white/20 uppercase font-black tracking-widest">Live Streaming Controls coming soon</div>;
        case 'general': return <div className="text-center py-20 text-white/20 uppercase font-black tracking-widest">General Preferences coming soon</div>;
        default: return null;
    }
};

const AudioSettings = ({ localStream, state, onUpdate }) => {
    return (
        <div className="space-y-10">
            <Section title="Signal Input">
                <Option label="Microphone Device" description="Select your primary audio source">
                    <Select
                        value={state.device}
                        options={['System Default', 'MacBook Pro Microphone', 'Yeti Classic USB']}
                        onChange={(val) => onUpdate('device', val)}
                    />
                </Option>

                <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-end">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/30">Input Gain</label>
                        <span className="text-xs font-mono text-accent-purple">{state.gain}%</span>
                    </div>
                    <Slider value={state.gain} onChange={(val) => onUpdate('gain', val)} />
                    <div className="h-8 w-full bg-white/5 rounded-lg overflow-hidden flex items-center gap-0.5 px-2">
                        {Array.from({ length: 40 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="flex-1 bg-accent-purple/30 rounded-full"
                                animate={{ height: [4, Math.random() * 20 + 4, 4] }}
                                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.01 }}
                            />
                        ))}
                    </div>
                </div>
            </Section>

            <Section title="Processing & Optimization">
                <Option label="Noise Suppression" description="Reduce background ambient noise">
                    <SegmentedControl
                        options={['Off', 'Low', 'High']}
                        active={state.noiseSuppression}
                        onChange={(val) => onUpdate('noiseSuppression', val)}
                    />
                </Option>
                <Option label="Echo Cancellation" description="Prevent audio feedback loops">
                    <Toggle active={state.echoCancellation} onChange={(val) => onUpdate('echoCancellation', val)} />
                </Option>
                <Option label="Auto-gain Control" description="Normalize volume levels automatically">
                    <Toggle active={state.autoGain} onChange={(val) => onUpdate('autoGain', val)} />
                </Option>
            </Section>

            <button className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-sm font-bold transition-all">
                Test Microphone Signal
            </button>
        </div>
    );
};

const VideoSettings = ({ localStream, state, onUpdate }) => {
    const videoRef = useRef();

    useEffect(() => {
        if (videoRef.current && localStream) {
            videoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    return (
        <div className="space-y-10">
            <div className="aspect-video rounded-3xl bg-black border border-white/10 overflow-hidden relative shadow-2xl">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Live Preview</span>
                </div>
            </div>

            <Section title="Camera Control">
                <Option label="Video Source">
                    <Select
                        value={state.device}
                        options={['FaceTime HD Camera', 'iPhone Camera (Continuity)', 'Logitech StreamCam']}
                        onChange={(val) => onUpdate('device', val)}
                    />
                </Option>
                <div className="grid grid-cols-2 gap-4">
                    <Option label="Resolution" inline>
                        <Select
                            value={state.resolution}
                            options={['1080p', '4K (Ultra HD)', '720p']}
                            small
                            onChange={(val) => onUpdate('resolution', val)}
                        />
                    </Option>
                    <Option label="Frame Rate" inline>
                        <Select
                            value={state.fps}
                            options={['30 FPS', '60 FPS', '24 FPS']}
                            small
                            onChange={(val) => onUpdate('fps', val)}
                        />
                    </Option>
                </div>
            </Section>

            <Section title="AI Studio Effects">
                <Option label="Background Blur" description="Depth of field emulation">
                    <SegmentedControl
                        options={['Off', 'Soft', 'Deep']}
                        active={state.blur}
                        onChange={(val) => onUpdate('blur', val)}
                    />
                </Option>
                <Option label="Face Auto-centering" description="Keep you in frame with AI">
                    <Toggle active={state.faceCentering} onChange={(val) => onUpdate('faceCentering', val)} />
                </Option>
                <Option label="Studio Lighting" description="Enhance facial lighting levels">
                    <Toggle active={state.studioLighting} onChange={(val) => onUpdate('studioLighting', val)} />
                </Option>
            </Section>
        </div>
    );
};

const RecordingSettings = ({ state, onUpdate }) => (
    <div className="space-y-10">
        <Section title="Format & Quality">
            <Option label="Master Resolution" description="Primary file output quality">
                <Select
                    value={state.resolution}
                    options={['ProRes 422 (High)', 'H.264 (Standard)', 'VP9 (Web Optimized)']}
                    onChange={(val) => onUpdate('resolution', val)}
                />
            </Option>
            <Option label="Audio Format" description="Sample rate and encoding">
                <Select
                    value={state.format}
                    options={['WAV (48kHz Lossless)', 'MP3 (320kbps High)', 'AAC (Mobile Native)']}
                    onChange={(val) => onUpdate('format', val)}
                />
            </Option>
        </Section>

        <Section title="Workflow Automation">
            <Option label="Separate Tracks" description="Record each speaker as a unique file">
                <Toggle active={state.separateTracks} onChange={(val) => onUpdate('separateTracks', val)} />
            </Option>
            <Option label="Auto-record on LIVE" description="Trigger record when stream starts">
                <Toggle active={state.autoRecord} onChange={(val) => onUpdate('autoRecord', val)} />
            </Option>
            <Option label="Cloud Backup" description="Sync tracks to server immediately">
                <Toggle active={state.cloudBackup} onChange={(val) => onUpdate('cloudBackup', val)} />
            </Option>
        </Section>
    </div>
);

const AISettings = ({ state, onUpdate }) => (
    <div className="space-y-10">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-accent-purple/20 to-accent-cyan/10 border border-accent-purple/20 relative overflow-hidden group">
            <Bot className="absolute -right-4 -bottom-4 w-32 h-32 text-accent-purple/10 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-accent-purple" />
                    <span className="text-xs font-black uppercase text-accent-purple tracking-widest">Premium Intelligence</span>
                </div>
                <h4 className="text-xl font-bold mb-2">AI Podcast Engine</h4>
                <p className="text-sm text-white/40 leading-relaxed max-w-[240px]">Automate your technical tasks with our enterprise neural engine.</p>
            </div>
        </div>

        <Section title="Real-time Features">
            <Option label="Live Transcription" description="Generate real-time captions">
                <Toggle active={state.transcription} onChange={(val) => onUpdate('transcription', val)} />
            </Option>
            <Option label="Speaker Diarization" description="AI identifies and labels speakers">
                <Toggle active={state.diarization} onChange={(val) => onUpdate('diarization', val)} />
            </Option>
        </Section>

        <Section title="Post-Processing">
            <Option label="Auto Highlight Clips" description="Smart detection of viral moments">
                <Toggle active={state.highlights} onChange={(val) => onUpdate('highlights', val)} />
            </Option>
            <Option label="Session Summary" description="Generate AI meeting notes and SEO">
                <Toggle active={state.summary} onChange={(val) => onUpdate('summary', val)} />
            </Option>
        </Section>
    </div>
);

const Section = ({ title, children }) => (
    <div className="space-y-6">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5 pb-2">{title}</h4>
        {children}
    </div>
);

const Option = ({ label, description, children, inline }) => (
    <div className={cn("flex justify-between gap-6", inline ? "flex-col gap-2" : "items-center")}>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white tracking-tight">{label}</p>
            {description && <p className="text-xs text-white/30 mt-0.5 leading-normal">{description}</p>}
        </div>
        <div className="flex-shrink-0">
            {children}
        </div>
    </div>
);

const Select = ({ value, options, onChange, small }) => (
    <div className={cn("relative group", small ? "w-full" : "w-48")}>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm appearance-none focus:outline-none focus:border-accent-purple/50 transition-colors cursor-pointer"
        >
            {options.map(opt => <option key={opt} value={opt} className="bg-[#0A0A10]">{opt}</option>)}
        </select>
        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-white/40 rotate-90 pointer-events-none" />
    </div>
);

const Slider = ({ value, onChange }) => (
    <div className="relative group p-2 -m-2">
        <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent-purple to-accent-cyan"
                style={{ width: `${value}%` }}
            />
            <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-pointer"
            />
        </div>
    </div>
);

const Toggle = ({ active, onChange }) => (
    <button
        onClick={() => onChange(!active)}
        className={cn(
            "w-11 h-6 rounded-full p-1 transition-all duration-300 relative",
            active ? "bg-accent-purple" : "bg-white/10"
        )}
    >
        <motion.div
            animate={{ x: active ? 20 : 0 }}
            className="w-4 h-4 bg-white rounded-full shadow-lg"
        />
    </button>
);

const SegmentedControl = ({ options, active, onChange }) => (
    <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
        {options.map(opt => (
            <button
                key={opt}
                onClick={() => onChange(opt)}
                className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                    active === opt ? "bg-accent-purple text-white shadow-lg" : "text-white/35 hover:text-white"
                )}
            >
                {opt}
            </button>
        ))}
    </div>
);

export default StudioSettings;
