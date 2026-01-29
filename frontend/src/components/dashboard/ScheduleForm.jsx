import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Calendar,
    Clock,
    Users,
    Video,
    Mic,
    MoreHorizontal,
    Plus,
    Trash2,
    Settings,
    Mail,
    Shield,
    ChevronRight,
    Check
} from 'lucide-react';
import { cn } from '../../lib/utils';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';

const ScheduleForm = ({ onClose, onSuccess, studios }) => {
    const { showToast } = useToast();
    const [step, setStep] = useState(1); // 1: Basic Info, 2: Guests, 3: Settings
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        studioId: studios[0]?.id || '',
        startTime: '',
        expectedDuration: '60 min',
        recordingType: 'VIDEO',
        guests: [],
        autoStartStudio: false,
        autoStartRecording: false,
        waitingRoomEnabled: true,
        muteGuestsOnJoin: false,
        aiTranscriptionEnabled: true
    });

    const [newGuest, setNewGuest] = useState({
        email: '',
        name: '',
        role: 'GUEST',
        canMic: true,
        canCamera: true,
        canScreenShare: true
    });

    const handleAddGuest = () => {
        if (!newGuest.email) {
            showToast('error', 'Guest email is required');
            return;
        }
        setFormData(prev => ({
            ...prev,
            guests: [...prev.guests, { ...newGuest, id: Date.now() }]
        }));
        setNewGuest({
            email: '',
            name: '',
            role: 'GUEST',
            canMic: true,
            canCamera: true,
            canScreenShare: true
        });
    };

    const handleRemoveGuest = (id) => {
        setFormData(prev => ({
            ...prev,
            guests: prev.guests.filter(g => g.id !== id)
        }));
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.startTime) {
            showToast('error', 'Session title and start time are required');
            setStep(1);
            return;
        }

        setIsLoading(true);
        try {
            // Ensure studioId is a number
            const payload = {
                ...formData,
                studioId: Number(formData.studioId)
            };
            await api.post('/schedule', payload);
            showToast('success', 'Session scheduled successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to schedule session:', error);
            const message = error.response?.data?.details || error.response?.data?.message || 'Failed to schedule session. Please try again.';
            showToast('error', message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-card border border-white/10 w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">New Session</h2>
                        <div className="flex items-center gap-4 mt-2">
                            <StepIndicator current={step} target={1} label="Basics" />
                            <div className="w-4 h-px bg-white/10" />
                            <StepIndicator current={step} target={2} label="Guests" />
                            <div className="w-4 h-px bg-white/10" />
                            <StepIndicator current={step} target={3} label="Settings" />
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-6 h-6 text-white/40" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-white/30 mb-2">Session Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Weekly Podcast Ep. 42"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-accent-purple/50 transition-colors"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-white/30 mb-2">Select Studio</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-accent-purple/50 transition-colors appearance-none"
                                        value={formData.studioId}
                                        onChange={e => setFormData({ ...formData, studioId: e.target.value })}
                                    >
                                        {studios.map(studio => (
                                            <option key={studio.id} value={studio.id} className="bg-card">{studio.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-white/30 mb-2">Recording Type</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['AUDIO', 'VIDEO', 'LIVE'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setFormData({ ...formData, recordingType: type })}
                                                className={cn(
                                                    "py-3 rounded-xl text-xs font-bold border transition-all",
                                                    formData.recordingType === type
                                                        ? "bg-accent-purple/20 border-accent-purple text-accent-purple"
                                                        : "bg-white/5 border-white/5 text-white/40 hover:text-white"
                                                )}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-white/30 mb-2">Date & Time</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-4 w-5 h-5 text-white/30" />
                                        <input
                                            type="datetime-local"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 focus:outline-none focus:border-accent-purple/50 transition-colors"
                                            value={formData.startTime}
                                            onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-white/30 mb-2">Duration</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-accent-purple/50 transition-colors appearance-none"
                                        value={formData.expectedDuration}
                                        onChange={e => setFormData({ ...formData, expectedDuration: e.target.value })}
                                    >
                                        <option value="30 min" className="bg-card">30 min</option>
                                        <option value="60 min" className="bg-card">60 min</option>
                                        <option value="90 min" className="bg-card">90 min</option>
                                        <option value="2 hours" className="bg-card">2 hours</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-white/30 mb-2">Agenda / Description</label>
                                    <textarea
                                        placeholder="What's this recording about?"
                                        rows={3}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-accent-purple/50 transition-colors resize-none"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
                            {/* Add Guest Section */}
                            <div className="bg-white/5 rounded-[24px] p-6 border border-white/5">
                                <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                                    <Plus className="w-4 h-4 text-accent-cyan" /> Invite New Guest
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="email"
                                        placeholder="Email address"
                                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent-purple/50"
                                        value={newGuest.email}
                                        onChange={e => setNewGuest({ ...newGuest, email: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Guest name (optional)"
                                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent-purple/50"
                                        value={newGuest.name}
                                        onChange={e => setNewGuest({ ...newGuest, name: e.target.value })}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setNewGuest({ ...newGuest, role: 'GUEST' })}
                                            className={cn(
                                                "flex-1 py-3 rounded-xl text-xs font-bold transition-all",
                                                newGuest.role === 'GUEST' ? "bg-accent-cyan/20 text-accent-cyan" : "bg-white/5 text-white/40"
                                            )}
                                        >
                                            Guest
                                        </button>
                                        <button
                                            onClick={() => setNewGuest({ ...newGuest, role: 'CO_HOST' })}
                                            className={cn(
                                                "flex-1 py-3 rounded-xl text-xs font-bold transition-all",
                                                newGuest.role === 'CO_HOST' ? "bg-accent-purple/20 text-accent-purple" : "bg-white/5 text-white/40"
                                            )}
                                        >
                                            Co-Host
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleAddGuest}
                                        className="bg-white text-black rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
                                    >
                                        Add to Session
                                    </button>
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap gap-4">
                                    <PermissionToggle label="Mic" active={newGuest.canMic} onClick={() => setNewGuest({ ...newGuest, canMic: !newGuest.canMic })} icon={Mic} />
                                    <PermissionToggle label="Video" active={newGuest.canCamera} onClick={() => setNewGuest({ ...newGuest, canCamera: !newGuest.canCamera })} icon={Video} />
                                    <PermissionToggle label="Share" active={newGuest.canScreenShare} onClick={() => setNewGuest({ ...newGuest, canScreenShare: !newGuest.canScreenShare })} icon={Shield} />
                                </div>
                            </div>

                            {/* Guest List */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-white/30 flex items-center justify-between">
                                    Guest List <span>{formData.guests.length} invited</span>
                                </h3>
                                {formData.guests.length === 0 ? (
                                    <div className="p-12 text-center bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[24px]">
                                        <Users className="w-10 h-10 text-white/10 mx-auto mb-4" />
                                        <p className="text-sm text-white/30 italic">No guests added yet. You can also share the link later.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {formData.guests.map(guest => (
                                            <div key={guest.id} className="bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple/20 to-accent-pink/20 flex items-center justify-center font-bold text-accent-purple">
                                                        {guest.name ? guest.name.charAt(0).toUpperCase() : guest.email.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm">{guest.name || 'Anonymous Guest'}</h4>
                                                        <p className="text-xs text-white/40">{guest.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                                        guest.role === 'CO_HOST' ? "bg-accent-purple/20 text-accent-purple" : "bg-accent-cyan/20 text-accent-cyan"
                                                    )}>
                                                        {guest.role}
                                                    </span>
                                                    <button onClick={() => handleRemoveGuest(guest.id)} className="p-2 hover:bg-red-500/10 text-white/20 hover:text-red-500 rounded-lg transition-all">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-white/30">Recording & Studio Settings</h3>
                            <div className="space-y-4">
                                <SettingToggle
                                    label="Auto-start Studio"
                                    desc="Studio opens automatically 5 mins before session"
                                    active={formData.autoStartStudio}
                                    onClick={() => setFormData({ ...formData, autoStartStudio: !formData.autoStartStudio })}
                                />
                                <SettingToggle
                                    label="Auto-start Recording"
                                    desc="Start recording as soon as the host joins"
                                    active={formData.autoStartRecording}
                                    onClick={() => setFormData({ ...formData, autoStartRecording: !formData.autoStartRecording })}
                                />
                                <SettingToggle
                                    label="Waiting Room"
                                    desc="Guests must be admitted by host before joining"
                                    active={formData.waitingRoomEnabled}
                                    onClick={() => setFormData({ ...formData, waitingRoomEnabled: !formData.waitingRoomEnabled })}
                                />
                                <SettingToggle
                                    label="Mute Guests on Join"
                                    desc="Microphones are disabled when first entering"
                                    active={formData.muteGuestsOnJoin}
                                    onClick={() => setFormData({ ...formData, muteGuestsOnJoin: !formData.muteGuestsOnJoin })}
                                />
                                <SettingToggle
                                    label="AI Transcription"
                                    desc="Generate real-time text during the session"
                                    active={formData.aiTranscriptionEnabled}
                                    onClick={() => setFormData({ ...formData, aiTranscriptionEnabled: !formData.aiTranscriptionEnabled })}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-white/5 bg-black/20 flex items-center justify-between">
                    <button
                        onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition-all"
                    >
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>

                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="px-8 py-3 bg-accent-purple hover:bg-accent-purple/90 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-accent-purple/20"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="px-8 py-3 bg-white text-black hover:bg-gray-200 disabled:bg-white/20 rounded-2xl font-bold flex items-center gap-2 transition-all"
                        >
                            {isLoading ? 'Scheduling...' : 'Confirm Schedule'}
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const StepIndicator = ({ current, target, label }) => (
    <div className={cn(
        "flex items-center gap-2 text-xs font-bold transition-colors",
        current >= target ? "text-white" : "text-white/20"
    )}>
        <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center border",
            current > target ? "bg-accent-cyan border-accent-cyan text-black" :
                current === target ? "border-white bg-white/10" : "border-white/10"
        )}>
            {current > target ? <Check className="w-3 h-3" /> : target}
        </div>
        <span>{label}</span>
    </div>
);

const PermissionToggle = ({ label, active, onClick, icon: Icon }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all",
            active ? "bg-accent-purple/10 border-accent-purple/50 text-accent-purple" : "bg-white/5 border-transparent text-white/30"
        )}
    >
        <Icon className="w-3.5 h-3.5" /> {label}
    </button>
);

const SettingToggle = ({ label, desc, active, onClick }) => (
    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-all group">
        <div>
            <h4 className="font-bold text-sm mb-0.5">{label}</h4>
            <p className="text-xs text-white/40">{desc}</p>
        </div>
        <button
            onClick={onClick}
            className={cn(
                "w-12 h-6 rounded-full relative transition-all duration-300",
                active ? "bg-accent-purple" : "bg-white/10"
            )}
        >
            <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                active ? "left-7" : "left-1"
            )} />
        </button>
    </div>
);

const Loader2 = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("lucide lucide-loader-2", className)}
    >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);


export default ScheduleForm;
