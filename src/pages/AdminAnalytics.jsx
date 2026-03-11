import React, { useMemo } from 'react';
import { useOrders } from '../context/OrderContext';
import { motion } from 'framer-motion';

const AdminAnalytics = () => {
    const { orders } = useOrders();

    const stats = useMemo(() => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

        // Helper to get time 6 months ago
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 5);
        sixMonthsAgo.setDate(1); // Start of that month

        let todayIncome = 0;
        let monthIncome = 0;
        let yearIncome = 0;
        let totalIncome = 0;
        let totalItems = 0;

        // Chart Data (Last 6 Months)
        const monthMap = {}; // "Jan 2024": 5000
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Initialize last 6 months in map
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(now.getMonth() - i);
            const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            monthMap[key] = 0;
        }

        orders.forEach(order => {
            const orderTime = new Date(order.createdAt).getTime();
            const amount = order.totalAmount || 0;
            const items = order.items.reduce((s, i) => s + i.qty, 0);

            totalIncome += amount;
            totalItems += items;

            if (orderTime >= startOfDay) todayIncome += amount;
            if (orderTime >= startOfMonth) monthIncome += amount;
            if (orderTime >= startOfYear) yearIncome += amount;

            // Chart Data Aggregation
            const d = new Date(order.createdAt);
            const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            if (monthMap.hasOwnProperty(key)) {
                monthMap[key] += amount;
            }
        });

        const chartData = Object.keys(monthMap).map(key => ({
            label: key.split(" ")[0], // Just Month Name
            value: monthMap[key]
        }));

        // Profit = 40% of Income (Assumption)
        const MARGIN = 0.4;

        return {
            todayProfit: Math.round(todayIncome * MARGIN),
            monthlyProfit: Math.round(monthIncome * MARGIN),
            yearlyProfit: Math.round(yearIncome * MARGIN),
            totalIncome,
            totalItems,
            chartData
        };
    }, [orders]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <h3 style={{ marginBottom: '20px', color: '#444' }}>📊 Financial Analytics (Profit & Deliveries)</h3>

            <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                {/* Today */}
                <div style={{ padding: '25px', background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', borderRadius: '16px', color: 'white', boxShadow: '0 8px 20px rgba(108, 92, 231, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: '13px', opacity: 0.9, fontWeight: '600', textTransform: 'uppercase', margin: 0 }}>Today's Profit</p>
                            <h2 style={{ fontSize: '36px', fontWeight: '800', margin: '5px 0 0' }}>₹{stats.todayProfit.toLocaleString()}</h2>
                        </div>
                        <i className="fa-solid fa-calendar-day" style={{ fontSize: '30px', opacity: 0.5 }}></i>
                    </div>
                </div>

                {/* Monthly */}
                <div style={{ padding: '25px', background: 'white', borderRadius: '16px', border: '1px solid #f0f0f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: '13px', color: '#888', fontWeight: '600', textTransform: 'uppercase', margin: 0 }}>This Month Profit</p>
                            <h2 style={{ fontSize: '32px', color: '#2d3436', fontWeight: '800', margin: '5px 0 0' }}>₹{stats.monthlyProfit.toLocaleString()}</h2>
                        </div>
                        <i className="fa-solid fa-calendar-check" style={{ fontSize: '30px', color: '#00b894', opacity: 0.2 }}></i>
                    </div>
                </div>

                {/* Yearly */}
                <div style={{ padding: '25px', background: 'white', borderRadius: '16px', border: '1px solid #f0f0f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: '13px', color: '#888', fontWeight: '600', textTransform: 'uppercase', margin: 0 }}>Yearly Profit</p>
                            <h2 style={{ fontSize: '32px', color: '#2d3436', fontWeight: '800', margin: '5px 0 0' }}>₹{stats.yearlyProfit.toLocaleString()}</h2>
                        </div>
                        <i className="fa-solid fa-chart-line" style={{ fontSize: '30px', color: '#0984e3', opacity: 0.2 }}></i>
                    </div>
                </div>

                {/* Total Stats */}
                <div style={{ padding: '25px', background: 'linear-gradient(135deg, #00b894, #55efc4)', borderRadius: '16px', color: 'white', boxShadow: '0 8px 20px rgba(0, 184, 148, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: '13px', opacity: 0.9, fontWeight: '600', textTransform: 'uppercase', margin: 0 }}>Total Items Sold</p>
                            <h2 style={{ fontSize: '36px', fontWeight: '800', margin: '5px 0 0' }}>{stats.totalItems.toLocaleString()}</h2>
                        </div>
                        <i className="fa-solid fa-box-open" style={{ fontSize: '30px', opacity: 0.5 }}></i>
                    </div>
                </div>
            </div>

            {/* 6 Months Chart */}
            <div 
                className="admin-chart-wrapper"
                style={{ 
                    background: 'white', 
                    padding: '20px 15px', 
                    borderRadius: '16px', 
                    border: '1px solid #eee', 
                    boxShadow: '0 4px 15px rgba(0,0,0,0.02)', 
                    overflowX: 'auto',
                    margin: window.innerWidth <= 768 ? '0 -12px 0 -12px' : '0 0 30px 0',
                    width: window.innerWidth <= 768 ? 'calc(100% + 24px)' : '100%'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '0 12px' }}>
                    <h4 style={{ margin: 0, color: '#444', fontSize: '15px' }}>📈 6 Month Revenue Overview</h4>
                    <span style={{ fontSize: '10px', background: '#f5f5f5', padding: '4px 10px', borderRadius: '20px', color: '#666' }}>Updated Live</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '8px', minWidth: '400px', paddingBottom: '10px' }}>
                    {stats.chartData.map((data, i) => {
                        const maxVal = Math.max(...stats.chartData.map(d => d.value), 100);
                        const heightPct = (data.value / maxVal) * 100;

                        return (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: '100%' }}>
                                {data.value > 0 && (
                                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>₹{data.value}</span>
                                )}
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(heightPct, 5)}%` }}
                                    transition={{ duration: 1, delay: i * 0.1 }}
                                    style={{
                                        width: '100%',
                                        background: i === stats.chartData.length - 1 ? 'var(--primary)' : '#e0e0e0',
                                        borderRadius: '8px 8px 0 0',
                                        position: 'relative',
                                        minHeight: '4px'
                                    }}
                                    title={`Revenue: ₹${data.value}`}
                                />
                                <span style={{ marginTop: '10px', fontSize: '11px', color: '#888', fontWeight: '600' }}>{data.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

export default AdminAnalytics;
