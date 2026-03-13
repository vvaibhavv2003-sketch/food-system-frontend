import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        mobile: user?.mobile || '',
    });

    // Update form when user data is finally available or updated
    React.useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                mobile: user.mobile || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await updateProfile({ name: formData.name, mobile: formData.mobile });
        setLoading(false);

        if (res.success) {
            alert('Profile updated successfully!');
        } else {
            alert(res.message || 'Failed to update profile');
        }
    };

    if (!user) return <div style={{ padding: '150px', textAlign: 'center' }}>Please login to view profile.</div>;

    return (
        <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: '120px 5% 50px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    maxWidth: '600px',
                    margin: '0 auto',
                    background: 'white',
                    padding: '40px',
                    borderRadius: '24px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
                    position: 'relative'
                }}
            >
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        position: 'absolute',
                        top: '25px',
                        left: '25px',
                        border: 'none',
                        background: '#f8f9fa',
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#666',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#eee'; e.currentTarget.style.color = '#333'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.color = '#666'; }}
                >
                    <i className="fa-solid fa-arrow-left"></i>
                </button>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{
                        width: '100px', height: '100px', borderRadius: '50%',
                        background: 'var(--primary)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '40px', fontWeight: 'bold', margin: '0 auto 15px'
                    }}>
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <h2 style={{ fontSize: '28px', fontWeight: '800' }}>Account Settings</h2>
                    <p style={{ color: '#888' }}>Manage your profile information</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                    <div>
                        <label style={labelStyle}>Full Name</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Email Address</label>
                        <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={inputStyle}
                            disabled
                        />
                        <small style={{ color: '#999', marginTop: '5px', display: 'block' }}>Email cannot be changed.</small>
                    </div>
                    <div>
                        <label style={labelStyle}>Mobile Number</label>
                        <input
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{
                            padding: '15px',
                            marginTop: '10px',
                            borderRadius: '12px',
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                </form>

                <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #eee' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#e74c3c', marginBottom: '10px' }}>Danger Zone</h3>
                    <p style={{ fontSize: '14px', color: '#888', marginBottom: '15px' }}>Deleting your account is permanent and cannot be undone.</p>
                    <button style={{
                        padding: '10px 20px',
                        border: '1px solid #e74c3c',
                        color: '#e74c3c',
                        background: 'transparent',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}>
                        Deactivate Account
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#444'
};

const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s'
};

export default Profile;
