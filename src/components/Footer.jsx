import React, { useState } from 'react';
import { API_NEWSLETTER_SUBSCRIBE } from '../config/apiConfig';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) {
            alert('Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(API_NEWSLETTER_SUBSCRIBE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (res.ok) {
                alert('Thank you for subscribing!');
                setEmail('');
            } else {
                alert(data.message || 'Subscription failed. Please try again.');
            }
        } catch (error) {
            console.error('Newsletter error:', error);
            alert('Server error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer style={{ background: 'var(--bg-dark)', color: 'white', padding: '80px 0 20px 0' }}>
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '50px', marginBottom: '60px' }}>

                {/* Brand Column */}
                <div>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '24px' }}>
                        <span style={{ color: 'var(--primary)' }}>Toasty</span> <span style={{ color: 'white' }}>Bites</span><span style={{ color: 'var(--primary)' }}></span>
                    </h2>
                    <p style={{ color: '#888', lineHeight: '1.6', marginBottom: '24px' }}>
                        Experience the best culinary delights with our premium food delivery service. Quality, taste, and speed guaranteed.
                    </p>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <SocialIcon icon="fa-facebook-f" />
                        <SocialIcon icon="fa-twitter" />
                        <SocialIcon icon="fa-instagram" />
                        <SocialIcon icon="fa-linkedin-in" />
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', color: 'white' }}>Quick Links</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <LinkItem text="About Us" />
                        <LinkItem text="Our Menu" />
                        <LinkItem text="Services" />
                        <LinkItem text="Blog" />
                        <LinkItem text="Contact" />
                    </ul>
                </div>

                {/* Opening Hours */}
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', color: 'white' }}>Opening Hours</h3>
                    <ul style={{ listStyle: 'none', padding: 0, color: '#888' }}>
                        <li style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Mon - Fri:</span> <span>09:00 - 22:00</span>
                        </li>
                        <li style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Saturday:</span> <span>10:00 - 23:00</span>
                        </li>
                        <li style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Sunday:</span> <span>10:00 - 23:00</span>
                        </li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', color: 'white' }}>Newsletter</h3>
                    <p style={{ color: '#888', marginBottom: '16px' }}>Subscribe to get latest updates and offers.</p>
                    <div className="flex-stack-mobile" style={{ gap: '10px' }}>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                flex: 1, padding: '12px', borderRadius: '4px', border: 'none', outline: 'none', background: '#333', color: 'white'
                            }}
                        />
                        <button
                            onClick={handleSubscribe}
                            disabled={loading}
                            style={{
                                padding: '12px',
                                background: loading ? '#666' : 'var(--primary)',
                                border: 'none',
                                borderRadius: '4px',
                                color: 'white',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                minWidth: '50px'
                            }}
                        >
                            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                        </button>
                    </div>
                </div>

            </div>

            <div style={{ borderTop: '1px solid #333', textAlign: 'center', paddingTop: '20px' }}>
                <p style={{ color: '#666', fontSize: '14px' }}>
                    © 2026 Toasty Bites. All Rights Reserved.
                </p>
            </div>
        </footer>
    );
};

const LinkItem = ({ text }) => (
    <li style={{ marginBottom: '12px' }}>
        <a href="#" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
            onMouseLeave={(e) => e.target.style.color = '#888'}
        >
            {text}
        </a>
    </li>
);

const SocialIcon = ({ icon }) => (
    <div style={{
        width: '40px', height: '40px', borderRadius: '50%', background: '#333',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer',
        transition: 'background 0.2s'
    }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary)'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#333'}
    >
        <i className={`fa-brands ${icon}`}></i>
    </div>
);

export default Footer;
