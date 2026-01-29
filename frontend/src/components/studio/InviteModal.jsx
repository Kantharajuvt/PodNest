import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Link as LinkIcon, Mail, Copy,
    Check, ArrowRight, UserPlus, Send
} from 'lucide-react';
import { cn } from '../../lib/utils';
import api from '../../lib/api';

const InviteModal = ({ isOpen, onClose, studio }) => {
    const [inviteType, setInviteType] = useState('link'); // 'link' or 'email'
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const inviteLink = `${window.location.origin}/join/${studio?.inviteCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleSendEmail = async () => {
        if (!email || !studio?.id) {
            return;
        }

        setIsSending(true);
        try {
            await api.post(`/studios/${studio.id}/invite-email`, { email });
            alert('Invitation sent successfully!');
            setEmail('');
        } catch (error) {
            console.error('Failed to send email:', error);
            alert('Failed to send invitation.');
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-sm bg-black/60">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-card border border-white/10 rounded-[40px] w-full max-w-4xl flex overflow-hidden shadow-3xl"
            >
                {/* Visual Preview Side */}
                <div className="hidden md:flex flex-1 bg-accent-purple/5 p-12 flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <UserPlus className="w-64 h-64 -mr-32 -mt-32" />
                    </div>

                    <div className="w-full max-w-xs bg-card/40 border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-xl mb-10">
                        <div className="flex gap-2 mb-6">
                            <div className="w-8 h-1 bg-white/20 rounded-full" />
                            <div className="w-12 h-1 bg-white/20 rounded-full" />
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="aspect-square rounded-xl bg-white/5 flex items-center justify-center">
                                    <div className={cn(
                                        "w-6 h-6 rounded-full",
                                        i === 1 ? "bg-green-500/40" : i === 2 ? "bg-orange-500/40" : "bg-cyan-500/40"
                                    )} />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <div className="w-2 h-2 rounded-full bg-white/20" />
                            <div className="w-2 h-2 rounded-full bg-white/20" />
                        </div>
                    </div>

                    <h3 className="text-xl font-bold mb-2">What guests see</h3>
                    <p className="text-white/40 text-sm max-w-xs capitalize">Guests can join your recording session instantly without signing in.</p>
                </div>

                {/* Form Side */}
                <div className="flex-1 p-12 bg-card relative">
                    <button onClick={onClose} className="absolute top-8 right-8 p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-white/40" />
                    </button>

                    <h2 className="text-3xl font-bold mb-8">Invite guests to record</h2>

                    <div className="space-y-8">
                        <div>
                            <p className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">Invite with</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setInviteType('link')}
                                    className={cn(
                                        "flex-1 p-4 rounded-2xl border flex items-center gap-3 transition-all",
                                        inviteType === 'link' ? "bg-white/5 border-white/20" : "border-white/5 opacity-50 grayscale"
                                    )}
                                >
                                    <div className={cn("w-4 h-4 rounded-full border-4", inviteType === 'link' ? "border-accent-purple" : "border-white/20")} />
                                    <span className="font-bold">Link</span>
                                </button>
                                <button
                                    onClick={() => setInviteType('email')}
                                    className={cn(
                                        "flex-1 p-4 rounded-2xl border flex items-center gap-3 transition-all",
                                        inviteType === 'email' ? "bg-white/5 border-white/20" : "border-white/5 opacity-50 grayscale"
                                    )}
                                >
                                    <div className={cn("w-4 h-4 rounded-full border-4", inviteType === 'email' ? "border-accent-purple" : "border-white/20")} />
                                    <span className="font-bold">Email</span>
                                </button>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {inviteType === 'link' ? (
                                <motion.div
                                    key="link"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <button
                                        onClick={handleCopy}
                                        className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:border-white/20 transition-all font-bold"
                                    >
                                        <div className="flex items-center gap-3">
                                            <LinkIcon className="w-5 h-5 text-accent-cyan" />
                                            <span>Create shareable link</span>
                                        </div>
                                        {isCopied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />}
                                    </button>
                                    <p className="text-sm text-white/40 leading-relaxed capitalize">
                                        Anyone with this link can join the recording session without signing in.
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="email"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="relative">
                                        <input
                                            type="email"
                                            placeholder="Guest's email address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-16 focus:outline-none focus:border-accent-purple/50 font-semibold"
                                        />
                                        <button
                                            onClick={handleSendEmail}
                                            disabled={isSending || !email}
                                            className="absolute right-2 top-2 bottom-2 px-4 bg-accent-purple hover:bg-accent-purple/90 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                                        >
                                            <Send className={cn("w-4 h-4", isSending && "animate-pulse")} />
                                        </button>
                                    </div>
                                    <p className="text-sm text-white/40 leading-relaxed capitalize">
                                        We'll send a direct invitation with the join link to their inbox.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default InviteModal;
