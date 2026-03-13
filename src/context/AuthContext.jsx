import React, { createContext, useState, useContext, useEffect } from 'react';
import {
    API_AUTH_LOGIN,
    API_AUTH_REGISTER,
    API_AUTH_VERIFY_OTP,
    API_AUTH_FORGOT_PASSWORD,
    API_AUTH_RESET_PASSWORD,
    API_AUTH_PROFILE
} from '../config/apiConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Load user from localStorage on init
    useEffect(() => {
        const storedUser = localStorage.getItem('toastyUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (identifier, password) => {
        try {
            const res = await fetch(API_AUTH_LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data);
                localStorage.setItem('toastyUser', JSON.stringify(data));
                return { success: true, user: data };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error("Login Error:", error);
            return { success: false, message: `Server error: ${error.message}` };
        }
    };

    const register = async (userData) => {
        try {
            console.log("Attempting to register:", userData);
            const res = await fetch(API_AUTH_REGISTER, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            console.log(`Register Response Status: ${res.status}`);
            const contentType = res.headers.get("content-type");
            console.log(`Content-Type: ${contentType}`);

            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await res.json();
                if (res.ok) {
                    return { success: true, message: data.message, otp: data.otp };
                }
                return { success: false, message: data.message };
            } else {
                const text = await res.text();
                console.error("Received non-JSON response:", text);
                return { success: false, message: `Server error: Received HTML/Text instead of JSON. Status: ${res.status}` };
            }
        } catch (error) {
            console.error("Register Error:", error);
            return { success: false, message: `Server error: ${error.message}` };
        }
    };

    const verifyOtp = async (mobile, otp, userData) => {
        try {
            const res = await fetch(API_AUTH_VERIFY_OTP, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile, otp, userData })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data);
                localStorage.setItem('toastyUser', JSON.stringify(data));
                return { success: true };
            }
            return { success: false, message: data.message };
        } catch (error) {
            console.error("Verify OTP Error:", error);
            return { success: false, message: `Server error: ${error.message}` };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('toastyUser');
    };

    const forgotPassword = async (email) => {
        try {
            const res = await fetch(API_AUTH_FORGOT_PASSWORD, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            return await res.json();
        } catch (error) {
            return { message: 'Server error' };
        }
    };

    const resetPassword = async (email, otp, newPassword) => {
        try {
            const res = await fetch(API_AUTH_RESET_PASSWORD, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword })
            });
            return await res.json();
        } catch (error) {
            return { message: 'Server error' };
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const res = await fetch(API_AUTH_PROFILE, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, ...profileData })
            });

            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await res.json();
                if (res.ok) {
                    setUser(data);
                    localStorage.setItem('toastyUser', JSON.stringify(data));
                    return { success: true };
                }
                return { success: false, message: data.message };
            } else {
                const text = await res.text();
                return { success: false, message: `Server error (${res.status}): ${text.slice(0, 50)}...` };
            }
        } catch (error) {
            console.error("Update Profile Error:", error);
            return { success: false, message: `Connection error: ${error.message}` };
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, verifyOtp, forgotPassword, resetPassword, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
