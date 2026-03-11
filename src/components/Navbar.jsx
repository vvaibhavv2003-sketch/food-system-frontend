import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import { API_NEWSLETTER_UPDATE_SUMMARY } from '../config/apiConfig';

const Navbar = ({ cartCount, toggleCart }) => {
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false); // User Dropdown
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile Hamburger
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const menuRef = useRef(null);
    const { user, logout } = useAuth();
    const { storeSettings } = useStore();
    const navigate = useNavigate();

    // Handle Scroll and Resize
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        setIsMenuOpen(false);
        logout();
        navigate('/');
    };

    const handleSubscriberUpdate = async () => {
        setIsMenuOpen(false);
        if (!window.confirm('Are you sure you want to send a summary update to ALL subscribers? This will automatically include the newest menu items, offers, and categories.')) return;

        try {
            const res = await fetch(API_NEWSLETTER_UPDATE_SUMMARY, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                alert('Summary update email sent successfully! 🚀');
            } else {
                const data = await res.json();
                alert('Failed to send update: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            alert('Network error: Could not connect to the server.');
        }
    };

    const navbarStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 5%',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: 'all 0.3s ease',
        backgroundColor: scrolled || isMobileMenuOpen ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
        backdropFilter: (scrolled || isMobileMenuOpen) ? 'blur(10px)' : 'none',
        boxShadow: (scrolled || isMobileMenuOpen) ? '0 4px 20px rgba(0,0,0,0.05)' : 'none',
    };

    const textColor = (scrolled || isMobileMenuOpen) ? '#333' : 'white';

    // Typewriter effect state
    const [isVisible, setIsVisible] = useState(true);
    useEffect(() => {
        let timeout;
        if (isVisible) {
            timeout = setTimeout(() => setIsVisible(false), 5000);
        } else {
            timeout = setTimeout(() => setIsVisible(true), 2500);
        }
        return () => clearTimeout(timeout);
    }, [isVisible]);

    const fullName = storeSettings.storeName || 'Toasty Bites';
    const firstSpaceIndex = fullName.indexOf(' ');

    return (
        <nav style={navbarStyle}>
            {/* Logo */}
            <Link to="/" style={{ textDecoration: 'none', zIndex: 1002 }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: textColor, display: 'flex' }}>
                    <motion.div
                        initial="hidden"
                        animate={isVisible ? "visible" : "hidden"}
                        variants={{ visible: { transition: { staggerChildren: 0.2 } }, hidden: { transition: { staggerChildren: 0.1, staggerDirection: -1 } } }}
                        style={{ display: 'flex' }}
                    >
                        {fullName.split("").map((char, index) => (
                            <motion.span
                                key={index}
                                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                                transition={{ duration: 0 }}
                                style={{
                                    color: (firstSpaceIndex !== -1 && index < firstSpaceIndex) ? 'var(--primary)' : 'inherit',
                                    marginRight: (char === ' ') ? '5px' : '0'
                                }}
                            >
                                {char}
                            </motion.span>
                        ))}
                    </motion.div>
                </div>
            </Link>

            {/* Desktop Navigation Links Removed as per request (Moved to Dropdown/Mobile Menu) */}

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', zIndex: 1002 }}>
                {/* Cart Icon */}
                <div onClick={toggleCart} style={{ position: 'relative', cursor: 'pointer', color: textColor }}>
                    <i className="fa-solid fa-bag-shopping" style={{ fontSize: '22px' }}></i>
                    {cartCount > 0 && (
                        <span style={{
                            position: 'absolute', top: '-5px', right: '-8px',
                            backgroundColor: 'var(--primary)', color: 'white',
                            fontSize: '10px', height: '18px', width: '18px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: '50%', fontWeight: 'bold'
                        }}>{cartCount}</span>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                {isMobile && (
                    <div onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ cursor: 'pointer', color: textColor, fontSize: '24px' }}>
                        <i className={`fa-solid fa-${isMobileMenuOpen ? 'xmark' : 'bars'}`}></i>
                    </div>
                )}

                {/* User Dropdown (Desktop & Mobile) */}
                {user ? (
                    !isMobile && (
                        <div ref={menuRef} style={{ position: 'relative' }}>
                            <div
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                                    padding: '5px 12px', borderRadius: '50px',
                                    background: scrolled ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'
                                }}
                            >
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ color: textColor, fontWeight: '600', fontSize: '14px' }}>{user.name}</span>
                                <i className={`fa-solid fa-chevron-${isMenuOpen ? 'up' : 'down'}`} style={{ fontSize: '10px', color: textColor }}></i>
                            </div>

                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        style={{
                                            position: 'absolute', top: '45px', right: 0, width: '200px',
                                            background: 'white', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                            zIndex: 1001, border: '1px solid #eee', overflow: 'hidden'
                                        }}
                                    >
                                        <div style={{ padding: '15px', borderBottom: '1px solid #f5f5f5' }}>
                                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#333' }}>{user.name}</p>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{user.email || user.mobile}</p>
                                        </div>
                                        <div style={{ padding: '5px' }}>
                                            <Link to="/my-orders" onClick={() => setIsMenuOpen(false)} style={dropdownItemStyle}><i className="fa-solid fa-clock-rotate-left"></i> My Orders</Link>
                                            <Link to="/profile" onClick={() => setIsMenuOpen(false)} style={dropdownItemStyle}><i className="fa-solid fa-user-gear"></i> Profile</Link>

                                            {/* Added Navigation for Delivery Users */}
                                            {/* Delivery options removed as per request */}

                                            {(user.role?.toLowerCase() === 'admin' || user.isAdmin) && (
                                                <>
                                                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} style={dropdownItemStyle}>
                                                        <i className="fa-solid fa-lock"></i> Admin
                                                    </Link>
                                                    <div onClick={handleSubscriberUpdate} style={{ ...dropdownItemStyle, color: 'var(--primary)', fontWeight: 'bold' }}>
                                                        <i className="fa-solid fa-paper-plane"></i> Update For Subscribers
                                                    </div>
                                                </>
                                            )}
                                            <div onClick={handleLogout} style={{ ...dropdownItemStyle, color: '#e74c3c' }}><i className="fa-solid fa-right-from-bracket"></i> Logout</div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                ) : (
                    !isMobile && (
                        <Link to="/login">
                            <button className="btn-primary" style={{ padding: '8px 20px', borderRadius: '50px' }}>Sign In</button>
                        </Link>
                    )
                )}
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobile && isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                            position: 'absolute', top: '100%', left: 0, right: 0,
                            background: 'white', padding: '20px', borderTop: '1px solid #eee',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '15px'
                        }}
                    >
                        <Link to="/" onClick={() => setIsMobileMenuOpen(false)} style={mobileLinkStyle}>Home</Link>
                        {user ? (
                            <>
                                <div style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 'bold' }}>{user.name}</p>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{user.email || user.mobile}</p>
                                    </div>
                                </div>
                                <Link to="/my-orders" onClick={() => setIsMobileMenuOpen(false)} style={mobileLinkStyle}>My Orders</Link>
                                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} style={mobileLinkStyle}>Profile</Link>
                                {/* Delivery options removed */}
                                {(user.role?.toLowerCase() === 'admin' || user.isAdmin) && (
                                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} style={mobileLinkStyle}>Admin Dashboard</Link>
                                )}
                                <div onClick={handleLogout} style={{ ...mobileLinkStyle, color: '#e74c3c' }}>Logout</div>
                            </>
                        ) : (
                            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} style={mobileLinkStyle}>Sign In / Sign Up</Link>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

const dropdownItemStyle = {
    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 15px',
    fontSize: '14px', color: '#333', textDecoration: 'none', borderRadius: '8px',
    cursor: 'pointer', transition: 'background 0.2s'
};

const mobileLinkStyle = {
    fontSize: '16px', color: '#333', textDecoration: 'none', fontWeight: '600', padding: '10px 0', borderBottom: '1px solid #f9f9f9'
};

export default Navbar;
