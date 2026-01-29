import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, Shield, Bell, HardDrive,
    Settings as SettingsIcon, Monitor,
    Cpu, Zap, Check, ChevronRight,
    Camera, Mic, Speaker, Globe,
    LogOut, Save, Smartphone, CreditCard
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../lib/api';

const SettingsPanel = ({ onBack, initialTab }) => {
    const { user, refreshUser } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState(initialTab || 'profile');
    const [isSaving, setIsSaving] = useState(false);
    const [subscription, setSubscription] = useState(null);
    const [isFetchingSub, setIsFetchingSub] = useState(false);
    const [profileData, setProfileData] = useState({
        fullName: '',
        email: '',
        notifyNewComments: true,
        notifyRecordingComplete: true,
        notifySpaceUsage: false,
        phoneNumber: ''
    });

    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    useEffect(() => {
        const fetchSubscriptionStatus = async () => {
            if (user) {
                setIsFetchingSub(true);
                try {
                    const response = await api.get('/subscriptions/status');
                    if (response.status === 200) {
                        setSubscription(response.data);
                    }
                } catch (error) {
                    console.error('Failed to fetch subscription:', error);
                } finally {
                    setIsFetchingSub(false);
                }
            }
        };
        fetchSubscriptionStatus();
    }, [user]);

    useEffect(() => {
        if (user) {
            setProfileData({
                fullName: user.fullName || '',
                email: user.email || '',
                notifyNewComments: user.notifyNewComments !== undefined ? user.notifyNewComments : true,
                notifyRecordingComplete: user.notifyRecordingComplete !== undefined ? user.notifyRecordingComplete : true,
                notifySpaceUsage: user.notifySpaceUsage !== undefined ? user.notifySpaceUsage : false,
                phoneNumber: user.phoneNumber || ''
            });
        }
    }, [user]);

    const TABS = [
        { id: 'profile', label: 'Profile Settings', icon: User },
        { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
        { id: 'av', label: 'Audio & Video', icon: Camera },
        { id: 'recording', label: 'Recording Preferences', icon: Smartphone },
        { id: 'storage', label: 'Storage & Backup', icon: HardDrive },
        { id: 'security', label: 'Security & Privacy', icon: Shield },
    ];

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await api.patch('/users/me', {
                fullName: profileData.fullName,
                phoneNumber: profileData.phoneNumber,
                notifyNewComments: profileData.notifyNewComments,
                notifyRecordingComplete: profileData.notifyRecordingComplete,
                notifySpaceUsage: profileData.notifySpaceUsage
            });
            // Update local auth context
            await refreshUser();
            showToast('success', 'Profile settings updated successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            showToast('error', 'Failed to save settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full">
            <header className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                    <button onClick={onBack} className="text-white/40 hover:text-white transition-colors flex items-center gap-2 mb-2 text-sm">
                        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold">Account Settings</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-accent-purple hover:bg-accent-purple/90 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        {isSaving ? <Zap className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Tabs */}
                <aside className="w-72 border-r border-white/5 p-6 space-y-2 overflow-y-auto">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all text-sm",
                                activeTab === tab.id
                                    ? "bg-accent-purple/10 text-accent-purple"
                                    : "text-white/40 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}

                    <div className="pt-10">
                        <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-red-400 hover:bg-red-400/10 transition-all text-sm">
                            <LogOut className="w-5 h-5" /> Sign Out
                        </button>
                    </div>
                </aside>

                {/* Content Area */}
                <main className="flex-1 p-10 overflow-y-auto bg-background/50">
                    <div className="max-w-3xl">
                        {activeTab === 'profile' && (
                            <ProfileSettings
                                data={profileData}
                                onChange={(updates) => setProfileData(prev => ({ ...prev, ...updates }))}
                            />
                        )}
                        {activeTab === 'billing' && (
                            <BillingSettings
                                subscription={subscription}
                                loading={isFetchingSub}
                            />
                        )}
                        {activeTab === 'av' && <AVSettings />}
                        {activeTab === 'recording' && <RecordingSettings />}
                        {['storage', 'security'].includes(activeTab) && (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                                <Zap className="w-12 h-12 mb-4 animate-pulse" />
                                <h3 className="text-xl font-bold">{TABS.find(t => t.id === activeTab)?.label}</h3>
                                <p className="text-sm">This feature is coming soon to your workspace.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

const BillingSettings = ({ subscription, loading }) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                <Zap className="w-12 h-12 mb-4 animate-spin" />
                <h3 className="text-xl font-bold">Fetching Subscription...</h3>
            </div>
        );
    }

    const isActive = subscription && subscription.status === 'ACTIVE';
    const planName = subscription ? subscription.planType : 'FREE';
    const billingCycle = subscription ? subscription.billingCycle : 'N/A';
    const expiryDate = subscription ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'N/A';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section>
                <h3 className="text-xl font-bold mb-6">Current Plan</h3>
                <div className={cn(
                    "p-8 border rounded-[32px] relative overflow-hidden group transition-all",
                    isActive
                        ? "bg-gradient-to-br from-accent-purple/20 to-accent-pink/20 border-white/10"
                        : "bg-white/5 border-white/5"
                )}>
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap className="w-24 h-24 text-white" />
                    </div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <span className={cn(
                                "px-3 py-1 text-white text-[10px] font-black uppercase tracking-widest rounded-full",
                                isActive ? "bg-accent-purple" : "bg-white/20"
                            )}>
                                {planName} Plan
                            </span>
                            <span className="text-white/40 text-xs font-bold capitalize">{isActive ? `Billed ${billingCycle}` : 'Basic Features'}</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-6">
                            <span className="text-4xl font-black">{isActive ? (planName === 'PRO' ? '₹999' : '₹3499') : '₹0'}</span>
                            <span className="text-white/40 font-bold">{isActive ? `/${billingCycle === 'monthly' ? 'month' : 'year'}` : '/month'}</span>
                        </div>
                        {isActive && (
                            <p className="text-xs text-white/50 mb-6 font-bold">Next billing date: {expiryDate}</p>
                        )}
                        <div className="flex gap-4">
                            <button className="px-6 py-2 bg-white text-black rounded-xl font-bold text-sm hover:bg-white/90 transition-all">
                                {isActive ? 'Manage Subscription' : 'Upgrade Plan'}
                            </button>
                            {isActive && (
                                <button className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all">View Invoices</button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-xl font-bold mb-6">Payment Methods</h3>
                <div className="space-y-4">
                    {isActive ? (
                        <div className="p-5 bg-card border border-white/5 rounded-2xl flex items-center justify-between group hover:border-white/20 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-8 bg-white/5 rounded flex items-center justify-center font-bold text-[10px] text-white/40 border border-white/10 uppercase tracking-tighter">Card</div>
                                <div>
                                    <p className="font-bold text-sm">Stored on Razorpay</p>
                                    <p className="text-xs text-white/40">Secured recurring payments</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-white/5 rounded-md text-[10px] font-bold text-white/40">Default</span>
                                <button className="p-2 text-white/20 hover:text-white transition-colors"><SettingsIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-white/40 italic">No payment methods stored. Upgrade to add one.</p>
                    )}
                    <button className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-white/40 font-bold text-sm hover:border-accent-purple/50 hover:text-accent-purple transition-all flex items-center justify-center gap-2">
                        <Zap className="w-4 h-4" /> Add Payment Method
                    </button>
                </div>
            </section>
        </div>
    );
};

const ProfileSettings = ({ data, onChange }) => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <section>
            <h3 className="text-xl font-bold mb-6">Profile Information</h3>
            <div className="flex items-start gap-8 mb-8">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center shadow-2xl">
                        <span className="text-3xl font-bold text-white">{data.fullName?.[0] || 'U'}</span>
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-2.5 bg-card border border-white/10 rounded-xl text-accent-cyan shadow-xl hover:scale-110 transition-transform">
                        <Camera className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex-1 pt-2">
                    <p className="text-white/50 text-sm mb-4 font-medium">Your avatar will be visible to your guests and other team members.</p>
                    <div className="flex gap-4">
                        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-colors">Change Avatar</button>
                        <button className="px-4 py-2 text-red-400 hover:bg-red-400/5 rounded-xl text-xs font-bold transition-colors">Remove</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/30 ml-1">Full Name</label>
                    <input
                        type="text"
                        value={data.fullName}
                        onChange={(e) => onChange({ fullName: e.target.value })}
                        className="w-full bg-card border border-white/5 rounded-2xl p-4 focus:outline-none focus:border-accent-purple/50 font-semibold"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/30 ml-1">Phone Number</label>
                    <input
                        type="text"
                        placeholder="+91 99999 99999"
                        value={data.phoneNumber}
                        onChange={(e) => onChange({ phoneNumber: e.target.value })}
                        className="w-full bg-card border border-white/5 rounded-2xl p-4 focus:outline-none focus:border-accent-purple/50 font-semibold"
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/30 ml-1">Email Address</label>
                    <input
                        type="email"
                        value={data.email}
                        className="w-full bg-card border border-white/5 rounded-2xl p-4 focus:outline-none focus:border-accent-purple/50 font-semibold text-white/50 cursor-not-allowed"
                        disabled
                    />
                </div>
            </div>
        </section>

        <section className="pt-8 border-t border-white/5">
            <h3 className="text-xl font-bold mb-6">Job Notification Preferences</h3>
            <div className="space-y-4">
                <ToggleRow
                    label="New comments on recordings"
                    description="Get notified when someone leaves a timestamped comment."
                    checked={data.notifyNewComments}
                    onChange={(checked) => onChange({ notifyNewComments: checked })}
                />
                <ToggleRow
                    label="Recording complete"
                    description="Receive an email once your recording is finished processing."
                    checked={data.notifyRecordingComplete}
                    onChange={(checked) => onChange({ notifyRecordingComplete: checked })}
                />
                <ToggleRow
                    label="Space usage alerts"
                    description="Alert me when I reach 80% of my storage capacity."
                    checked={data.notifySpaceUsage}
                    onChange={(checked) => onChange({ notifySpaceUsage: checked })}
                />
            </div>
        </section>
    </div>
);

const AVSettings = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <section>
            <h3 className="text-xl font-bold mb-6">Default Audio & Video</h3>
            <div className="space-y-6">
                <div className="p-6 bg-card border border-white/5 rounded-[32px] space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
                                <Mic className="w-5 h-5 text-accent-cyan" />
                            </div>
                            <div>
                                <p className="font-bold">Noise Reduction</p>
                                <p className="text-xs text-white/40">Filter out background hums and static.</p>
                            </div>
                        </div>
                        <CustomToggle />
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent-pink/10 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-accent-pink" />
                            </div>
                            <div>
                                <p className="font-bold">Echo Cancellation</p>
                                <p className="text-xs text-white/40">Prevent audio feedback loops from speakers.</p>
                            </div>
                        </div>
                        <CustomToggle defaultChecked />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/30 ml-1">Video Output Quality</label>
                    <div className="grid grid-cols-3 gap-3">
                        {['720p', '1080p (FHD)', '4K (UHD)'].map(q => (
                            <button
                                key={q}
                                className={cn(
                                    "p-4 rounded-2xl border font-bold text-sm transition-all",
                                    q.includes('1080p') ? "bg-accent-purple border-accent-purple shadow-lg shadow-accent-purple/20" : "bg-card border-white/5 text-white/40 hover:border-white/20"
                                )}
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    </div>
);

const RecordingSettings = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <section>
            <h3 className="text-xl font-bold mb-6">Recording Behavior</h3>
            <div className="space-y-4">
                <ToggleRow label="Auto-save to cloud" description="Upload local tracks automatically as sessions end." defaultChecked />
                <ToggleRow label="Local backup option" description="Keep a local copy of recordings in browser cache." />
                <ToggleRow label="Recording countdown" description="Display 3-second countdown before recording starts." defaultChecked />
            </div>
        </section>
    </div>
);

const ToggleRow = ({ label, description, checked, onChange, defaultChecked }) => (
    <div className="flex items-center justify-between py-2">
        <div>
            <h4 className="font-bold">{label}</h4>
            <p className="text-xs text-white/40 font-medium">{description}</p>
        </div>
        <CustomToggle
            checked={checked}
            onChange={onChange}
            defaultChecked={defaultChecked}
        />
    </div>
);

const CustomToggle = ({ checked, onChange, defaultChecked }) => {
    const [internalChecked, setInternalChecked] = useState(defaultChecked || false);

    const isControlled = checked !== undefined;
    const currentChecked = isControlled ? checked : internalChecked;

    const handleToggle = () => {
        if (isControlled) {
            onChange(!checked);
        } else {
            setInternalChecked(!internalChecked);
        }
    };

    return (
        <button
            onClick={handleToggle}
            className={cn(
                "w-12 h-6 rounded-full relative transition-all duration-300",
                currentChecked ? "bg-accent-purple" : "bg-white/10"
            )}
        >
            <div className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm",
                currentChecked ? "left-7" : "left-1"
            )} />
        </button>
    );
};

export default SettingsPanel;
