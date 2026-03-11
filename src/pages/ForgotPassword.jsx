import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset
    const [focusedInput, setFocusedInput] = useState(null);
    const { forgotPassword, resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        const result = await forgotPassword(email);
        if (result.message.includes('sent')) {
            alert(`OTP sent to ${email}. Please check your inbox.`);
            setStep(2);
        } else {
            alert(result.message || 'Failed to send OTP');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        if (newPassword.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        const result = await resetPassword(email, otp, newPassword);
        if (result.message.includes('success')) {
            alert('Password reset successful! Please login.');
            navigate('/login');
        } else {
            alert(result.message || 'Reset failed');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5, staggerChildren: 0.1, type: 'spring' }
        },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: '#f8f8f8',
            padding: '20px'
        }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    style={{
                        background: 'white',
                        padding: '40px',
                        borderRadius: '20px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                        width: '100%',
                        maxWidth: '450px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>

                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: 'linear-gradient(90deg, var(--primary), #ff9a44)' }}></div>

                    <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '10px' }}>
                            {step === 1 ? 'Forgot Password?' : 'Reset Password'}
                        </h1>
                        <p style={{ color: '#888' }}>
                            {step === 1 ? 'Enter your email address to get OTP' : 'Set your new password'}
                        </p>
                    </motion.div>

                    {step === 1 ? (
                        <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <motion.div variants={itemVariants}>
                                <div style={{ borderRadius: '12px', border: focusedInput === 'email' ? '1px solid var(--primary)' : '1px solid #eee', background: '#fff', transition: 'all 0.2s' }}>
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        required
                                        value={email} onChange={e => setEmail(e.target.value)}
                                        onFocus={() => setFocusedInput('email')}
                                        onBlur={() => setFocusedInput(null)}
                                        style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', outline: 'none' }}
                                    />
                                </div>
                            </motion.div>

                            <motion.button
                                variants={itemVariants}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="btn-primary"
                                style={{ padding: '15px', fontSize: '16px', borderRadius: '12px', boxShadow: '0 10px 20px rgba(255, 82, 0, 0.2)' }}>
                                Send OTP
                            </motion.button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <motion.div variants={itemVariants}>
                                <div style={{ borderRadius: '12px', border: focusedInput === 'otp' ? '1px solid var(--primary)' : '1px solid #eee', background: '#fff', transition: 'all 0.2s' }}>
                                    <input
                                        type="text"
                                        placeholder="Enter OTP"
                                        required
                                        value={otp} onChange={e => setOtp(e.target.value)}
                                        onFocus={() => setFocusedInput('otp')}
                                        onBlur={() => setFocusedInput(null)}
                                        style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', outline: 'none', textAlign: 'center', letterSpacing: '2px' }}
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <div style={{ borderRadius: '12px', border: focusedInput === 'newPassword' ? '1px solid var(--primary)' : '1px solid #eee', background: '#fff', transition: 'all 0.2s' }}>
                                    <input
                                        type="password"
                                        placeholder="New Password"
                                        required
                                        value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                        onFocus={() => setFocusedInput('newPassword')}
                                        onBlur={() => setFocusedInput(null)}
                                        style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', outline: 'none' }}
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <div style={{ borderRadius: '12px', border: focusedInput === 'confirmPassword' ? '1px solid var(--primary)' : '1px solid #eee', background: '#fff', transition: 'all 0.2s' }}>
                                    <input
                                        type="password"
                                        placeholder="Confirm Password"
                                        required
                                        value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                        onFocus={() => setFocusedInput('confirmPassword')}
                                        onBlur={() => setFocusedInput(null)}
                                        style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', outline: 'none' }}
                                    />
                                </div>
                            </motion.div>

                            <motion.button
                                variants={itemVariants}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="btn-primary"
                                style={{ padding: '15px', fontSize: '16px', borderRadius: '12px', boxShadow: '0 10px 20px rgba(255, 82, 0, 0.2)' }}>
                                Reset Password
                            </motion.button>
                        </form>
                    )}

                    <motion.div variants={itemVariants} style={{ textAlign: 'center', marginTop: '30px' }}>
                        <Link to="/login" style={{ color: '#666', fontSize: '14px', textDecoration: 'none' }}>Back to Login</Link>
                    </motion.div>

                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default ForgotPassword;
