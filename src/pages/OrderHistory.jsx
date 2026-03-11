import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const OrderHistory = () => {
    const { fetchUserOrders } = useOrders();
    const { user } = useAuth();
    const [userOrders, setUserOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadOrders();
        }
    }, [user]);

    const loadOrders = async () => {
        setLoading(true);
        const data = await fetchUserOrders(user._id);
        setUserOrders(data);
        setLoading(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return '#856404';
            case 'Confirmed': return '#0c5460';
            case 'Preparing': return '#0c5460';
            case 'Out for Delivery': return '#0c5460';
            case 'Delivered': return '#155724';
            default: return '#333';
        }
    };

    const getStatusBg = (status) => {
        switch (status) {
            case 'Pending': return '#fff3cd';
            case 'Confirmed': return '#d1ecf1';
            case 'Preparing': return '#d1ecf1';
            case 'Out for Delivery': return '#d1ecf1';
            case 'Delivered': return '#d4edda';
            default: return '#eee';
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    if (!user) {
        return (
            <div className="container" style={{ padding: '150px 20px', textAlign: 'center' }}>
                <h2>Please Login to see your orders</h2>
                <Link to="/login" className="btn-primary" style={{ display: 'inline-block', marginTop: '20px', padding: '10px 30px', borderRadius: '50px', textDecoration: 'none' }}>Login Now</Link>
            </div>
        );
    }

    return (
        <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: '120px 5% 50px' }}>
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '800' }}>Order <span style={{ color: 'var(--primary)' }}>History</span></h1>
                    <button onClick={loadOrders} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <i className="fa-solid fa-rotate"></i> Refresh
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <div className="loader" style={{ margin: '0 auto' }}></div>
                        <p style={{ marginTop: '20px', color: '#666' }}>Fetching your delicious history...</p>
                    </div>
                ) : userOrders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                    >
                        <i className="fa-solid fa-utensils" style={{ fontSize: '60px', color: '#eee', marginBottom: '20px' }}></i>
                        <h2 style={{ color: '#333' }}>No orders yet!</h2>
                        <p style={{ color: '#888', marginBottom: '30px' }}>You haven't placed any orders with us yet. Let's change that!</p>
                        <Link to="/" className="btn-primary" style={{ padding: '12px 30px', borderRadius: '50px', textDecoration: 'none' }}>Explore Menu</Link>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ display: 'grid', gap: '25px' }}
                    >
                        {userOrders.map((order) => (
                            <motion.div
                                key={order._id}
                                variants={itemVariants}
                                style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    padding: '25px',
                                    boxShadow: '0 5px 20px rgba(0,0,0,0.03)',
                                    border: '1px solid #f0f0f0',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                                    <div>
                                        <p style={{ fontSize: '12px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Order ID</p>
                                        <p style={{ fontWeight: '700', fontSize: '16px' }}>#{order._id.slice(-8).toUpperCase()}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '12px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Placed on</p>
                                        <p style={{ fontWeight: '600', fontSize: '14px' }}>{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{
                                            background: getStatusBg(order.status),
                                            color: getStatusColor(order.status),
                                            padding: '8px 16px',
                                            borderRadius: '50px',
                                            fontSize: '12px',
                                            fontWeight: '700'
                                        }}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px dashed #eee', borderBottom: '1px dashed #eee', padding: '15px 0', marginBottom: '20px' }}>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ color: '#555' }}>
                                                <strong style={{ color: 'var(--primary)', marginRight: '8px' }}>{item.qty}x</strong>
                                                {item.name}
                                            </span>
                                            <span style={{ fontWeight: '600' }}>₹{item.price}</span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '2px' }}>Total Amount</p>
                                        <p style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>₹{order.totalAmount}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <Link
                                            to={`/order-tracking/${order._id}`}
                                            style={{
                                                padding: '10px 20px',
                                                borderRadius: '50px',
                                                border: '1px solid var(--primary)',
                                                color: 'var(--primary)',
                                                textDecoration: 'none',
                                                fontSize: '14px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            Track Order
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
