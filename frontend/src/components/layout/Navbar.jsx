import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic, Video, Users, Zap,
    Bell, User, CreditCard,
    Settings, LogOut, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

const Navbar = ({ onNavigate }) => {
    const { user, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const menuItems = [
        { label: 'Profile', icon: User, action: () => onNavigate('settings', 'profile') },
        { label: 'Billing', icon: CreditCard, action: () => onNavigate('settings', 'billing') },
        { label: 'Settings', icon: Settings, action: () => onNavigate('settings', 'profile') },
        { label: 'Sign Out', icon: LogOut, action: logout, danger: true },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo Section */}
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('landing')}>
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-pink rounded-xl flex items-center justify-center shadow-lg shadow-accent-purple/20 group-hover:scale-110 transition-transform duration-300">
                        <Mic className="text-white w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        PodNest
                    </span>
                </div>

                {/* Main Navigation Links */}
                <div className="hidden md:flex items-center gap-10">
                    {['Features', 'Workflow', 'Pricing', 'FAQ'].map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-[17px] font-bold text-white/80 hover:text-white hover:drop-shadow-[0_0_10px_rgba(139,92,246,0.8)] transition-all duration-300 relative group py-2"
                        >
                            {item}
                            {/* Animated Underline */}
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-1.5 bg-accent-purple rounded-full opacity-0 group-hover:w-10 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.8)]" />
                        </a>
                    ))}
                </div>

                {/* CTA & User Actions */}
                <div className="flex items-center gap-6">
                    {user ? (
                        <div className="flex items-center gap-4">
                            {/* Notification Icon */}
                            <button className="p-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all relative group">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent-pink rounded-full border-2 border-background" />
                                <div className="absolute top-full right-0 mt-2 py-2 px-3 bg-card border border-white/10 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                    Updates
                                </div>
                            </button>

                            {/* My Studio CTA */}
                            <button
                                onClick={() => onNavigate('dashboard')}
                                className="relative group px-6 py-2.5 font-black text-sm rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-accent-purple to-accent-pink opacity-100 group-hover:opacity-90 transition-opacity" />
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 shadow-[0_0_20px_rgba(139,92,246,0.3)] group-hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all" />
                                <span className="relative text-white flex items-center gap-2">
                                    My Studio
                                    <Zap className="w-4 h-4 fill-current" />
                                </span>
                            </button>

                            {/* Profile Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 p-1 pl-4 pr-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple/20 to-accent-pink/20 border border-white/10 flex items-center justify-center font-bold text-accent-purple text-xs">
                                        {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                                    </div>
                                    <ChevronDown className={cn("w-4 h-4 text-white/40 group-hover:text-white transition-all", isProfileOpen && "rotate-180")} />
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full right-0 mt-4 w-56 bg-card border border-white/10 rounded-[28px] p-2 shadow-2xl backdrop-blur-xl overflow-hidden z-[60]"
                                        >
                                            <div className="px-4 py-3 border-b border-white/5 mb-2">
                                                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Signed in as</p>
                                                <p className="text-sm font-bold text-white truncate">{user.fullName || 'User'}</p>
                                            </div>
                                            {menuItems.map((item, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        item.action();
                                                        setIsProfileOpen(false);
                                                    }}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                                                        item.danger
                                                            ? "text-red-400 hover:bg-red-400/10"
                                                            : "text-white/60 hover:text-white hover:bg-white/5"
                                                    )}
                                                >
                                                    <item.icon className="w-4 h-4" />
                                                    {item.label}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => onNavigate('dashboard')}
                                className="text-white/60 hover:text-white font-bold transition-all px-4 py-2 hover:bg-white/5 rounded-xl hidden sm:block text-sm"
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => onNavigate('dashboard')}
                                className="px-8 py-3 bg-accent-purple hover:bg-accent-purple/90 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-accent-purple/20 text-sm"
                            >
                                Get Started
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
