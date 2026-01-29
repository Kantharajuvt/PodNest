import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Pause, Play, Bookmark,
    FileText, Users, MicOff, UserMinus, UserPlus,
    Lock, LayoutGrid, Maximize2, ExternalLink,
    SlidersHorizontal, Music, MessageSquareOff,
    Pin, Trash2, BarChart3, Download, Save,
    FileJson, LogOut, ShieldAlert, PenTool
} from 'lucide-react';
import { cn } from '../../lib/utils';

const MoreMenu = ({ isOpen, onClose, isHost, onAction, sessionState }) => {
    const { isPaused, isLocked, markersCount, highlightsCount } = sessionState || {};
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for mobile bottom sheet */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] lg:hidden"
                    />

                    {/* Menu Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className={cn(
                            "fixed z-[111] bg-[#0A0A10]/95 backdrop-blur-2xl border border-white/5 shadow-3xl overflow-hidden",
                            // Desktop: Dropdown from bottom bar
                            "lg:absolute lg:bottom-20 lg:right-0 lg:w-[320px] lg:rounded-[32px]",
                            // Mobile: Bottom sheet
                            "bottom-0 left-0 right-0 rounded-t-[40px] lg:rounded-t-[32px]"
                        )}
                    >
                        {/* Header (Mobile Only) */}
                        <div className="lg:hidden flex items-center justify-between p-6 border-b border-white/5">
                            <h3 className="text-xl font-bold">Studio Controls</h3>
                            <button onClick={onClose} className="p-2 rounded-full bg-white/5"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="p-2 lg:p-3 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            <MenuSection title="🎙️ Session">
                                <MenuItem
                                    icon={isPaused ? Play : Pause}
                                    label={isPaused ? "Resume Recording" : "Pause Recording"}
                                    onClick={() => onAction('pause')}
                                    variant={isPaused ? 'warning' : 'default'}
                                />
                                <MenuItem
                                    icon={Bookmark}
                                    label={`Add Chapter Marker (${markersCount || 0})`}
                                    shortcut="⌘M"
                                    onClick={() => onAction('chapter')}
                                />
                                <MenuItem
                                    icon={Zap}
                                    label={`Add Highlight (${highlightsCount || 0})`}
                                    shortcut="⌘H"
                                    onClick={() => onAction('highlight')}
                                />
                            </MenuSection>

                            <MenuSection title="👥 Participants" divider>
                                <MenuItem icon={Users} label="View All" onClick={() => onAction('participants')} />
                                {isHost && (
                                    <>
                                        <MenuItem icon={MicOff} label="Mute All Guests" variant="warning" onClick={() => onAction('muteAll')} />
                                        <MenuItem
                                            icon={isLocked ? UserPlus : Lock}
                                            label={isLocked ? "Unlock Session" : "Lock Session"}
                                            onClick={() => onAction('lock')}
                                            variant={isLocked ? 'warning' : 'default'}
                                        />
                                    </>
                                )}
                            </MenuSection>

                            <MenuSection title="🎚️ Production Tools" divider>
                                <MenuItem icon={SlidersHorizontal} label="Advanced Mixer" onClick={() => onAction('mixer')} />
                                <MenuItem icon={Music} label="Soundboard" onClick={() => onAction('soundboard')} />
                                <MenuItem icon={BarChart3} label="Engagement Stats" onClick={() => onAction('stats')} />
                                <MenuItem icon={PenTool} label="Live Explain" onClick={() => onAction('explain')} />
                            </MenuSection>

                            <MenuSection title="📁 Export & AI" divider>
                                <MenuItem icon={Save} label="Save Master Recording" onClick={() => onAction('save')} />
                                <MenuItem icon={FileJson} label="Export Transcript" onClick={() => onAction('transcript')} />
                            </MenuSection>

                            {isHost && (
                                <MenuSection title="🔐 Danger Zone" divider>
                                    <MenuItem
                                        icon={LogOut}
                                        label="End Session for All"
                                        variant="danger"
                                        onClick={() => onAction('endAll')}
                                    />
                                </MenuSection>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const MenuSection = ({ title, children, divider }) => (
    <div className={cn("py-2", divider && "mt-2 pt-2 border-t border-white/5")}>
        <p className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{title}</p>
        <div className="space-y-0.5">
            {children}
        </div>
    </div>
);

const MenuItem = ({ icon: Icon, label, shortcut, variant = 'default', onClick }) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group text-left",
            variant === 'default' && "hover:bg-white/5 text-white/80 hover:text-white",
            variant === 'warning' && "hover:bg-yellow-500/10 text-yellow-500/80 hover:text-yellow-500",
            variant === 'danger' && "hover:bg-red-500/10 text-red-500/80 hover:text-red-500"
        )}
    >
        <div className="flex items-center gap-3">
            <Icon className={cn(
                "w-4 h-4 transition-transform group-hover:scale-110",
                variant === 'default' ? "text-white/40 group-hover:text-white" : ""
            )} />
            <span className="text-sm font-medium tracking-tight">{label}</span>
        </div>
        {shortcut && (
            <span className="text-[10px] font-mono opacity-20 group-hover:opacity-40">{shortcut}</span>
        )}
    </button>
);

// Note: HighlightingWand and Loader2 were in imports but I replaced them with Zap and others for specific context
// HighlightingWand replacement: Zap
const Zap = ({ className }) => (
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
        className={className}
    >
        <path d="M4 14.71 13 4l-1.5 8h8.5l-9 10.71L12.5 15H4z" />
    </svg>
);

export default MoreMenu;
