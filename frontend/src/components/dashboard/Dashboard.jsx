import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus, Calendar, Users,
    LayoutGrid, List, Search,
    Mic, Video, Trash2, Settings,
    Play, Download, MoreVertical,
    BarChart3, Clock, Database, Loader2,
    Share2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import SchedulePanel from './SchedulePanel';

const Dashboard = ({ onBack, onEnterStudio, onNavigate }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [studios, setStudios] = useState([]);
    const [recordings, setRecordings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [activeView, setActiveView] = useState('dashboard');

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await Promise.all([fetchStudios(), fetchRecordings()]);
            setIsLoading(false);
        };
        loadData();
    }, []);

    const fetchStudios = async () => {
        try {
            const response = await api.get('/studios');
            setStudios(response.data);
        } catch (error) {
            console.error('Failed to fetch studios:', error);
        }
    };

    const fetchRecordings = async () => {
        try {
            const response = await api.get('/recordings');
            setRecordings(response.data);
        } catch (error) {
            console.error('Failed to fetch recordings:', error);
        }
    };

    const handleCreateStudio = async () => {
        const name = prompt('Enter studio name:');
        if (!name?.trim()) return;

        setIsCreating(true);
        try {
            const response = await api.post('/studios', { name: name.trim() });
            setStudios(prev => [...prev, response.data]);
            showToast('success', `Studio "${name}" created successfully!`);
        } catch (error) {
            console.error('Failed to create studio:', error);
            showToast('error', 'Failed to create studio. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteStudio = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"? This will also remove all its recordings.`)) return;

        try {
            await api.delete(`/studios/${id}`);
            setStudios(prev => prev.filter(s => s.id !== id));
            showToast('success', `Studio "${name}" and all its recordings have been deleted.`);
            fetchRecordings();
        } catch (error) {
            console.error('Failed to delete studio:', error);
            const errorMessage = error.response?.data?.message || 'Could not delete studio. Please try again.';
            showToast('error', `Error: ${errorMessage}`);
        }
    };

    return (
        <div className="flex min-h-screen bg-background text-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-card/30 backdrop-blur-xl p-6 hidden lg:block">
                <div className="flex items-center gap-2 mb-10 px-2 cursor-pointer" onClick={onBack}>
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-pink rounded-lg flex items-center justify-center">
                        <Mic className="text-white w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold">PodNest</span>
                </div>

                <nav className="space-y-2">
                    <NavItem icon={LayoutGrid} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                    <NavItem icon={Video} label="Recordings" onClick={() => onNavigate('library')} />
                    <NavItem icon={Mic} label="Studios" />
                    <NavItem icon={Calendar} label="Schedule" active={activeView === 'schedule'} onClick={() => setActiveView('schedule')} />
                    <NavItem icon={Settings} label="Settings" onClick={() => onNavigate('settings')} />
                </nav>

                <div className="mt-auto pt-10 px-2">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-accent-purple/20 to-accent-pink/20 border border-white/10">
                        <p className="text-xs font-semibold text-accent-purple uppercase tracking-wider mb-2">Storage Plan</p>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-white/60">Used</span>
                            <span>85%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-accent-purple w-[85%]" />
                        </div>
                        <button className="w-full mt-4 py-2 px-4 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-colors">
                            Upgrade Storage
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {activeView === 'dashboard' ? (
                    <>
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                            <div>
                                <h1 className="text-3xl font-bold">Welcome back, {user?.fullName || 'Creator'}!</h1>
                                <p className="text-white/50">Everything is ready for your next recording.</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setActiveView('schedule')}
                                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold flex items-center gap-2 transition-all"
                                >
                                    <Calendar className="w-4 h-4" /> Schedule
                                </button>
                                <button
                                    onClick={() => onEnterStudio()}
                                    className="px-6 py-2.5 bg-accent-purple hover:bg-accent-purple/90 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-accent-purple/20">
                                    <Plus className="w-5 h-5" /> New Recording
                                </button>
                            </div>
                        </header>

                        {/* Analytics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <StatsCard icon={Video} label="Total Recordings" value="24" trend="+3 this month" />
                            <StatsCard icon={Clock} label="Recording Time" value="48h 22m" trend="+12h this month" />
                            <StatsCard icon={Database} label="Storage Used" value="128.5 GB" trend="High usage" />
                        </div>

                        {/* Studios Grid */}
                        <div className="mb-10">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Mic className="w-5 h-5 text-accent-cyan" /> Your Studios
                                </h2>
                                <button className="text-accent-purple text-sm font-semibold hover:underline">View All Studios</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {isLoading ? (
                                    <div className="col-span-full h-40 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-accent-purple" />
                                    </div>
                                ) : (
                                    <>
                                        {studios.map((studio, index) => (
                                            <StudioCard
                                                key={studio.id || `studio-${index}`}
                                                id={studio.id}
                                                name={studio.name}
                                                inviteCode={studio.inviteCode}
                                                count={0}
                                                lastDate={studio.createdAt ? new Date(studio.createdAt).toLocaleDateString() : "New"}
                                                onEnter={() => onEnterStudio(studio)}
                                                onDelete={() => handleDeleteStudio(studio.id, studio.name)}
                                                onCopyInvite={() => {
                                                    const link = `${window.location.origin}/join/${studio.inviteCode}`;
                                                    navigator.clipboard.writeText(link);
                                                    alert(`Invite link for "${studio.name}" copied to clipboard!\n\n${link}`);
                                                }}
                                            />
                                        ))}
                                        <div
                                            onClick={handleCreateStudio}
                                            className="border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 hover:bg-white/5 transition-colors cursor-pointer group">
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-all mb-4">
                                                {isCreating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6 text-white/40" />}
                                            </div>
                                            <p className="font-bold text-white/40">{isCreating ? 'Creating...' : 'Create New Studio'}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Recent Recordings */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Recent Recordings</h2>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <input
                                        type="text"
                                        placeholder="Search recordings..."
                                        className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent-purple/50 w-64"
                                    />
                                </div>
                            </div>

                            <div className="bg-card/50 border border-white/5 rounded-3xl overflow-hidden">
                                {recordings.length === 0 ? (
                                    <div className="p-10 text-center text-white/30 italic">
                                        No recordings found. Join a studio to start your first session!
                                    </div>
                                ) : (
                                    recordings.map((recording, index) => (
                                        <RecordingItem
                                            key={recording.id || `recording-${index}`}
                                            title={recording.title}
                                            duration={recording.duration}
                                            date={new Date(recording.createdAt).toLocaleDateString()}
                                            studio={recording.studio?.name || 'Unknown Studio'}
                                            fileUrl={recording.fileUrl}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                ) : activeView === 'schedule' ? (
                    <SchedulePanel studios={studios} onEnterStudio={onEnterStudio} />
                ) : (
                    <div className="flex items-center justify-center h-full text-white/20 italic">
                        View under construction...
                    </div>
                )}
            </main>
        </div>
    );
};

const NavItem = ({ icon: Icon, label, active, onClick }) => (
    <div
        onClick={onClick}
        className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all",
            active ? "bg-accent-purple/10 text-accent-purple" : "text-white/50 hover:bg-white/5 hover:text-white"
        )}
    >
        <Icon className="w-5 h-5" />
        <span className="font-semibold">{label}</span>
    </div>
);

const StatsCard = ({ icon: Icon, label, value, trend }) => (
    <div className="p-6 rounded-3xl bg-card border border-white/5 flex items-start justify-between group hover:border-white/10 transition-colors">
        <div>
            <p className="text-sm text-white/50 mb-1">{label}</p>
            <h3 className="text-2xl font-bold mb-2">{value}</h3>
            <p className="text-xs font-medium text-accent-cyan">{trend}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-accent-purple group-hover:scale-110 transition-transform">
            <Icon className="w-6 h-6" />
        </div>
    </div>
);

const StudioCard = ({ id, name, inviteCode, count, lastDate, active, onEnter, onDelete, onCopyInvite }) => (
    <div className="p-6 rounded-3xl bg-card border border-white/5 group relative overflow-hidden">
        {active && (
            <div className="absolute top-0 right-0 p-3">
                <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan"></span>
                </span>
            </div>
        )}
        <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6" />
            </div>
            <div>
                <h4 className="font-bold group-hover:text-accent-purple transition-colors">{name}</h4>
                <p className="text-xs text-white/40">{count} recordings</p>
            </div>
        </div>
        <div className="flex items-center justify-between text-xs text-white/50 mb-6">
            <span>Created: {lastDate}</span>
            <button onClick={onCopyInvite} className="flex items-center gap-1 text-accent-cyan hover:text-accent-cyan/80 font-bold">
                <Share2 className="w-3.5 h-3.5" /> Invite
            </button>
        </div>
        <div className="flex gap-2">
            <button
                onClick={onEnter}
                className="flex-1 py-2 bg-accent-purple hover:bg-accent-purple/90 rounded-xl font-bold transition-all text-sm">
                Enter Studio
            </button>
            <button
                onClick={onDelete}
                className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 rounded-xl transition-all text-red-500"
                title="Delete Studio"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    </div>
);

const RecordingItem = ({ title, duration, date, studio, fileUrl }) => (
    <div className="flex items-center justify-between p-4 px-6 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
        <div className="flex items-center gap-4">
            <div className="w-16 h-10 rounded-lg bg-card border border-white/10 flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/10 to-transparent" />
                <Play className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
            </div>
            <div>
                <h4 className="font-bold text-sm mb-0.5">{title}</h4>
                <div className="flex items-center gap-3 text-xs text-white/40">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {duration}</span>
                    <span>•</span>
                    <span>{date}</span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{studio}</span>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <a
                href={fileUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                title="Download"
            >
                <Download className="w-4 h-4" />
            </a>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white" title="More">
                <MoreVertical className="w-4 h-4" />
            </button>
        </div>
    </div>
);

export default Dashboard;
