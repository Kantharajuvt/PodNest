import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Search, Filter, LayoutGrid, List,
    Download, Edit2, Share2, Trash2,
    Calendar, Clock, MoreVertical,
    ChevronRight, Play, FileVideo,
    ExternalLink, CheckSquare, Square
} from 'lucide-react';
import { cn } from '../../lib/utils';

const LIBRARY_DATA = [
    {
        id: 1,
        title: "Deep Dive into Web3",
        studio: "Tech Insiders",
        duration: "45:12",
        date: "Jan 24, 2026",
        thumbnail: "bg-accent-purple/20",
        status: "ready"
    },
    {
        id: 2,
        title: "Health & Wellness Tips",
        studio: "Morning Coffee Chat",
        duration: "12:05",
        date: "Jan 22, 2026",
        thumbnail: "bg-accent-cyan/20",
        status: "processing"
    },
    {
        id: 3,
        title: "Product Launch Strategy",
        studio: "PodNest Official",
        duration: "32:45",
        date: "Jan 18, 2026",
        thumbnail: "bg-accent-pink/20",
        status: "ready"
    },
    {
        id: 4,
        title: "Future of AI Marketing",
        studio: "Tech Insiders",
        duration: "01:15:20",
        date: "Jan 15, 2026",
        thumbnail: "bg-accent-purple/20",
        status: "ready"
    }
];

const RecordingsLibrary = ({ onBack }) => {
    const [view, setView] = useState('grid');
    const [selected, setSelected] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleSelect = (id) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div className="flex-1 p-8 overflow-y-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <button onClick={onBack} className="text-white/40 hover:text-white transition-colors flex items-center gap-2 mb-2 text-sm">
                        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold">Recordings Library</h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search recordings..."
                            className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-accent-purple/50 w-64 md:w-80"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
                        <Filter className="w-5 h-5" />
                    </button>
                    <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
                        <button
                            onClick={() => setView('grid')}
                            className={cn("p-1.5 rounded-lg transition-all", view === 'grid' ? "bg-accent-purple text-white shadow-lg" : "text-white/40")}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={cn("p-1.5 rounded-lg transition-all", view === 'list' ? "bg-accent-purple text-white shadow-lg" : "text-white/40")}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Bulk Actions Bar */}
            {selected.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-4 bg-accent-purple/10 border border-accent-purple/20 rounded-2xl flex items-center justify-between shadow-lg shadow-accent-purple/5"
                >
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-accent-purple">{selected.length} items selected</span>
                        <div className="w-px h-6 bg-accent-purple/20" />
                        <button className="text-sm font-semibold hover:text-accent-purple transition-colors flex items-center gap-2">
                            <Download className="w-4 h-4" /> Bulk Download
                        </button>
                        <button className="text-sm font-semibold hover:text-red-400 transition-colors flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                    </div>
                    <button onClick={() => setSelected([])} className="text-xs font-bold uppercase tracking-wider text-white/40 hover:text-white transition-colors">
                        Clear Selection
                    </button>
                </motion.div>
            )}

            {/* Content */}
            <div className={cn(
                "grid gap-6",
                view === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
            )}>
                {LIBRARY_DATA.map((item) => (
                    view === 'grid' ? (
                        <RecordingCard
                            key={item.id}
                            item={item}
                            isSelected={selected.includes(item.id)}
                            onToggleSelect={() => toggleSelect(item.id)}
                        />
                    ) : (
                        <RecordingListItem
                            key={item.id}
                            item={item}
                            isSelected={selected.includes(item.id)}
                            onToggleSelect={() => toggleSelect(item.id)}
                        />
                    )
                ))}
            </div>
        </div>
    );
};

const RecordingCard = ({ item, isSelected, onToggleSelect }) => (
    <motion.div
        layout
        className={cn(
            "p-4 rounded-[32px] bg-card border transition-all group cursor-default",
            isSelected ? "border-accent-purple ring-4 ring-accent-purple/10" : "border-white/5 hover:border-white/10"
        )}
    >
        <div className={cn("aspect-video rounded-2xl mb-4 relative overflow-hidden", item.thumbnail)}>
            <div className="absolute inset-0 flex items-center justify-center">
                <Play className="w-12 h-12 text-white/20 group-hover:scale-110 group-hover:text-white transition-all" />
            </div>

            <button
                onClick={onToggleSelect}
                className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all hover:bg-black/80"
            >
                {isSelected ? <CheckSquare className="w-4 h-4 text-accent-purple" /> : <Square className="w-4 h-4 text-white/40" />}
            </button>

            {item.status === 'processing' && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center px-6">
                    <div className="w-full">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2">
                            <span>Uploading</span>
                            <span className="animate-pulse">65%</span>
                        </div>
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-accent-cyan w-2/3" />
                        </div>
                    </div>
                </div>
            )}

            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold font-mono border border-white/10 uppercase">
                {item.duration}
            </div>
        </div>

        <div className="px-1">
            <div className="flex justify-between items-start mb-2 gap-4">
                <h3 className="font-bold leading-snug group-hover:text-accent-purple transition-colors truncate">{item.title}</h3>
                <button className="p-1 hover:bg-white/5 rounded-lg text-white/40"><MoreVertical className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white/40">{item.studio}</span>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span className="text-xs text-white/40">{item.date}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button className="p-2 hover:bg-accent-purple/10 hover:text-accent-purple transition-colors rounded-xl text-white/30" title="Download">
                        <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-accent-cyan/10 hover:text-accent-cyan transition-colors rounded-xl text-white/30" title="Edit">
                        <Edit2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    </motion.div>
);

const RecordingListItem = ({ item, isSelected, onToggleSelect }) => (
    <motion.div
        layout
        className={cn(
            "flex items-center gap-6 p-4 rounded-2xl bg-card/50 border transition-all group",
            isSelected ? "border-accent-purple/30 bg-accent-purple/5" : "border-white/5 hover:bg-white/5"
        )}
    >
        <button onClick={onToggleSelect} className="text-white/20 hover:text-accent-purple">
            {isSelected ? <CheckSquare className="w-5 h-5 text-accent-purple" /> : <Square className="w-5 h-5" />}
        </button>

        <div className={cn("w-20 h-12 rounded-lg relative overflow-hidden flex-shrink-0", item.thumbnail)}>
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <FileVideo className="w-6 h-6 text-white/20" />
            </div>
        </div>

        <div className="flex-1 min-w-0">
            <h3 className="font-bold truncate">{item.title}</h3>
            <p className="text-xs text-white/40">{item.studio} • {item.date}</p>
        </div>

        <div className="flex items-center gap-8 font-mono text-sm text-white/60">
            {item.duration}
        </div>

        <div className="flex items-center gap-2">
            <button className="p-2.5 bg-white/5 hover:bg-accent-purple text-white/60 hover:text-white rounded-xl transition-all">
                <Download className="w-4 h-4" />
            </button>
            <button className="p-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all">
                <ExternalLink className="w-4 h-4" />
            </button>
            <button className="p-2.5 bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-500 rounded-xl transition-all">
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    </motion.div>
);

export default RecordingsLibrary;
