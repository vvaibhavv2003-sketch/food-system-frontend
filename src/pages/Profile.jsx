import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, updateProfile, changePassword } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        mobile: user?.mobile || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
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

    const handlePasswordChangeInput = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
            alert('Please enter a valid 10-digit mobile number');
            return;
        }

        setLoading(true);
        const res = await updateProfile({ name: formData.name, mobile: formData.mobile });
        setLoading(false);

        if (res.success) {
            alert('Profile updated successfully!');
        } else {
            alert(res.message || 'Failed to update profile');
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            alert('New password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        const res = await changePassword({
            oldPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        });
        setLoading(false);

        if (res.success) {
            alert('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
            alert(res.message || 'Failed to change password');
        }
    };

    if (!user) return <div style={{ padding: '150px', textAlign: 'center' }}>Please login to view profile.</div>;

    return (
        <div className="profile-page" style={{ background: '#f8f9fa', minHeight: '100vh', padding: '100px 5% 50px' }}>
            <div className="profile-container" style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '30px' }}>
                
                {/* Profile Information Block */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'white',
                        padding: 'clamp(20px, 5vw, 40px)',
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
                            top: '20px',
                            left: '20px',
                            border: 'none',
                            background: '#f8f9fa',
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#666',
                            zIndex: 10
                        }}
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>

                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: 'var(--primary)', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '32px', fontWeight: 'bold', margin: '0 auto 15px'
                        }}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Account Details</h2>
                        <p style={{ color: '#888', fontSize: '14px' }}>Update your personal information</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} style={inputStyle} placeholder="Enter full name" />
                        </div>
                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <input name="email" value={formData.email} style={{ ...inputStyle, background: '#f5f5f5', cursor: 'not-allowed' }} disabled />
                        </div>
                        <div>
                            <label style={labelStyle}>Mobile Number</label>
                            <input name="mobile" value={formData.mobile} onChange={handleChange} style={inputStyle} placeholder="10-digit mobile" />
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '14px', marginTop: '10px', borderRadius: '12px' }}>
                            {loading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </form>
                </motion.div>

                {/* Password Change Block */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        background: 'white',
                        padding: 'clamp(20px, 5vw, 40px)',
                        borderRadius: '24px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.05)'
                    }}
                >
                    <div style={{ marginBottom: '25px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Change Password</h3>
                        <p style={{ color: '#888', fontSize: '14px' }}>Secure your account with a new password</p>
                    </div>

                    <form onSubmit={handleUpdatePassword} style={{ display: 'grid', gap: '15px' }}>
                        <div style={{ position: 'relative' }}>
                            <label style={labelStyle}>Current Password</label>
                            <input 
                                type={showPass ? "text" : "password"} 
                                name="currentPassword" 
                                value={passwordData.currentPassword} 
                                onChange={handlePasswordChangeInput} 
                                style={{ ...inputStyle, paddingRight: '45px' }} 
                                required 
                            />
                            <i 
                                className={`fa-solid ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} 
                                onClick={() => setShowPass(!showPass)}
                                style={{ position: 'absolute', right: '15px', top: '38px', cursor: 'pointer', color: '#888' }}
                            ></i>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <label style={labelStyle}>New Password</label>
                            <input 
                                type={showNewPass ? "text" : "password"} 
                                name="newPassword" 
                                value={passwordData.newPassword} 
                                onChange={handlePasswordChangeInput} 
                                style={{ ...inputStyle, paddingRight: '45px' }} 
                                required 
                            />
                            <i 
                                className={`fa-solid ${showNewPass ? 'fa-eye-slash' : 'fa-eye'}`} 
                                onClick={() => setShowNewPass(!showNewPass)}
                                style={{ position: 'absolute', right: '15px', top: '38px', cursor: 'pointer', color: '#888' }}
                            ></i>
                        </div>
                        <div>
                            <label style={labelStyle}>Confirm New Password</label>
                            <input 
                                type="password" 
                                name="confirmPassword" 
                                value={passwordData.confirmPassword} 
                                onChange={handlePasswordChangeInput} 
                                style={inputStyle} 
                                required 
                            />
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '14px', marginTop: '10px', borderRadius: '12px', background: '#333' }}>
                            Update Password
                        </button>
                    </form>
                </motion.div>

                {/* Danger Zone */}
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <button style={{ color: '#e74c3c', background: 'none', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
                        <i className="fa-solid fa-trash-can"></i> Deactivate My Account
                    </button>
                </div>
            </div>
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
