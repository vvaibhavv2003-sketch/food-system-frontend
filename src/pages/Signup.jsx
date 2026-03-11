import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Signup = () => {
    const [role, setRole] = useState('user');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');

    // OTP State
    const [step, setStep] = useState(1); // 1: Details, 2: OTP
    const [otp, setOtp] = useState('');

    const [focusedInput, setFocusedInput] = useState(null);
    const { register, verifyOtp } = useAuth();
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        const userData = { name, email, mobile, password, role };

        const result = await register(userData);
        if (result.success) {
            alert('OTP sent to your email address.');
            setStep(2);
        } else {
            alert(result.message);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const userData = { name, email, mobile, password, role };
        const result = await verifyOtp(mobile, otp, userData);
        if (result.success) {
            alert('Verification Successful! Welcome.');
            if (role === 'admin') navigate('/admin');
            else if (role === 'delivery') navigate('/delivery');
            else navigate('/');
        } else {
            alert(result.message);
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

                    {/* Decorative Top Bar */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: 'linear-gradient(90deg, var(--primary), #ff9a44)' }}></div>

                    <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '10px' }}>
                            {step === 1 ? 'Create Account' : 'Verify Email'}
                        </h1>
                        <p style={{ color: '#888' }}>
                            {step === 1 ? 'Join Toasty Bites today 🚀' : `Enter OTP sent to ${email}`}
                        </p>
                    </motion.div>

                    {step === 1 && (
                        <motion.div variants={itemVariants} style={{ display: 'flex', background: '#f5f5f5', borderRadius: '12px', padding: '5px', marginBottom: '30px' }}>
                            {['user', 'admin', 'delivery'].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setRole(r)}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        border: 'none',
                                        borderRadius: '8px',
                                        background: role === r ? 'white' : 'transparent',
                                        color: role === r ? 'var(--primary)' : '#777',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        textTransform: 'capitalize',
                                        boxShadow: role === r ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {r}
                                </button>
                            ))}
                        </motion.div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <motion.div variants={itemVariants}>
                                <div style={{ borderRadius: '12px', border: focusedInput === 'name' ? '1px solid var(--primary)' : '1px solid #eee', background: '#fff', transition: 'all 0.2s' }}>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        required
                                        value={name} onChange={e => setName(e.target.value)}
                                        onFocus={() => setFocusedInput('name')}
                                        onBlur={() => setFocusedInput(null)}
                                        style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', outline: 'none' }}
                                    />
                                </div>
                            </motion.div>

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

                            <motion.div variants={itemVariants}>
                                <div style={{ borderRadius: '12px', border: focusedInput === 'mobile' ? '1px solid var(--primary)' : '1px solid #eee', background: '#fff', transition: 'all 0.2s' }}>
                                    <input
                                        type="tel"
                                        placeholder="Mobile Number"
                                        required
                                        value={mobile} onChange={e => setMobile(e.target.value)}
                                        onFocus={() => setFocusedInput('mobile')}
                                        onBlur={() => setFocusedInput(null)}
                                        style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', outline: 'none' }}
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <div style={{ borderRadius: '12px', border: focusedInput === 'password' ? '1px solid var(--primary)' : '1px solid #eee', background: '#fff', transition: 'all 0.2s' }}>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        required
                                        value={password} onChange={e => setPassword(e.target.value)}
                                        onFocus={() => setFocusedInput('password')}
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
                                Get OTP
                            </motion.button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <motion.div variants={itemVariants}>
                                <div style={{ borderRadius: '12px', border: focusedInput === 'otp' ? '1px solid var(--primary)' : '1px solid #eee', background: '#fff', transition: 'all 0.2s' }}>
                                    <input
                                        type="text"
                                        placeholder="Enter 4-digit OTP"
                                        required
                                        value={otp} onChange={e => setOtp(e.target.value)}
                                        onFocus={() => setFocusedInput('otp')}
                                        onBlur={() => setFocusedInput(null)}
                                        style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', outline: 'none', textAlign: 'center', fontSize: '20px', letterSpacing: '5px' }}
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
                                Verify & Signup
                            </motion.button>
                            <div style={{ textAlign: 'center', marginTop: '10px' }}>
                                <span onClick={() => setStep(1)} style={{ cursor: 'pointer', color: '#888', textDecoration: 'underline' }}>Back to Details</span>
                            </div>
                        </form>
                    )}

                    {step === 1 && (
                        <motion.p variants={itemVariants} style={{ textAlign: 'center', marginTop: '30px', fontSize: '14px', color: '#666' }}>
                            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Login</Link>
                        </motion.p>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Signup;
