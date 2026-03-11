import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';

const DeliveryAnalytics = () => {
    const { user } = useAuth();
    const { orders } = useOrders();

    // Rates
    const RATE_PER_DELIVERY = 40; // ₹40 per delivery

    // Calculate Stats
    const stats = React.useMemo(() => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        const deliveredOrders = orders.filter(o => o.status === 'Delivered');
        const activeOrders = orders.filter(o => o.status === 'Out for Delivery' || o.status === 'Preparing');

        const todayDelivered = deliveredOrders.filter(o => new Date(o.createdAt).getTime() >= startOfDay);

        const totalEarnings = deliveredOrders.length * RATE_PER_DELIVERY;
        const todayEarnings = todayDelivered.length * RATE_PER_DELIVERY;

        // Last 7 days chart data
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            d.setHours(0, 0, 0, 0);

            const dayOrders = deliveredOrders.filter(o => {
                const od = new Date(o.createdAt);
                return od.getDate() === d.getDate() && od.getMonth() === d.getMonth();
            });

            chartData.push({
                day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                earnings: dayOrders.length * RATE_PER_DELIVERY
            });
        }

        return {
            totalDelivered: deliveredOrders.length,
            todayDelivered: todayDelivered.length,
            todayEarnings,
            totalEarnings,
            activeOrders,
            chartData
        };
    }, [orders]);

    if (!user || user.role !== 'delivery') {
        return <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}><h2>Access Denied</h2></div>;
    }

    return (
        <div className="container" style={{ padding: '100px 20px 40px' }}>
            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ marginBottom: '5px' }}>📊 Performance Analytics</h2>
                <span style={{ fontSize: '14px', color: '#666' }}>Rider: <strong>{user.name}</strong></span>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderBottom: '4px solid #2e7d32' }}>
                    <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>Total Earnings</p>
                    <h3 style={{ fontSize: '24px', margin: '5px 0' }}>₹{stats.totalEarnings.toLocaleString()}</h3>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderBottom: '4px solid #2e7d32' }}>
                    <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>Today's Earnings</p>
                    <h3 style={{ fontSize: '24px', margin: '5px 0' }}>₹{stats.todayEarnings}</h3>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderBottom: '4px solid var(--primary)' }}>
                    <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>Today's Deliveries</p>
                    <h3 style={{ fontSize: '24px', margin: '5px 0' }}>{stats.todayDelivered}</h3>
                </div>
            </div>

            {/* Earnings Chart */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', height: 'fit-content' }}>
                <h3 style={{ marginBottom: '20px' }}>Weekly Earnings 💰</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '10px' }}>
                    {stats.chartData.map((d, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                            <div style={{
                                width: '100%',
                                background: i === 6 ? 'var(--primary)' : '#eee',
                                height: `${Math.min((d.earnings / 500) * 100, 100)}%`,
                                borderRadius: '5px 5px 0 0',
                                minHeight: '4px',
                                transition: 'height 0.3s'
                            }} title={`₹${d.earnings}`}></div>
                            <span style={{ fontSize: '12px', color: '#666', marginTop: '5px', fontWeight: 'bold' }}>{d.day}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DeliveryAnalytics;
