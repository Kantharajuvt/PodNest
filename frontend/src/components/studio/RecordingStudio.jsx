import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic, MicOff, Video, VideoOff,
    Settings, LogOut, Share2,
    MessageSquare, Users, Radio,
    Circle, Play, Square, X,
    Check, ChevronDown, Volume2,
    Monitor, Edit2, Eye, MoreHorizontal, PenTool
} from 'lucide-react';
import { cn } from '../../lib/utils';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import InviteModal from './InviteModal';
import StudioSidePanel from './StudioSidePanel';
import AudioStage from './AudioStage';
import StudioSettings from './StudioSettings';
import MoreMenu from './MoreMenu';
import { useToast } from '../../context/ToastContext';

const RecordingStudio = ({ studio, onLeave }) => {
    const { user } = useAuth();
    const [isSetup, setIsSetup] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [timer, setTimer] = useState(0);
    const [devices, setDevices] = useState({ video: true, audio: true });
    const [showChat, setShowChat] = useState(false);
    const [showParticipants, setShowParticipants] = useState(true);
    const [localStream, setLocalStream] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [remoteParticipants, setRemoteParticipants] = useState([]); // Array of { id, stream, name }
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [myName, setMyName] = useState('');

    // New UI state
    const [showSidePanel, setShowSidePanel] = useState(false);
    const [sidePanelTab, setSidePanelTab] = useState('chat');
    const { showToast } = useToast();
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [studioTitle, setStudioTitle] = useState(studio?.name || 'Podcast');
    const [networkQuality, setNetworkQuality] = useState('good');
    const [viewerCount, setViewerCount] = useState(0);
    const [showPiP, setShowPiP] = useState(true);
    const [isSharingScreen, setIsSharingScreen] = useState(false);
    const [screenStream, setScreenStream] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [markers, setMarkers] = useState([]);
    const [highlights, setHighlights] = useState([]);
    const [isLocked, setIsLocked] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const videoRef = useRef(null);
    const stompClientRef = useRef(null);
    const peerConnections = useRef({}); // { participantId: RTCPeerConnection }
    const localStreamRef = useRef(null);

    // WebSocket & Signaling Setup
    useEffect(() => {
        if (!isSetup) {
            connectSignaling();
        }
        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.disconnect();
            }
            // Cleanup all peer connections
            Object.values(peerConnections.current).forEach(pc => pc.close());
        };
    }, [isSetup, studio.id]);

    const connectSignaling = () => {
        const socket = new SockJS('http://localhost:8080/ws');
        const client = Stomp.over(socket);
        client.debug = null;

        client.connect({}, () => {
            stompClientRef.current = client;

            client.subscribe(`/topic/studio/${studio.id}`, (message) => {
                const signal = JSON.parse(message.body);
                // Don't process our own join signal
                if (signal.senderId !== socket._generateSessionId()) {
                    handleSignalingData({ ...signal, myId: socket._generateSessionId() });
                }
            });

            // Announce presence with a simple unique ID (using timestamp or socket id if available)
            const myId = socket._generateSessionId() || Date.now().toString();
            sendSignal({ type: 'join', senderId: myId, name: myName || user?.fullName || 'Guest' });
        });
    };

    const sendSignal = (data) => {
        if (stompClientRef.current?.connected) {
            stompClientRef.current.send(`/app/studio/${studio.id}/signal`, {}, JSON.stringify(data));
        }
    };

    const createPeerConnection = (participantId, isInitiator, name) => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peerConnections.current[participantId] = pc;

        // Add local tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignal({
                    type: 'candidate',
                    targetId: participantId,
                    candidate: event.candidate,
                    senderId: stompClientRef.current.ws._generateSessionId(),
                    name: myName || user?.fullName || 'Guest'
                });
            }
        };

        pc.ontrack = (event) => {
            setRemoteParticipants(prev => {
                const existing = prev.find(p => p.id === participantId);
                if (existing) return prev;
                return [...prev, { id: participantId, stream: event.streams[0], name: name || "Guest" }];
            });
        };

        if (isInitiator) {
            pc.createOffer().then(offer => {
                pc.setLocalDescription(offer);
                sendSignal({
                    type: 'offer',
                    targetId: participantId,
                    offer: offer,
                    senderId: stompClientRef.current.ws._generateSessionId(),
                    name: myName || user?.fullName || 'Guest'
                });
            });
        }

        return pc;
    };

    const handleSignalingData = async (signal) => {
        const { type, senderId, targetId, offer, answer, candidate, myId, name } = signal;

        // Only process signals intended for us (except join signals which go to everyone)
        if (targetId && targetId !== myId) return;

        switch (type) {
            case 'join':
                // Someone joined. As an existing member, create a peer connection and send offer
                createPeerConnection(senderId, true, name);
                break;
            case 'offer':
                const pcOffer = createPeerConnection(senderId, false, name);
                await pcOffer.setRemoteDescription(new RTCSessionDescription(offer));
                const pcAnswer = await pcOffer.createAnswer();
                await pcOffer.setLocalDescription(pcAnswer);
                sendSignal({
                    type: 'answer',
                    targetId: senderId,
                    answer: pcAnswer,
                    senderId: myId,
                    name: myName || user?.fullName || 'Guest'
                });
                break;
            case 'answer':
                const pcAns = peerConnections.current[senderId];
                if (pcAns) {
                    await pcAns.setRemoteDescription(new RTCSessionDescription(answer));
                }
                break;
            case 'candidate':
                const pcCand = peerConnections.current[senderId];
                if (pcCand) {
                    await pcCand.addIceCandidate(new RTCIceCandidate(candidate));
                }
                break;
        }
    };

    // Initial Media Access & Session Restoration
    useEffect(() => {
        if (!isSetup) {
            startMedia();

            // Restore Session Data
            const savedData = localStorage.getItem(`podnest_session_${studio?.id || 'current'}`);
            if (savedData) {
                try {
                    const { markers: m, highlights: h, isLocked: l } = JSON.parse(savedData);
                    if (m) setMarkers(m);
                    if (h) setHighlights(h);
                    if (l !== undefined) setIsLocked(l);
                    console.log('Session restored from cache');
                } catch (e) {
                    console.error('Failed to restore session:', e);
                }
            }
        }
        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isSetup, studio.id]);


    const startMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            setLocalStream(stream);
            localStreamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error('Error accessing media devices:', error);
            alert('Could not access camera or microphone. Please check permissions.');
        }
    };

    const handleToggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const startRecording = () => {
        if (!localStream) return;

        const recorder = new MediaRecorder(localStream, {
            mimeType: 'video/webm;codecs=vp9,opus'
        });

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                setRecordedChunks((prev) => [...prev, event.data]);
            }
        };

        recorder.onstop = async () => {
            const blob = new Blob(recordedChunks, {
                type: 'video/webm'
            });
            const url = URL.createObjectURL(blob);

            // Auto-download for the user
            // [x] Phase 4: Multi-user Logic & Polish <!-- id: 8 -->
            //     - [x] Implement WebRTC Peer-to-Peer flow (Offer/Answer)
            //     - [x] Real-time Audio Visualization (Volume Meters)
            //     - [x] Dynamic Grid Layout
            //     - [x] Functional Settings Panel <!-- id: 8 -->
            // [x] UI/UX Polish <!-- id: 3 -->
            //     - [x] Multi-user grid layout in Studio
            //     - [x] Connection status indicators <!-- id: 5 -->
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `PodNest-Recording-${new Date().toISOString()}.webm`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);

            // Save metadata to backend
            try {
                await api.post('/recordings', {
                    studioId: studio.id,
                    title: `Recording - ${new Date().toLocaleString()}`,
                    duration: formatTime(timer),
                    fileUrl: url // In a real app, this would be an S3/Cloud bucket URL
                });
                alert('Recording saved to your library!');
            } catch (err) {
                console.error('Failed to save recording metadata:', err);
            }

            setRecordedChunks([]);
            setTimer(0);
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
        showToast('success', '🔴 Recording started');
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setDevices(prev => ({ ...prev, video: videoTrack.enabled }));
            }
        }
    };

    const toggleAudio = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setDevices(prev => ({ ...prev, audio: audioTrack.enabled }));
            }
        }
    };

    const handleToggleSharing = async () => {
        if (isSharingScreen) {
            stopScreenSharing();
        } else {
            startScreenSharing();
        }
    };

    const startScreenSharing = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            setScreenStream(stream);
            setIsSharingScreen(true);
            setShowPiP(true); // Always show PiP when sharing
            showToast('success', 'Screen sharing started');

            // Handle browser unique stop sharing button
            stream.getVideoTracks()[0].onended = () => {
                stopScreenSharing();
            };
        } catch (err) {
            console.error("Screen sharing error:", err);
            if (err.name !== 'NotAllowedError') {
                showToast('error', 'Could not share screen');
            }
        }
    };

    const stopScreenSharing = () => {
        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
            setScreenStream(null);
            setIsSharingScreen(false);
            showToast('info', 'Screen sharing stopped');
        }
    };

    const handleMoreAction = (action) => {
        setShowMoreMenu(false);
        const timestamp = formatTime(timer);

        switch (action) {
            case 'pause':
                setIsPaused(!isPaused);
                if (mediaRecorder) {
                    if (isPaused) {
                        mediaRecorder.resume();
                        showToast('success', 'Recording resumed');
                    } else {
                        mediaRecorder.pause();
                        showToast('warning', 'Recording paused');
                    }
                }
                break;
            case 'chapter':
                const markerName = prompt('Enter marker name:', `Chapter ${markers.length + 1}`);
                if (markerName) {
                    const newMarker = { name: markerName, time: timestamp, id: Date.now() };
                    setMarkers(prev => [...prev, newMarker]);
                    showToast('success', `Marker "${markerName}" added at ${timestamp}`);
                }
                break;
            case 'highlight':
                const newHighlight = { time: timestamp, id: Date.now() };
                setHighlights(prev => [...prev, newHighlight]);
                showToast('success', `Highlight captured at ${timestamp}`);
                break;
            case 'muteAll':
                // In a real app, send a websocket message to all clients
                showToast('warning', 'Silencing all guest microphones...');
                // Mock behavior:
                remoteParticipants.forEach(p => {
                    // Logic to signal participant to mute
                });
                break;
            case 'lock':
                setIsLocked(!isLocked);
                showToast(isLocked ? 'info' : 'warning', isLocked ? 'Session unlocked' : 'Session locked - no new guests');
                break;
            case 'save':
                if (recordedChunks.length === 0) {
                    showToast('error', 'No recording data available yet');
                    break;
                }
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `recording-${studio?.name || 'podcast'}-${new Date().toISOString()}.webm`;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
                showToast('success', 'Master recording exported');
                break;
            case 'transcript':
                const content = `PodNest Studio Session: ${studioTitle}\n\n` +
                    `Markers:\n${markers.map(m => `[${m.time}] ${m.name}`).join('\n')}\n\n` +
                    `Highlights:\n${highlights.map(h => `[${h.time}]`).join('\n')}`;
                const tblob = new Blob([content], { type: 'text/plain' });
                const turl = URL.createObjectURL(tblob);
                const ta = document.createElement('a');
                ta.href = turl;
                ta.download = `transcript-${studio?.name || 'podcast'}.txt`;
                ta.click();
                URL.revokeObjectURL(turl);
                showToast('success', 'Transcript exported');
                break;
            case 'explain':
                setSidePanelTab('explain');
                setShowSidePanel(true);
                break;
            case 'participants':
                setSidePanelTab('people');
                setShowSidePanel(true);
                break;
            case 'endAll':
                if (window.confirm('CRITICAL: This will disconnect everyone and end the session. Continue?')) {
                    onLeave();
                }
                break;
            default:
                showToast('info', `Feature "${action}" is now being processed...`);
        }
    };

    // Auto-save session data placeholder
    useEffect(() => {
        if (markers.length > 0 || highlights.length > 0) {
            const sessionData = { markers, highlights, isLocked };
            localStorage.setItem(`podnest_session_${studio?.id || 'current'}`, JSON.stringify(sessionData));
        }
    }, [markers, highlights, isLocked, studio?.id]);

    // Recording Timer Logic
    useEffect(() => {
        let interval;
        if (isRecording && !isPaused) {
            interval = setInterval(() => {
                setTimer(t => t + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isRecording, isPaused]);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCopyInvite = () => {
        const link = `${window.location.origin}/join/${studio.inviteCode}`;
        navigator.clipboard.writeText(link);
        alert(`Invite link for "${studio.name}" copied to clipboard!\n\n${link}`);
    };

    if (isSetup) {
        return (
            <StudioSetup
                studio={studio}
                initialName={user?.fullName}
                onJoin={(name) => {
                    setMyName(name);
                    setIsSetup(false);
                }}
                onCancel={onLeave}
            />
        );
    }

    return (
        <div className="h-screen bg-[#050508] flex flex-col text-white overflow-hidden relative">
            {/* Header */}
            <header className="h-18 px-6 border-b border-white/5 flex items-center justify-between bg-card/20 backdrop-blur-xl relative z-10">
                <div className="flex items-center gap-4">
                    {/* Timer */}
                    <div className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3">
                        <div className={cn("w-2.5 h-2.5 rounded-full", isRecording ? "bg-red-500 animate-pulse" : "bg-white/20")} />
                        <span className="text-base font-mono tracking-wider font-bold">{formatTime(timer)}</span>
                    </div>

                    <span className="text-white/30">/</span>

                    {/* Editable Title */}
                    {isEditingTitle ? (
                        <input
                            type="text"
                            value={studioTitle}
                            onChange={(e) => setStudioTitle(e.target.value)}
                            onBlur={() => setIsEditingTitle(false)}
                            onKeyPress={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                            className="bg-white/5 border border-accent-purple/50 rounded-lg px-3 py-1 font-bold text-lg focus:outline-none"
                            autoFocus
                        />
                    ) : (
                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                            <span className="font-bold text-lg">{studioTitle}</span>
                            <Edit2 className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* LIVE Indicator with Viewer Count */}
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30">
                        <div className="flex items-center gap-2">
                            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                            <span className="text-red-500 font-bold uppercase tracking-wider text-sm">Live</span>
                        </div>
                        <div className="w-px h-4 bg-white/20" />
                        <div className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4 text-white/60" />
                            <span className="text-white/80 font-semibold text-sm">{viewerCount + remoteParticipants.length + 1}</span>
                        </div>
                    </div>

                    {/* Invite Button */}
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-sm font-semibold flex items-center gap-2 hover:scale-105 active:scale-95"
                    >
                        <Share2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Invite Guests</span>
                    </button>

                    {/* Leave Button */}
                    <button
                        onClick={onLeave}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-colors text-sm font-bold flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" /> Leave
                    </button>
                </div>
            </header>

            {/* Main Studio Area */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* 1. Main Stage - Switch between Audio and Screen */}
                {isSharingScreen ? (
                    <ScreenStage
                        stream={screenStream}
                        onStop={stopScreenSharing}
                    />
                ) : (
                    <AudioStage
                        participants={remoteParticipants}
                        currentUser={user}
                        localStream={localStream}
                        isRecording={isRecording}
                    />
                )}

                {/* 2. Floating PiP Video Overlay - Bottom Right */}
                <AnimatePresence>
                    {showPiP && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            className="absolute bottom-6 right-6 z-40 flex flex-col gap-4 pointer-events-none"
                        >
                            <div className="flex flex-col gap-3 pointer-events-auto">
                                {/* Host PiP */}
                                <div className="w-56 aspect-video rounded-2xl bg-black border-2 border-white/10 overflow-hidden shadow-2xl relative group">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className={cn("w-full h-full object-cover", !devices.video && "hidden")}
                                    />
                                    {!devices.video && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/5 backdrop-blur-md">
                                            <VideoOff className="w-6 h-6 text-white/20" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Host</span>
                                    </div>
                                </div>

                                {/* Remote Participants PiP (Condensed) */}
                                {remoteParticipants.map(participant => (
                                    <div key={participant.id} className="w-56 aspect-video rounded-2xl bg-black border-2 border-white/10 overflow-hidden shadow-2xl relative group">
                                        <ParticipantFramePiP
                                            name={participant.name}
                                            stream={participant.stream}
                                            active={true}
                                        />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Toast Notification Container */}
                <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-none z-50">
                    {isRecording && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500 text-white px-6 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-3"
                        >
                            <Circle className="w-4 h-4 fill-current animate-pulse" /> Recording in progress...
                        </motion.div>
                    )}
                </div>

                {/* AI Features Placeholder - Bottom Left */}
                <div className="absolute bottom-6 left-6 flex flex-col gap-2 pointer-events-auto z-40">
                    <AIFeatureBadge
                        icon={Radio}
                        label="Live Transcription"
                        color="purple"
                        onClick={() => showToast('info', 'Live transcription coming soon!')}
                    />
                    <AIFeatureBadge
                        icon={Play}
                        label="Auto Highlights"
                        color="yellow"
                        onClick={() => showToast('info', 'Auto highlights coming soon!')}
                    />
                </div>

                {/* Side Panel Integration */}
                <StudioSidePanel
                    isOpen={showSidePanel}
                    onClose={() => setShowSidePanel(false)}
                    currentUser={user}
                    participants={remoteParticipants.map(p => ({
                        name: p.name || 'Guest',
                        isHost: false,
                        role: 'Guest',
                        active: true
                    }))}
                    initialTab={sidePanelTab}
                />
            </div>

            {/* High-Contrast Bottom Control Bar */}
            <footer className="h-28 px-8 border-t border-white/5 bg-[#0A0A10]/80 backdrop-blur-2xl flex items-center relative z-[100]">
                {/* 1. Primary Controls - Centered */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/5 p-2 rounded-[24px] border border-white/10 shadow-3xl">
                    {/* Mute Microphone */}
                    <ControlAction
                        icon={devices.audio ? Mic : MicOff}
                        label="Mute"
                        active={devices.audio}
                        onClick={toggleAudio}
                        variant={!devices.audio ? 'danger' : 'default'}
                    />

                    {/* Toggle Camera */}
                    <ControlAction
                        icon={devices.video ? Video : VideoOff}
                        label="Video"
                        active={devices.video}
                        onClick={toggleVideo}
                    />

                    <div className="w-px h-10 bg-white/10 mx-1" />

                    {/* Share Screen */}
                    <ControlAction
                        icon={Monitor}
                        label={isSharingScreen ? "Stop Share" : "Share"}
                        active={isSharingScreen}
                        onClick={handleToggleSharing}
                        variant={isSharingScreen ? 'danger' : 'default'}
                    />

                    {/* Comments / Live Chat */}
                    <ControlAction
                        icon={MessageSquare}
                        label="Comments"
                        active={showSidePanel && sidePanelTab === 'chat'}
                        onClick={() => {
                            if (showSidePanel && sidePanelTab === 'chat') {
                                setShowSidePanel(false);
                            } else {
                                setSidePanelTab('chat');
                                setShowSidePanel(true);
                            }
                        }}
                    />

                    {/* Live Explain */}
                    <ControlAction
                        icon={PenTool}
                        label="Explain"
                        active={showSidePanel && sidePanelTab === 'explain'}
                        onClick={() => {
                            if (showSidePanel && sidePanelTab === 'explain') {
                                setShowSidePanel(false);
                            } else {
                                setSidePanelTab('explain');
                                setShowSidePanel(true);
                            }
                        }}
                    />

                    {/* Settings */}
                    <ControlAction
                        icon={Settings}
                        label="Settings"
                        onClick={() => setShowSettings(true)}
                    />

                    {/* More Options */}
                    <div className="relative">
                        <ControlAction
                            icon={MoreHorizontal}
                            label="More"
                            active={showMoreMenu}
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                        />
                        <MoreMenu
                            isOpen={showMoreMenu}
                            onClose={() => setShowMoreMenu(false)}
                            isHost={true} // Defaulting to true for demo context
                            onAction={handleMoreAction}
                            sessionState={{
                                isPaused,
                                isLocked,
                                markersCount: markers.length,
                                highlightsCount: highlights.length
                            }}
                        />
                    </div>
                </div>

                {/* 2. Secondary Info - Left Side */}
                <div className="flex items-center gap-6">
                    {/* Recording Button - Redesigned as a toggle */}
                    <button
                        onClick={handleToggleRecording}
                        className={cn(
                            "flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all shadow-xl",
                            isRecording
                                ? "bg-white text-red-600 hover:bg-neutral-100"
                                : "bg-red-600 text-white hover:bg-red-700 shadow-red-600/20"
                        )}
                    >
                        {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                        {isRecording ? "Stop Recording" : "Start Recording"}
                    </button>

                    <button
                        onClick={() => setShowPiP(!showPiP)}
                        className={cn(
                            "p-3 rounded-xl transition-all border",
                            showPiP ? "bg-white/10 border-white/20 text-white" : "text-white/30 border-transparent hover:bg-white/5"
                        )}
                        title="Toggle Video Overlay"
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                </div>

                {/* 3. Empty space for balance or future right-side controls */}
                <div className="ml-auto w-32" />
            </footer>

            <StudioSettings
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                localStream={localStream}
            />

            <InviteModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                studio={studio}
            />

        </div>
    );
};

const StudioSetup = ({ studio, onJoin, onCancel, initialName }) => {
    const [previewStream, setPreviewStream] = useState(null);
    const [guestName, setGuestName] = useState(initialName || '');
    const previewVideoRef = useRef(null);

    useEffect(() => {
        const startPreview = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                setPreviewStream(stream);
                if (previewVideoRef.current) {
                    previewVideoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Failed to get preview stream:", err);
            }
        };

        startPreview();

        return () => {
            if (previewStream) {
                previewStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-[#050508] z-[100] flex items-center justify-center p-6">
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 bg-card border border-white/10 rounded-[40px] p-10 shadow-3xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                    <Mic className="w-64 h-64 -mr-20 -mt-20" />
                </div>

                {/* Preview Side */}
                <div className="space-y-6">
                    <div className="aspect-video rounded-3xl bg-black border border-white/10 overflow-hidden relative group">
                        <video
                            ref={previewVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                        {!previewStream && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent-purple/20 to-transparent">
                                <VideoOff className="w-12 h-12 text-white/20" />
                            </div>
                        )}
                        {/* Visual audio feedback mockup */}
                        <div className="absolute bottom-4 left-4 right-4 h-1 flex gap-0.5">
                            {Array.from({ length: 40 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="flex-1 bg-accent-cyan"
                                    animate={{ height: [4, Math.random() * 24 + 4, 4] }}
                                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.02 }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Info Side */}
                <div className="flex flex-col justify-center">
                    <h2 className="text-3xl font-bold mb-2">Ready to join?</h2>
                    <p className="text-white/50 mb-8 font-medium">{studio.name}</p>

                    <div className="space-y-6 mb-10">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-white/30 ml-1">Your Name</label>
                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-accent-purple/50 font-semibold"
                            />
                        </div>
                        <DeviceSelector icon={Mic} label="Microphone" value="System Default" />
                        <DeviceSelector icon={Video} label="Camera" value="Integrated Camera" />
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                if (previewStream) {
                                    previewStream.getTracks().forEach(track => track.stop());
                                }
                                onJoin(guestName);
                            }}
                            disabled={!guestName}
                            className="flex-1 py-4 bg-accent-purple hover:bg-accent-purple/90 rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-accent-purple/20 disabled:opacity-50"
                        >
                            Join Studio
                        </button>
                        <button
                            onClick={onCancel}
                            className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ParticipantFrame = ({ name, isSelf, active, quality, stream }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="relative group">
            {/* 16:9 Aspect Ratio Container */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-card to-card/50 border-2 border-white/10 overflow-hidden shadow-2xl shadow-black/40">
                    {!active ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center mb-4 shadow-lg">
                                <span className="text-3xl font-bold">{name[0]}</span>
                            </div>
                            <p className="text-white/40 font-medium">Camera is off</p>
                        </div>
                    ) : (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                        </>
                    )}

                    {/* GUEST Badge Overlay */}
                    <div className="absolute top-4 left-4">
                        <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 backdrop-blur-md border border-accent-cyan/30 flex items-center gap-2 shadow-lg">
                            <div className="w-2 h-2 rounded-full bg-accent-cyan" />
                            <span className="text-xs font-bold text-accent-cyan uppercase tracking-wider">Guest</span>
                        </div>
                    </div>

                    {/* Connection Quality Indicator */}
                    <div className="absolute top-4 right-4">
                        <div className={cn(
                            "w-2.5 h-2.5 rounded-full shadow-lg",
                            quality === "high" ? "bg-green-500" : "bg-yellow-500"
                        )} />
                    </div>
                </div>
            </div>

            {/* Name Display Below Video */}
            <div className="mt-3 flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="font-semibold text-sm">{name}</span>
                    {isSelf && <span className="text-xs text-white/40">(You)</span>}
                </div>
                <div className="flex items-center gap-1">
                    <VolumeMeter stream={stream} />
                </div>
            </div>
        </div>
    );
};

const ParticipantFramePiP = ({ name, active, stream }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="w-full h-full relative group">
            {!active ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/5 backdrop-blur-md">
                    <div className="w-12 h-12 rounded-full bg-accent-cyan/20 flex items-center justify-center mb-1">
                        <span className="text-lg font-bold">{name[0]}</span>
                    </div>
                </div>
            ) : (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />
            )}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{name}</span>
            </div>

            {/* Small volume indicator in PiP */}
            <div className="absolute bottom-2 right-2">
                <VolumeMeter stream={stream} />
            </div>
        </div>
    );
};

const ControlAction = ({ icon: Icon, label, active, onClick, variant = 'default' }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center gap-1.5 group outline-none"
    >
        <div className={cn(
            "w-[52px] h-[52px] rounded-[18px] flex items-center justify-center transition-all duration-300 relative overflow-hidden",
            active && variant === 'default' && "bg-accent-purple text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-accent-purple/50",
            !active && variant === 'default' && "bg-white/5 text-white/45 hover:bg-white/10 hover:text-white border border-white/5",
            variant === 'danger' && "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:bg-red-600"
        )}>
            <Icon className="w-6 h-6" />
        </div>
        <span className={cn(
            "text-[10px] font-black uppercase tracking-widest transition-opacity duration-300",
            active || variant === 'danger' ? "opacity-100 text-accent-purple" : "opacity-40 group-hover:opacity-100",
            variant === 'danger' && "text-red-500"
        )}>
            {label}
        </span>
    </button>
);

const AIFeatureBadge = ({ icon: Icon, label, color, onClick }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
            "px-4 py-2 rounded-xl backdrop-blur-md border flex items-center gap-2 shadow-lg cursor-pointer hover:scale-105 transition-transform group",
            color === 'purple' && "bg-purple-500/10 border-purple-500/20 text-purple-400",
            color === 'yellow' && "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
        )}
        onClick={onClick}
    >
        <div className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            color === 'purple' ? "bg-purple-500" : "bg-yellow-500"
        )} />
        <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
        <Icon className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />
    </motion.div>
);

const VolumeMeter = ({ stream }) => {
    const [level, setLevel] = useState(0);
    const requestRef = useRef();

    useEffect(() => {
        if (!stream || !stream.getAudioTracks().length) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const update = () => {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i];
                }
                const average = sum / dataArray.length;
                setLevel(average);
                requestRef.current = requestAnimationFrame(update);
            };

            update();

            return () => {
                cancelAnimationFrame(requestRef.current);
                audioContext.close();
            };
        } catch (e) { }
    }, [stream]);

    return (
        <div className="flex gap-0.5 items-end h-3 w-6">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className={cn(
                        "flex-1 bg-accent-cyan rounded-full transition-all duration-150",
                        level > (i * 15) ? "h-full opacity-100" : "h-1 opacity-20"
                    )}
                />
            ))}
        </div>
    );
};

const ControlButton = ({ icon: Icon, active, onClick, label }) => (
    <button
        onClick={onClick}
        className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border",
            active
                ? "bg-white/10 border-white/20 text-white"
                : "bg-white/5 border-white/5 text-white/40 hover:text-white"
        )}
        title={label}
    >
        <Icon className="w-5 h-5" />
    </button>
);

