import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('podnest_token');
        if (token) {
            fetchUserProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await api.get('/users/me');
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            localStorage.removeItem('podnest_token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { token } = response.data;
        localStorage.setItem('podnest_token', token);
        await fetchUserProfile();
        return response.data;
    };

    const signup = async (fullName, email, password) => {
        const response = await api.post('/auth/register', { fullName, email, password });
        const { token } = response.data;
        localStorage.setItem('podnest_token', token);
        await fetchUserProfile();
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('podnest_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser: fetchUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
