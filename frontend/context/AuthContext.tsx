import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { API_URL } from '@/constants/config';

// Define the shape of the user object
interface User {
    _id: string;
    name: string;
    email: string;
}

// Define the shape of the auth context
interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
    signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;
    updateProfile: (data: { name?: string; email?: string }) => Promise<{ success: boolean; message: string }>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user data and token from AsyncStorage on app start
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const [storedToken, storedUserData] = await Promise.all([
                    AsyncStorage.getItem('userToken'),
                    AsyncStorage.getItem('userData')
                ]);

                if (storedToken && storedUserData) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUserData));
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, []);

    // Login function
    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                await AsyncStorage.setItem('userToken', data.token);
                await AsyncStorage.setItem('userData', JSON.stringify(data.user));

                setToken(data.token);
                setUser(data.user);

                return { success: true, message: 'Logged in successfully' };
            } else {
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    // Signup function
    const signup = async (name: string, email: string, password: string) => {
        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                await AsyncStorage.setItem('userToken', data.token);
                await AsyncStorage.setItem('userData', JSON.stringify(data.user));

                setToken(data.token);
                setUser(data.user);

                return { success: true, message: 'Account created successfully' };
            } else {
                return { success: false, message: data.message || 'Signup failed' };
            }
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');

            setToken(null);
            setUser(null);

            router.replace('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Update profile function
    const updateProfile = async (data: { name?: string; email?: string }) => {
        try {
            const storedToken = await AsyncStorage.getItem('userToken');

            if (!storedToken) {
                return { success: false, message: 'Authentication required' };
            }

            const response = await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${storedToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (response.ok) {
                // Update user data in state and AsyncStorage
                const updatedUser = responseData.user;
                setUser(updatedUser);
                await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));

                return { success: true, message: 'Profile updated successfully' };
            } else {
                return { success: false, message: responseData.message || 'Failed to update profile' };
            }
        } catch (error) {
            console.error('Update profile error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    // Change password function
    const changePassword = async (currentPassword: string, newPassword: string) => {
        try {
            const storedToken = await AsyncStorage.getItem('userToken');

            if (!storedToken) {
                return { success: false, message: 'Authentication required' };
            }

            const response = await fetch(`${API_URL}/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${storedToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await response.json();

            return {
                success: response.ok,
                message: data.message || (response.ok ? 'Password changed successfully' : 'Failed to change password')
            };
        } catch (error) {
            console.error('Change password error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    // Create the context value
    const value = {
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        changePassword
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a custom hook for using the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};