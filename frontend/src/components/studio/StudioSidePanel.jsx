import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Users, FileText, Send, Heart, ThumbsUp, Flame, Crown, User, PenTool } from 'lucide-react';
import LiveExplain from './LiveExplain';
import { cn } from '../../lib/utils';

const StudioSidePanel = ({ isOpen, onClose, currentUser, participants = [], initialTab = 'chat' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [chatMessage, setChatMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    const handleSendMessage = () => {
        if (!chatMessage.trim()) return;

        setChatMessages(prev => [...prev, {
            id: Date.now(),
            user: currentUser?.fullName || 'You',
            message: chatMessage,
            timestamp: new Date(),
            isHost: true
        }]);
        setChatMessage('');
    };

    const handleReaction = (emoji) => {
        setChatMessages(prev => [...prev, {
            id: Date.now(),
            user: currentUser?.fullName || 'You',
            message: emoji,
            timestamp: new Date(),
            isReaction: true
        }]);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.aside
                    initial={{ x: 400 }}
                    animate={{ x: 0 }}
                    exit={{ x: 400 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed right-0 top-0 bottom-0 w-96 bg-card/95 backdrop-blur-2xl border-l border-white/10 flex flex-col z-50 shadow-2xl"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <div className="flex gap-2">
                            <TabButton
                                icon={MessageSquare}
                                label="Chat"
                                active={activeTab === 'chat'}
                                onClick={() => setActiveTab('chat')}
                            />
                            <TabButton
                                icon={Users}
                                label="People"
                                active={activeTab === 'people'}
                                onClick={() => setActiveTab('people')}
                                badge={participants.length}
                            />
                            <TabButton
                                icon={FileText}
                                label="Notes"
                                active={activeTab === 'notes'}
                                onClick={() => setActiveTab('notes')}
                            />
                            <TabButton
                                icon={PenTool}
                                label="Explain"
                                active={activeTab === 'explain'}
                                onClick={() => setActiveTab('explain')}
                            />
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden">
                        {activeTab === 'chat' && (
                            <div className="h-full flex flex-col">
                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {chatMessages.length === 0 ? (
                                        <div className="h-full flex items-center justify-center">
                                            <p className="text-white/30 text-sm italic">No messages yet. Start the conversation!</p>
                                        </div>
                                    ) : (
                                        chatMessages.map(msg => (
                                            <div key={msg.id} className={cn(
                                                "flex gap-3",
                                                msg.isReaction && "justify-center"
                                            )}>
                                                {!msg.isReaction && (
                                                    <>
                                                        <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-xs font-bold">{msg.user[0]}</span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-sm font-bold">{msg.user}</span>
                                                                {msg.isHost && <Crown className="w-3 h-3 text-yellow-500" />}
                                                                <span className="text-xs text-white/30">
                                                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-white/80">{msg.message}</p>
                                                        </div>
                                                    </>
                                                )}
                                                {msg.isReaction && (
                                                    <div className="px-4 py-2 bg-white/5 rounded-full text-2xl">
                                                        {msg.message}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Reactions */}
                                <div className="px-6 py-3 border-t border-white/5 flex gap-2">
                                    <ReactionButton emoji="👏" onClick={() => handleReaction('👏')} />
                                    <ReactionButton emoji="❤️" onClick={() => handleReaction('❤️')} />
                                    <ReactionButton emoji="🔥" onClick={() => handleReaction('🔥')} />
                                </div>

                                {/* Input */}
                                <div className="p-6 border-t border-white/10">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Type a message..."
                                            value={chatMessage}
                                            onChange={(e) => setChatMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pr-12 focus:outline-none focus:border-accent-purple/50"
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={!chatMessage.trim()}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent-purple hover:bg-accent-purple/90 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'people' && (
                            <div className="p-6 space-y-3">
                                {participants.map((participant, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-accent-purple/20 flex items-center justify-center">
                                            <span className="text-sm font-bold">{participant.name[0]}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">{participant.name}</span>
                                                {participant.isHost && <Crown className="w-4 h-4 text-yellow-500" />}
                                            </div>
                                            <span className="text-xs text-white/40">{participant.role || 'Guest'}</span>
                                        </div>
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            participant.active ? "bg-green-500" : "bg-white/20"
                                        )} />
                                    </div>
                                ))}
                                {participants.length === 0 && (
                                    <div className="text-center py-12">
                                        <p className="text-white/30 text-sm italic">No participants yet</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'notes' && (
                            <div className="p-6 h-full">
                                <textarea
                                    placeholder="Take notes during your recording..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full h-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-accent-purple/50 resize-none"
                                />
                            </div>
                        )}

                        {activeTab === 'explain' && (
                            <div className="h-full p-4 overflow-hidden">
                                <LiveExplain />
                            </div>
                        )}
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
};

const TabButton = ({ icon: Icon, label, active, onClick, badge }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all relative",
            active ? "bg-accent-purple text-white" : "text-white/50 hover:bg-white/5 hover:text-white"
        )}
    >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
        {badge !== undefined && badge > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                {badge}
            </span>
        )}
    </button>
);

const ReactionButton = ({ emoji, onClick }) => (
    <button
        onClick={onClick}
        className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xl transition-all hover:scale-110 active:scale-95"
    >
        {emoji}
    </button>
);

export default StudioSidePanel;
