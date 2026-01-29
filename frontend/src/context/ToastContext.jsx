import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastNotification from '../components/studio/ToastNotification';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((type, message, duration = 4000) => {
        const id = Date.now();
        const newToast = { id, type, message, duration };

        setToasts(prev => [...prev, newToast]);

        // Auto-dismiss is handled by ToastItem internal progress bar logic too,
        // but we need to remove it from state here.
        setTimeout(() => {
            dismissToast(id);
        }, duration);
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, dismissToast }}>
            {children}
            <ToastNotification toasts={toasts} onDismiss={dismissToast} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
