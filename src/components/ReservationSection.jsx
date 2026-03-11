import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_BOOKINGS, API_BOOKINGS_STATUS } from '../config/apiConfig';

import './ReservationSection.css';

const ReservationSection = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        date: '',
        guests: '2 People',
        time: '',
        tableNumber: null
    });
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStatuses();
        const interval = setInterval(fetchStatuses, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [formData.date]);

    const fetchStatuses = async () => {
        try {
            const dateStr = formData.date || new Date().toISOString().split('T')[0];
            const res = await fetch(API_BOOKINGS_STATUS(dateStr));
            const data = await res.json();
            setTables(data);
        } catch (error) {
            console.error('Error fetching table statuses:', error);
            // Default 12 tables if backend fails
            const defaultTables = Array.from({ length: 12 }, (_, i) => ({
                number: i + 1,
                status: 'Available'
            }));
            setTables(defaultTables);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTableSelect = (num) => {
        const table = tables.find(t => t.number === num);
        if (table.status !== 'Available') return;
        setFormData({ ...formData, tableNumber: num });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.tableNumber) {
            alert('Please select a table to book.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(API_BOOKINGS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (res.ok) {
                alert(`Success! ₹100 Booking Charge Applied. ${data.message}`);
                setFormData({
                    name: '',
                    email: '',
                    mobile: '',
                    date: '',
                    guests: '2 People',
                    time: '',
                    tableNumber: null
                });
                fetchStatuses(); // Refresh table statuses
            } else {
                alert(data.message || 'Booking failed');
            }
        } catch (error) {
            alert('Server error: Failed to book table');
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
                            <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>Select Your Table</h4>
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

                        <div className="reservation-table-grid">
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
