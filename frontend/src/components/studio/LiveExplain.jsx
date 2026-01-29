import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Pencil,
    Eraser,
    Type,
    Highlighter,
    Trash2,
    ExternalLink,
    MousePointer2,
    Maximize2,
    Crop,
    Check
} from 'lucide-react';
import { cn } from '../../lib/utils';

const COLORS = [
    '#ffffff', // White
    '#f87171', // Red
    '#4ade80', // Green
    '#60a5fa', // Blue
    '#facc15', // Yellow
    '#c084fc', // Purple
];

const FONT_SIZES = [
    { label: 'S', value: '14px' },
    { label: 'M', value: '18px' },
    { label: 'L', value: '24px' },
    { label: 'H', value: '32px' },
];

const LiveExplain = () => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('pen'); // pen, highlighter, eraser, text, select
    const [color, setColor] = useState('#ffffff');
    const [fontSize, setFontSize] = useState('18px');
    const [lineWidth, setLineWidth] = useState(2);

    // Text State
    const [textInput, setTextInput] = useState({ show: false, x: 0, y: 0, value: '' });

    // Selection State
    const [selection, setSelection] = useState({ show: false, x: 0, y: 0, w: 0, h: 0 });
    const [isSelecting, setIsSelecting] = useState(false);
    const [showSelectionMenu, setShowSelectionMenu] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const parent = canvas.parentElement;
        canvas.width = parent.clientWidth * 2;
        canvas.height = parent.clientHeight * 2;
        canvas.style.width = `${parent.clientWidth}px`;
        canvas.style.height = `${parent.clientHeight}px`;

        const context = canvas.getContext('2d');
        context.scale(2, 2);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        contextRef.current = context;

        // Initial background fill
        context.fillStyle = '#0A0A10';
        context.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    const startAction = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;

        if (tool === 'text') {
            // Commit any existing text if user clicks elsewhere
            if (textInput.show && textInput.value.trim()) {
                commitText();
            }
            setTextInput({ show: true, x: offsetX, y: offsetY, value: '' });
            return;
        }

        if (tool === 'select') {
            setIsSelecting(true);
            setSelection({ show: true, x: offsetX, y: offsetY, w: 0, h: 0 });
            setShowSelectionMenu(false);
            return;
        }

        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        contextRef.current.strokeStyle = tool === 'eraser' ? '#0A0A10' : color;
        contextRef.current.lineWidth = tool === 'highlighter' ? 18 : (tool === 'eraser' ? 24 : lineWidth);
        contextRef.current.globalAlpha = tool === 'highlighter' ? 0.4 : 1.0;
        setIsDrawing(true);
    };

    const handleAction = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;

        if (isSelecting) {
            setSelection(prev => ({
                ...prev,
                w: offsetX - prev.x,
                h: offsetY - prev.y
            }));
            return;
        }

        if (!isDrawing) return;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
    };

    const stopAction = () => {
        if (isSelecting) {
            setIsSelecting(false);
            if (Math.abs(selection.w) > 5 && Math.abs(selection.h) > 5) {
                setShowSelectionMenu(true);
            } else {
                setSelection({ show: false, x: 0, y: 0, w: 0, h: 0 });
            }
        }
        if (isDrawing) {
            contextRef.current.closePath();
            setIsDrawing(false);
        }
    };

    const commitText = () => {
        if (!textInput.value.trim()) {
            setTextInput({ show: false, x: 0, y: 0, value: '' });
            return;
        }
        const context = contextRef.current;
        context.font = `bold ${fontSize} sans-serif`;
        context.fillStyle = color;
        context.globalAlpha = 1.0;
        // Text Baseline is bottom-left, so we offset by height
        context.fillText(textInput.value, textInput.x, textInput.y + parseInt(fontSize));
        setTextInput({ show: false, x: 0, y: 0, value: '' });
    };

    const handleTextKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            commitText();
        }
        if (e.key === 'Escape') {
            setTextInput({ show: false, x: 0, y: 0, value: '' });
        }
    };

    const handleCrop = () => {
        const canvas = canvasRef.current;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = Math.abs(selection.w) * 2;
        tempCanvas.height = Math.abs(selection.h) * 2;
        const tempCtx = tempCanvas.getContext('2d');

        const sourceX = selection.w > 0 ? selection.x : selection.x + selection.w;
        const sourceY = selection.h > 0 ? selection.y : selection.y + selection.h;

        tempCtx.drawImage(
            canvas,
            sourceX * 2, sourceY * 2, Math.abs(selection.w) * 2, Math.abs(selection.h) * 2,
            0, 0, Math.abs(selection.w) * 2, Math.abs(selection.h) * 2
        );

        const context = contextRef.current;
        context.fillStyle = '#0A0A10';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(tempCanvas, 0, 0, Math.abs(selection.w), Math.abs(selection.h));

        setSelection({ show: false, x: 0, y: 0, w: 0, h: 0 });
        setShowSelectionMenu(false);
    };

    const handleEnlarge = () => {
        const canvas = canvasRef.current;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = Math.abs(selection.w) * 2;
        tempCanvas.height = Math.abs(selection.h) * 2;
        const tempCtx = tempCanvas.getContext('2d');

        const sourceX = selection.w > 0 ? selection.x : selection.x + selection.w;
        const sourceY = selection.h > 0 ? selection.y : selection.y + selection.h;

        tempCtx.drawImage(
            canvas,
            sourceX * 2, sourceY * 2, Math.abs(selection.w) * 2, Math.abs(selection.h) * 2,
            0, 0, Math.abs(selection.w) * 2, Math.abs(selection.h) * 2
        );

        const context = contextRef.current;
        context.drawImage(tempCanvas, sourceX, sourceY, Math.abs(selection.w) * 1.5, Math.abs(selection.h) * 1.5);

        setSelection({ show: false, x: 0, y: 0, w: 0, h: 0 });
        setShowSelectionMenu(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.fillStyle = '#0A0A10';
        context.fillRect(0, 0, canvas.width, canvas.height);
    };

    return (
        <div className="flex flex-col h-full bg-[#0A0A10] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            {/* Toolbar - More Compact for Side Panel */}
            <div className="p-3 bg-white/5 border-b border-white/10 flex flex-col gap-3">
                <div className="flex gap-1 bg-black/40 p-1 rounded-xl w-fit">
                    <ToolButton
                        icon={MousePointer2}
                        active={tool === 'select'}
                        onClick={() => {
                            setTool('select');
                            setSelection({ show: false, x: 0, y: 0, w: 0, h: 0 });
                        }}
                        label="Select"
                    />
                    <div className="w-px h-6 bg-white/10 mx-0.5 self-center" />
                    <ToolButton
                        icon={Pencil}
                        active={tool === 'pen'}
                        onClick={() => setTool('pen')}
                        label="Pen"
                    />
                    <ToolButton
                        icon={Highlighter}
                        active={tool === 'highlighter'}
                        onClick={() => setTool('highlighter')}
                        label="Highlight"
                    />
                    <ToolButton
                        icon={Eraser}
                        active={tool === 'eraser'}
                        onClick={() => setTool('eraser')}
                        label="Eraser"
                    />
                    <ToolButton
                        icon={Type}
                        active={tool === 'text'}
                        onClick={() => setTool('text')}
                        label="Text"
                    />
                </div>

                <div className="flex gap-2 items-center bg-black/20 px-3 py-1.5 rounded-xl w-fit overflow-x-auto max-w-full no-scrollbar">
                    {COLORS.map(c => (
                        <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={cn(
                                "w-5 h-5 rounded-full border transition-all flex-shrink-0",
                                color === c ? "border-white scale-110 ring-2 ring-white/20" : "border-transparent"
                            )}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
            </div>

            {/* Sub-toolbar */}
            <AnimatePresence>
                {tool === 'text' && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 py-2 bg-accent-purple/5 border-b border-white/5 flex gap-3 items-center"
                    >
                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Size</span>
                        <div className="flex bg-black/40 p-1 rounded-lg">
                            {FONT_SIZES.map(f => (
                                <button
                                    key={f.value}
                                    onClick={() => setFontSize(f.value)}
                                    className={cn(
                                        "px-2.5 py-1 rounded-md text-[10px] font-bold transition-all",
                                        fontSize === f.value ? "bg-accent-purple text-white shadow-lg" : "text-white/40 hover:text-white"
                                    )}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Drawing Area */}
            <div className="flex-1 relative cursor-crosshair overflow-hidden group">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startAction}
                    onMouseMove={handleAction}
                    onMouseUp={stopAction}
                    onMouseLeave={stopAction}
                    className="absolute inset-0 w-full h-full"
                />

                {/* Native Text Input Overlay */}
                {textInput.show && (
                    <textarea
                        autoFocus
                        value={textInput.value}
                        onChange={(e) => setTextInput(prev => ({ ...prev, value: e.target.value }))}
                        onKeyDown={handleTextKeyDown}
                        // Use button instead of Blur to avoid frustration
                        style={{
                            position: 'absolute',
                            left: textInput.x,
                            top: textInput.y,
                            color: color,
                            fontSize: fontSize,
                            backgroundColor: 'rgba(5, 5, 10, 0.8)',
                            border: `2px solid ${color}`,
                            padding: '6px',
                            minWidth: '120px',
                            borderRadius: '8px',
                            fontFamily: 'sans-serif',
                            fontWeight: 'bold',
                            zIndex: 20,
                            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                        }}
                        className="focus:outline-none resize group shadow-2xl"
                        placeholder="Type and press Enter..."
                    />
                )}

                {/* Selection Visualizer */}
                {selection.show && (
                    <div
                        style={{
                            position: 'absolute',
                            left: selection.w > 0 ? selection.x : selection.x + selection.w,
                            top: selection.h > 0 ? selection.y : selection.y + selection.h,
                            width: Math.abs(selection.w),
                            height: Math.abs(selection.h),
                            border: '2px dashed #c084fc',
                            backgroundColor: 'rgba(192, 132, 252, 0.05)',
                            pointerEvents: 'none',
                            zIndex: 10
                        }}
                    >
                        {showSelectionMenu && (
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-1 bg-black/90 p-1.5 rounded-xl border border-white/20 shadow-2xl pointer-events-auto backdrop-blur-xl">
                                <SelectionButton icon={Crop} onClick={handleCrop} label="Crop" />
                                <SelectionButton icon={Maximize2} onClick={handleEnlarge} label="+Size" />
                                <SelectionButton icon={Trash2} onClick={clearCanvas} label="Clear" danger />
                                <SelectionButton icon={Check} onClick={() => setSelection({ show: false, x: 0, y: 0, w: 0, h: 0 })} label="OK" />
                            </div>
                        )}
                    </div>
                )}

                {/* Overlays */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={clearCanvas}
                        className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl backdrop-blur-md border border-red-500/20 transition-all shadow-xl"
                        title="Clear All"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                <div className="absolute bottom-4 left-4 pointer-events-none px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/5 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-pulse" />
                    <p className="text-[9px] uppercase tracking-widest font-bold text-white/40">
                        {tool === 'text' ? 'Click to type' : `${tool} tool active`}
                    </p>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 bg-black/20 border-t border-white/10">
                <button
                    onClick={() => window.open('https://www.canva.com/', '_blank')}
                    className="w-full group relative overflow-hidden flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-[#00C4CC] hover:bg-[#00D9E1] text-white text-sm font-bold transition-all shadow-xl"
                >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Canva</span>
                </button>
            </div>
        </div>
    );
};

const ToolButton = ({ icon: Icon, active, onClick, label }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
            active ? "bg-accent-purple text-white shadow-lg" : "text-white/30 hover:bg-white/5 hover:text-white"
        )}
        title={label}
    >
        <Icon className="w-4 h-4" />
    </button>
);

const SelectionButton = ({ icon: Icon, onClick, label, danger }) => (
    <button
        onClick={onClick}
        className={cn(
            "p-2 rounded-lg transition-all flex flex-col items-center gap-1",
            danger ? "hover:bg-red-500/20 text-red-400 hover:text-red-500" : "hover:bg-white/10 text-white/50 hover:text-white"
        )}
        title={label}
    >
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[7px] font-bold uppercase">{label}</span>
    </button>
);

export default LiveExplain;
