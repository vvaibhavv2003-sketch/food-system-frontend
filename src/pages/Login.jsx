import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
    const [role, setRole] = useState('user');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [focusedInput, setFocusedInput] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const result = await login(identifier, password);

        if (result.success) {
            if (role === 'admin') navigate('/admin');
            else if (role === 'delivery') navigate('/delivery');
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

                    <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                            <input type="checkbox" style={{ accentColor: 'var(--primary)' }} /> Remember me
                        </label>
                        <Link to="/forgot-password" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Forgot Password?</Link>
                    </motion.div>

                    <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="btn-primary"
                        style={{ padding: '15px', fontSize: '16px', borderRadius: '12px', boxShadow: '0 10px 20px rgba(255, 82, 0, 0.2)' }}>
                        Login as {role.charAt(0).toUpperCase() + role.slice(1)}
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
