import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, Wifi, WifiOff, Bell } from 'lucide-react';
import { cn } from '../../lib/utils';

const ToastNotification = ({ toasts, onDismiss }) => {
    return (
        <div className="fixed bottom-8 right-8 z-[1000] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onDismiss={() => onDismiss(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

const ToastItem = ({ toast, onDismiss }) => {
    const [progress, setProgress] = useState(100);
    const duration = toast.duration || 3000;

    useEffect(() => {
        const interval = 10;
        const step = (interval / duration) * 100;
        const timer = setInterval(() => {
            setProgress((prev) => Math.max(0, prev - step));
        }, interval);

        return () => clearInterval(timer);
    }, [duration]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-400" />,
        error: <AlertCircle className="w-5 h-5 text-red-400" />,
        info: <Info className="w-5 h-5 text-accent-cyan" />,
        warning: <AlertCircle className="w-5 h-5 text-yellow-400" />,
    };

    const colors = {
        success: 'border-green-500/20 bg-green-500/5',
        error: 'border-red-500/20 bg-red-500/5',
        info: 'border-accent-cyan/20 bg-accent-cyan/5',
        warning: 'border-yellow-500/20 bg-yellow-500/5',
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.2 } }}
            className={cn(
                "pointer-events-auto relative overflow-hidden rounded-2xl border backdrop-blur-2xl shadow-2xl group",
                colors[toast.type || 'info']
            )}
        >
            <div className="flex items-start gap-4 p-4 pr-10">
                <div className="mt-0.5">
                    {icons[toast.type || 'info']}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white tracking-tight leading-tight uppercase mb-0.5">
                        {toast.type || 'Notification'}
                    </p>
                    <p className="text-xs text-white/60 leading-relaxed font-medium">
                        {toast.message}
                    </p>
                </div>
            </div>

            {/* Close Button */}
            <button
                onClick={onDismiss}
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/5 text-white/20 hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
                <X className="w-3.5 h-3.5" />
            </button>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-[2px] w-full bg-white/5">
                <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: `${progress}%` }}
                    className={cn(
                        "h-full transition-all duration-[10ms] ease-linear",
                        toast.type === 'success' ? 'bg-green-500' :
                            toast.type === 'error' ? 'bg-red-500' :
                                toast.type === 'warning' ? 'bg-yellow-500' : 'bg-accent-cyan'
                    )}
                />
            </div>
        </motion.div>
    );
};

export default ToastNotification;