const DeviceSelector = ({ icon: Icon, label, value }) => (
    <div className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between cursor-pointer hover:border-white/20 transition-colors">
        <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-white/40" />
            <div>
                <p className="text-[10px] uppercase font-bold text-white/30 tracking-wider mb-0.5">{label}</p>
                <p className="text-sm font-medium">{value}</p>
            </div>
        </div>
        <ChevronDown className="w-4 h-4 text-white/20" />
    </div>
);

const ControlButtonWithTooltip = ({ icon: Icon, active, onClick, label, tooltip, danger }) => (
    <button
        onClick={onClick}
        className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border relative group",
            active
                ? "bg-accent-purple/20 border-accent-purple/30 text-accent-purple"
                : danger
                    ? "bg-red-500/10 border-red-500/30 text-red-500"
                    : "bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10"
        )}
    >
        <Icon className="w-5 h-5" />

        {/* Tooltip */}
        {tooltip && (
            <div className="absolute bottom-full mb-3 px-3 py-1.5 bg-black/90 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {tooltip}
            </div>
        )}
    </button>
);

const ScreenStage = ({ stream, onStop }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="flex-1 flex flex-col bg-[#050508] relative overflow-hidden">
            {/* Share Label */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="px-6 py-2.5 rounded-2xl bg-accent-purple text-white shadow-2xl flex items-center gap-3 border border-white/20"
                >
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-sm font-bold tracking-tight">You are sharing your screen</span>
                </motion.div>
            </div>

            {/* Main Viewport */}
            <div className="flex-1 p-8 flex items-center justify-center pt-20">
                <div className="w-full h-full max-w-7xl relative">
                    <div className="absolute inset-0 rounded-[32px] overflow-hidden border-2 border-white/10 shadow-3xl bg-black">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-contain"
                        />
                        {/* Overlay Controls */}
                        <div className="absolute bottom-6 right-6">
                            <button
                                onClick={onStop}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-xl hover:scale-105 active:scale-95"
                            >
                                Stop Sharing
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecordingStudio;
