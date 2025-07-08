import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/config/api';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserData = useCallback(async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/me/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userData = await response.json();
            setUser(userData);
            // Store userId for chat and other features
            localStorage.setItem('userId', userData.id);
        } catch (error) {
            console.error('Error fetching user data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Login function
    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/token/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            localStorage.setItem('authToken', data.access);

            // After successful login, fetch user data
            await fetchUserData();

            return true;
        } catch (error) {
            console.error('Login error:', error);
            setError(error.message);
            return false;
        }
    };

    // Logout function
    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        setUser(null);
    }, []);

    // Check auth status and fetch user data on mount and token changes
    useEffect(() => {
        fetchUserData();

        // Listen for storage changes (in case of login/logout in another tab)
        const handleStorageChange = (e) => {
            if (e.key === 'authToken') {
                if (e.newValue) {
                    fetchUserData();
                } else {
                    setUser(null);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [fetchUserData]);

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        fetchUserData
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}; 