import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    List as ListIcon,
    Plus,
    ChevronLeft,
    ChevronRight,
    Clock,
    Video,
    MoreHorizontal,
    Search,
    Users,
    Trash2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import ScheduleForm from './ScheduleForm';

const SchedulePanel = ({ studios, onEnterStudio }) => {
    const { showToast } = useToast();
    const [view, setView] = useState('list'); // 'list' or 'calendar'
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/schedule');
            setSessions(response.data);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
            showToast('error', 'Could not load scheduled sessions');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold">Schedule Session</h2>
                    <p className="text-white/50 text-sm">Plan and manage your upcoming recordings</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => setView('list')}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                view === 'list' ? "bg-accent-purple text-white shadow-lg" : "text-white/40 hover:text-white"
                            )}
                        >
                            <ListIcon className="w-4 h-4" /> List
                        </button>
                        <button
                            onClick={() => setView('calendar')}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                view === 'calendar' ? "bg-accent-purple text-white shadow-lg" : "text-white/40 hover:text-white"
                            )}
                        >
                            <CalendarIcon className="w-4 h-4" /> Calendar
                        </button>
                    </div>

                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-accent-purple hover:bg-accent-purple/90 rounded-xl font-bold text-sm transition-all shadow-lg shadow-accent-purple/20"
                    >
                        <Plus className="w-4 h-4" /> Schedule Session
                    </button>
                </div>
            </div>

            {view === 'list' ? (
                <div className="flex-1 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-4">
                            <button className="text-sm font-bold border-b-2 border-accent-purple pb-1">Upcoming</button>
                            <button className="text-sm font-medium text-white/40 hover:text-white pb-1">Past</button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                                type="text"
                                placeholder="Search sessions..."
                                className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent-purple/50 w-64"
                            />
                        </div>
                    </div>

                    <div className="bg-card/50 border border-white/5 rounded-3xl overflow-hidden min-h-[400px]">
                        {isLoading ? (
                            <div className="flex-1 flex items-center justify-center p-20">
                                <div className="w-8 h-8 border-4 border-accent-purple border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                    <CalendarIcon className="w-10 h-10 text-white/20" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">No upcoming sessions</h3>
                                <p className="text-white/40 max-w-sm mb-8">
                                    You haven't scheduled any recording sessions yet. Start by inviting some guests!
                                </p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all"
                                >
                                    Schedule Your First Session
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {sessions.map(session => (
                                    <SessionRow key={session.id} session={session} onRefresh={fetchSessions} onEnterStudio={onEnterStudio} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 bg-card/50 border border-white/5 rounded-3xl overflow-hidden p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold">January 2026</h3>
                        <div className="flex gap-2">
                            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                            <button className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-colors">Today</button>
                            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="flex-1 grid grid-cols-7 border border-white/5 rounded-2xl overflow-hidden bg-black/20">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="p-4 text-center text-xs font-bold uppercase tracking-wider text-white/30 border-b border-r border-white/5 last:border-r-0">
                                {day}
                            </div>
                        ))}
                        {Array.from({ length: 35 }).map((_, i) => {
                            const dayNum = i + 1 > 31 ? i - 30 : i + 1;
                            const daySessions = sessions.filter(s => new Date(s.startTime).getDate() === dayNum);
                            const isToday = dayNum === new Date().getDate();

                            return (
                                <div key={i} className="min-h-[120px] p-3 border-b border-r border-white/5 last:border-r-0 hover:bg-white/5 transition-colors group cursor-pointer relative">
                                    <span className={cn(
                                        "text-xs font-bold group-hover:text-white transition-colors flex items-center justify-center w-6 h-6 rounded-full",
                                        isToday ? "bg-accent-purple text-white" : "text-white/40"
                                    )}>
                                        {dayNum}
                                    </span>

                                    <div className="mt-2 space-y-1">
                                        {daySessions.map(session => (
                                            <div key={session.id} className="px-2 py-1 rounded bg-accent-purple/20 border border-accent-purple/30 text-[10px] font-bold text-accent-purple truncate">
                                                {session.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Schedule Form Modal */}
            {showForm && (
                <ScheduleForm
                    studios={studios}
                    onClose={() => setShowForm(false)}
                    onSuccess={fetchSessions}
                />
            )}
        </div>
    );
};

const SessionRow = ({ session, onRefresh, onEnterStudio }) => {
    const { showToast } = useToast();
    const startTime = new Date(session.startTime);
    const isLive = session.status === 'LIVE';

    const handleDelete = async () => {
        if (!window.confirm('Cancel this scheduled session?')) return;
        try {
            await api.delete(`/schedule/${session.id}`);
            showToast('success', 'Session cancelled');
            onRefresh();
        } catch (error) {
            showToast('error', 'Failed to cancel session');
        }
    };

    return (
        <div className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors group">
            <div className="flex items-center gap-6">
                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/5 group-hover:border-accent-purple/30 transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{startTime.toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-xl font-bold">{startTime.getDate()}</span>
                </div>

                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-bold">{session.title}</h4>
                        <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            isLive ? "bg-red-500/20 text-red-500 animate-pulse" : "bg-accent-cyan/20 text-accent-cyan"
                        )}>
                            {session.status}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/40">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.expectedDuration}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> {session.recordingType}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {session.guests.length} Guests</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onEnterStudio(session.studio)}
                    className="px-4 py-2 bg-white text-black rounded-xl font-bold text-xs hover:bg-gray-200 transition-all"
                >
                    Start Now
                </button>
                <button className="p-2 hover:bg-white/5 rounded-lg text-white/40 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
                <button
                    onClick={handleDelete}
                    className="p-2 hover:bg-red-500/10 text-white/10 hover:text-red-500 rounded-lg transition-all"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default SchedulePanel;
