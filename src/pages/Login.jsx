import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
    const [role, setRole] = useState('user');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [focusedInput, setFocusedInput] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const result = await login(identifier, password);
        setIsLoading(false);

        if (result.success) {
            const userRole = result.user.role?.toLowerCase();
            if (userRole === 'admin') navigate('/admin');
            else if (userRole === 'delivery' || userRole === 'delivery staff') navigate('/delivery');
            else navigate('/');
        } else {
            alert(result.message || 'Login failed');
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
            <motion.div
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

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        border: 'none',
                        background: '#f5f5f5',
                        width: '35px',
                        height: '35px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#666',
                        zIndex: 10,
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#eee'; e.currentTarget.style.color = '#333'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#666'; }}
                >
                    <i className="fa-solid fa-arrow-left"></i>
                </button>

                {/* Decorative Top Bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: 'linear-gradient(90deg, var(--primary), #ff9a44)' }}></div>

                <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '10px' }}>Welcome Back</h1>
                    <p style={{ color: '#888' }}>Login to continue to Toasty Bites</p>
                </motion.div>

                {/* Role Toggles */}
                <motion.div variants={itemVariants} style={{ display: 'flex', background: '#f5f5f5', borderRadius: '12px', padding: '5px', marginBottom: '30px' }}>
                    {['user', 'delivery'].map(r => (
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

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <motion.div variants={itemVariants}>
                        <div style={{ borderRadius: '12px', border: focusedInput === 'identifier' ? '1px solid var(--primary)' : '1px solid #eee', background: '#fff', transition: 'all 0.2s' }}>
                            <input
                                type="text"
                                placeholder="Email or Mobile Number"
                                required
                                value={identifier} onChange={e => setIdentifier(e.target.value)}
                                onFocus={() => setFocusedInput('identifier')}
                                onBlur={() => setFocusedInput(null)}
                                style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', outline: 'none' }}
                            />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <div style={{ 
                            borderRadius: '12px', 
                            border: focusedInput === 'password' ? '1px solid var(--primary)' : '1px solid #eee', 
                            background: '#fff', 
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            position: 'relative'
                        }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                required
                                value={password} onChange={e => setPassword(e.target.value)}
                                onFocus={() => setFocusedInput('password')}
                                onBlur={() => setFocusedInput(null)}
                                style={{ width: '100%', padding: '15px', paddingRight: '45px', borderRadius: '12px', border: 'none', outline: 'none' }}
                            />
                            <div 
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ 
                                    position: 'absolute', 
                                    right: '15px', 
                                    cursor: 'pointer', 
                                    color: '#888',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                            <input type="checkbox" style={{ accentColor: 'var(--primary)' }} /> Remember me
                        </label>
                        <Link to="/forgot-password" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Forgot Password?</Link>
                    </motion.div>

                    <motion.button
                        variants={itemVariants}
                        whileHover={!isLoading ? { scale: 1.02 } : {}}
                        whileTap={!isLoading ? { scale: 0.98 } : {}}
                        type="submit"
                        className="btn-primary"
                        disabled={isLoading}
                        style={{ 
                            padding: '15px', 
                            fontSize: '16px', 
                            borderRadius: '12px', 
                            boxShadow: '0 10px 20px rgba(255, 82, 0, 0.2)',
                            opacity: isLoading ? 0.7 : 1,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                        {isLoading ? (
                            <>
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    border: '2px solid white',
                                    borderTop: '2px solid transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                Authenticating...
                            </>
                        ) : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                    </motion.button>
                </form>

                <motion.p variants={itemVariants} style={{ textAlign: 'center', marginTop: '30px', fontSize: '14px', color: '#666' }}>
                    Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Sign Up</Link>
                </motion.p>

            </motion.div>
        </div>
    );
};

export default Login;
