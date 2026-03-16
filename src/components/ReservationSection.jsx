import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_BOOKINGS, API_BOOKINGS_STATUS } from '../config/apiConfig';
import { useAuth } from '../context/AuthContext';

import './ReservationSection.css';

const ReservationSection = () => {
    const { user } = useAuth();
    
    // Default to today in YYYY-MM-DD format
    const getTodayDate = () => new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        mobile: user?.mobile || '',
        date: localStorage.getItem('toasty_reserve_date') || getTodayDate(),
        guests: '2 People',
        time: '',
        tableNumber: null
    });
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(true);

    // Sync user data if login state changes
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                mobile: user.mobile || prev.mobile
            }));
        }
    }, [user]);

    // Persist date selection
    useEffect(() => {
        localStorage.setItem('toasty_reserve_date', formData.date);
        fetchStatuses();
    }, [formData.date]);

    useEffect(() => {
        const interval = setInterval(fetchStatuses, 15000); // Poll every 15s
        return () => clearInterval(interval);
    }, [formData.date]);

    const fetchStatuses = async () => {
        try {
            setStatusLoading(true);
            const dateStr = formData.date || getTodayDate();
            const res = await fetch(API_BOOKINGS_STATUS(dateStr));
            if (!res.ok) throw new Error('Failed to fetch status');
            const data = await res.json();
            if (Array.isArray(data)) {
                setTables(data);
            }
        } catch (error) {
            console.error('Error fetching table statuses:', error);
            // Default 12 tables only if we have NO data at all
            if (tables.length === 0) {
                const defaultTables = Array.from({ length: 12 }, (_, i) => ({
                    number: i + 1,
                    status: 'Available'
                }));
                setTables(defaultTables);
            }
        } finally {
            setStatusLoading(false);
        }
    };

    const validateMobile = (mob) => {
        return /^\d{10}$/.test(mob);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTableSelect = (num) => {
        const table = tables.find(t => t.number === num);
        if (table && table.status !== 'Available') return;
        setFormData({ ...formData, tableNumber: num });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.tableNumber) {
            alert('Please select a table to book.');
            return;
        }

        if (!validateMobile(formData.mobile)) {
            alert('Please enter a valid 10-digit mobile number for booking.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(API_BOOKINGS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    userId: user?._id // Add userId if available
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert(`SUCCESS! ✅\n\nTable ${formData.tableNumber} is reserved for you.\nNote: ₹100 booking charge will be added to your bill.`);
                
                // Clear personal info but KEEP date and table selection visual if needed, 
                // OR just reset nicely but keep the user on the current date
                const currentDate = formData.date;
                setFormData({
                    name: user?.name || '',
                    email: user?.email || '',
                    mobile: user?.mobile || '',
                    date: currentDate, // Keep the date!
                    guests: '2 People',
                    time: '',
                    tableNumber: null
                });
                
                // Immediate refresh of statuses
                setTimeout(fetchStatuses, 500); 
            } else {
                alert(data.message || 'This table might have been booked just now. Please try another.');
                fetchStatuses();
            }
        } catch (error) {
            console.error('Booking Error:', error);
            alert('Connection Error: Your reservation could not be confirmed. Please check your internet and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="reservation" className="reservation-section">
            <div className="container reservation-container">
                {/* Image Side */}
                <div className="reservation-image"></div>

                {/* Form Side */}
                <div className="reservation-content">
                    <div className="reservation-header">
                        <h3 style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
                            Book A Table
                        </h3>
                        <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px', lineHeight: '1.2' }}>
                            Book Your Table For Private Dinners & Happy Hours
                        </h2>
                    </div>

                    <div style={{
                        background: 'rgba(255, 82, 0, 0.1)',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        borderLeft: '4px solid var(--primary)',
                        fontSize: '14px',
                        color: '#333'
                    }}>
                        <b>Note:</b> A booking charge of <b>₹100</b> will be applied.
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                            <div>
                                <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Select Your Table</h4>
                                <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600', margin: '4px 0 0' }}>
                                    Viewing status for: <span style={{ textDecoration: 'underline' }}>{new Date(formData.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '600' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4caf50', boxShadow: '0 0 8px rgba(76, 175, 80, 0.4)' }}></div>
                                    <span>Available</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '600' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbc02d', boxShadow: '0 0 8px rgba(251, 192, 45, 0.4)' }}></div>
                                    <span>Running</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '600' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f44336', boxShadow: '0 0 8px rgba(244, 67, 54, 0.4)' }}></div>
                                    <span>Booked</span>
                                </div>
                            </div>
                        </div>

                        <div className="reservation-table-grid" style={{ opacity: statusLoading ? 0.6 : 1, transition: 'opacity 0.3s ease' }}>
                            {tables.map(table => {
                                const isSelected = formData.tableNumber === table.number;
                                return (
                                    <motion.div
                                        key={table.number}
                                        whileHover={table.status === 'Available' ? { scale: 1.05 } : {}}
                                        whileTap={table.status === 'Available' ? { scale: 0.95 } : {}}
                                        onClick={() => handleTableSelect(table.number)}
                                        style={{
                                            padding: '16px 10px',
                                            textAlign: 'center',
                                            borderRadius: '14px',
                                            cursor: table.status === 'Available' ? 'pointer' : 'not-allowed',
                                            background: table.status === 'Available'
                                                ? (isSelected ? 'rgba(255, 82, 0, 0.08)' : '#fff')
                                                : table.status === 'Running'
                                                    ? 'rgba(251, 192, 45, 0.05)'
                                                    : 'rgba(244, 67, 54, 0.05)',
                                            border: isSelected
                                                ? '2px solid var(--primary)'
                                                : table.status === 'Available'
                                                    ? '1px solid #eee'
                                                    : '1px solid transparent',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow: isSelected ? '0 8px 20px rgba(255, 82, 0, 0.12)' : '0 2px 4px rgba(0,0,0,0.02)'
                                        }}
                                    >
                                        <div style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            background: table.status === 'Available' ? '#4caf50' :
                                                table.status === 'Running' ? '#fbc02d' : '#f44336',
                                            marginBottom: '10px'
                                        }}></div>
                                        <span style={{
                                            fontWeight: '800',
                                            fontSize: '14px',
                                            color: table.status === 'Available' ? '#333' : '#999'
                                        }}>T-0{table.number < 10 ? `0${table.number}` : table.number}</span>
                                        <span style={{
                                            fontSize: '9px',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            marginTop: '4px',
                                            opacity: 0.6,
                                            letterSpacing: '0.5px',
                                            color: table.status === 'Available' ? '#4caf50' :
                                                table.status === 'Running' ? '#fbc02d' : '#f44336'
                                        }}>
                                            {table.status}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="reservation-form"
                    >
                        {formData.tableNumber && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    gridColumn: '1/-1',
                                    padding: '12px',
                                    background: 'linear-gradient(135deg, rgba(255, 82, 0, 0.1), rgba(255, 82, 0, 0.05))',
                                    color: 'var(--primary)',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    textAlign: 'center',
                                    fontWeight: '600',
                                    border: '1px solid rgba(255, 82, 0, 0.1)'
                                }}
                            >
                                Nice Choice! You are booking <span style={{ textDecoration: 'underline' }}>Table 0{formData.tableNumber < 10 ? `0${formData.tableNumber}` : formData.tableNumber}</span>
                            </motion.div>
                        )}
                        <input name="name" type="text" placeholder="Your Name" required value={formData.name} onChange={handleChange} className="reservation-input" />
                        <input name="email" type="email" placeholder="Email Address" required value={formData.email} onChange={handleChange} className="reservation-input" />
                        <input name="mobile" type="tel" placeholder="Phone Number" required value={formData.mobile} onChange={handleChange} className="reservation-input" />
                        <input name="date" type="date" required value={formData.date} onChange={handleChange} className="reservation-input" />
                        <select name="guests" value={formData.guests} onChange={handleChange} className="reservation-input">
                            <option>1 Person</option>
                            <option>2 People</option>
                            <option>3 People</option>
                            <option>4 People</option>
                            <option>5+ People</option>
                        </select>
                        <input name="time" type="time" required value={formData.time} onChange={handleChange} className="reservation-input" />

                        <motion.button
                            disabled={loading}
                            whileHover={!loading ? { scale: 1.02, backgroundColor: '#e64a19' } : {}}
                            whileTap={!loading ? { scale: 0.98 } : {}}
                            className="reservation-submit-btn"
                            style={{
                                background: loading ? '#ccc' : 'var(--primary)',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Processing Your Reservation...' : 'Confirm Table Reservation (₹100)'}
                        </motion.button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ReservationSection;
