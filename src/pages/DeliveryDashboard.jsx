import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { Link } from 'react-router-dom';

const DeliveryDashboard = () => {
    const { user } = useAuth();
    const { orders, updateOrderStatus } = useOrders();

    // Get Active Orders
    const activeOrders = React.useMemo(() => {
        return orders.filter(o => o.status === 'Out for Delivery' || o.status === 'Preparing');
    }, [orders]);

    const handleMarkDelivered = (orderId) => {
        if (window.confirm('Confirm delivery completion?')) {
            updateOrderStatus(orderId, 'Delivered');
        }
    };

    if (!user || user.role !== 'delivery') {
        return <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}><h2>Access Denied</h2></div>;
    }

    return (
        <div className="container" style={{ padding: '70px 20px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ marginBottom: '5px' }}>🛵 Current Tasks</h2>
                    <span style={{ fontSize: '14px', color: '#666' }}>Rider: <strong>{user.name}</strong></span>
                </div>
                <Link to="/delivery/analytics" className="btn-secondary" style={{ textDecoration: 'none', padding: '10px 15px', borderRadius: '8px', background: '#f0f0f0', color: '#333', fontWeight: 'bold' }}>
                    View Analytics 📊
                </Link>
            </div>

            {/* Active Deliveries List */}
            <div>
                {activeOrders.length === 0 ? (
                    <div style={{ background: '#f9f9f9', padding: '50px', borderRadius: '15px', textAlign: 'center', color: '#888' }}>
                        <i className="fa-solid fa-mug-hot" style={{ fontSize: '40px', marginBottom: '20px', color: '#ddd' }}></i>
                        <p style={{ fontSize: '18px' }}>No active deliveries right now.</p>
                        <p style={{ fontSize: '14px' }}>New orders will appear here automatically.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {activeOrders.map(order => {
                            // Fallback Logic for Name
                            let customerName = order.deliveryAddress?.name;
                            let dropAddress = order.deliveryAddress?.street;

                            if (!customerName && dropAddress && dropAddress.includes('||')) {
                                const parts = dropAddress.split('||');
                                customerName = parts[0].replace('Name:', '').trim();
                                dropAddress = parts[1].trim();
                            }

                            return (
                                <div key={order._id} style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: 'var(--shadow-md)', borderLeft: '5px solid var(--primary)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                        <div>
                                            <p style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--primary)' }}>Order #{order._id.slice(-6).toUpperCase()}</p>
                                            <span style={{ fontSize: '12px', background: '#e3f2fd', color: '#2196f3', padding: '4px 10px', borderRadius: '12px', display: 'inline-block', marginTop: '5px' }}>{order.status}</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontWeight: '800', fontSize: '18px' }}>₹{order.totalAmount}</p>
                                            <p style={{ fontSize: '13px', color: '#888' }}>{order.paymentMethod}</p>
                                        </div>
                                    </div>

                                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                                        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '30px', textAlign: 'center' }}>👤</div>
                                            <strong>{customerName || 'Guest'}</strong>
                                        </div>
                                        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '30px', textAlign: 'center' }}>📍</div>
                                            <span>
                                                {dropAddress || 'Customer Address'}<br />
                                                <small style={{ color: '#888' }}>{order.deliveryAddress?.city}</small>
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '30px', textAlign: 'center' }}>📞</div>
                                            <a href={`tel:${order.deliveryAddress?.phone}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>
                                                {order.deliveryAddress?.phone || 'N/A'}
                                            </a>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <button
                                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${order.deliveryAddress?.lat || 0},${order.deliveryAddress?.lng || 0}`, '_blank')}
                                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontWeight: '600' }}
                                        >
                                            📍 Map
                                        </button>
                                        <button
                                            onClick={() => handleMarkDelivered(order._id)}
                                            className="btn-primary"
                                            style={{ padding: '12px', borderRadius: '8px', fontWeight: '600' }}
                                        >
                                            Mark Delivered
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryDashboard;
