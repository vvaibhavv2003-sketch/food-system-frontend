import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_ORDERS } from '../config/apiConfig';

const OrderTracking = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [statusStep, setStatusStep] = useState(0);

    // Mock steps
    const steps = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];

    useEffect(() => {
        // Fetch order details
        const fetchOrder = async () => {
            try {
                // In a real app, you would fetch a specific ID: 
                // const res = await fetch(`http://localhost:5000/api/orders/${orderId}`);

                // For this demo with the current backend setup, we'll fetch all and find the latest or specific one
                const res = await fetch(API_ORDERS);
                const data = await res.json();

                // Logic to find the order. If orderId is 'latest', get the first one.
                let foundOrder;
                if (orderId === 'latest') {
                    foundOrder = data[0]; // Assuming sorted by new
                } else {
                    foundOrder = data.find(o => o._id === orderId);
                }

                if (foundOrder) {
                    setOrder(foundOrder);
                    updateStatusStep(foundOrder.status);
                }
            } catch (err) {
                console.error("Error fetching order:", err);
            }
        };

        fetchOrder();

        // Polling for live updates every 5 seconds
        const interval = setInterval(fetchOrder, 5000);
        return () => clearInterval(interval);
    }, [orderId]);

    const updateStatusStep = (status) => {
        let step = 0;
        switch (status) {
            case 'Pending': step = 0; break;
            case 'Confirmed': step = 1; break;
            case 'Preparing': step = 2; break;
            case 'Out for Delivery': step = 3; break;
            case 'Delivered': step = 4; break;
            default: step = 0;
        }
        setStatusStep(step);
    };

    if (!order) return (
        <div style={{ padding: '100px', textAlign: 'center', fontSize: '18px' }}>
            <p>Loading Order Details...</p>
            <Link to="/">Go Home</Link>
        </div>
    );

    // Coordinates for the map
    // Default to New Delhi if not present
    const lat = order.deliveryAddress?.lat || 28.6139;
    const lng = order.deliveryAddress?.lng || 77.2090;

    // Create OpenStreetMap Embed URL
    const bboxDiff = 0.01; // Zoom level approx
    const bbox = `${lng - bboxDiff},${lat - bboxDiff},${lng + bboxDiff},${lat + bboxDiff}`;
    const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

    return (
        <div style={{ padding: '100px 5% 50px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '30px' }}>
                <Link to="/" style={{ color: '#666', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>&larr;</span> Back to Home
                </Link>
            </div>

            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0' }}>Order #{order._id.slice(-6)}</h1>
                        {order.deliveryAddress && (
                            <p style={{ color: '#666', margin: 0 }}>
                                Arriving at: <strong>{order.deliveryAddress.street}</strong><br />
                                <span style={{ fontSize: '13px' }}>{order.deliveryAddress.city}, {order.deliveryAddress.zip}</span>
                            </p>
                        )}
                        <p style={{ marginTop: '10px', fontSize: '14px', color: '#555' }}>
                            <strong>Payment:</strong> {order.paymentMethod} {order.paymentMethod !== 'COD' && order.paymentResult?.status === 'COMPLETED' ? '✅ Paid' : ''}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{
                            background: steps[statusStep] === 'Delivered' ? '#e8f5e9' : '#e3f2fd',
                            color: steps[statusStep] === 'Delivered' ? '#2e7d32' : '#2196f3',
                            padding: '10px 20px', borderRadius: '50px',
                            fontWeight: '600', fontSize: '14px', display: 'inline-block'
                        }}>
                            {order.status || 'Pending'}
                        </span>
                        <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                            Updated: {new Date(order.updatedAt || Date.now()).toLocaleTimeString()}
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '50px', position: 'relative', overflowX: 'auto', paddingBottom: '10px' }}>
                    {/* Background Line */}
                    <div style={{
                        position: 'absolute', top: '15px', left: '0', right: '0',
                        height: '3px', background: '#f0f0f0', zIndex: 0
                    }}>
                        <div style={{
                            width: `${(statusStep / (steps.length - 1)) * 100}%`,
                            height: '100%', background: '#4caf50', transition: 'width 0.5s ease'
                        }} />
                    </div>

                    {steps.map((step, index) => (
                        <div key={index} style={{ zIndex: 1, textAlign: 'center', minWidth: '60px', position: 'relative' }}>
                            <div style={{
                                width: '35px', height: '35px', borderRadius: '50%',
                                background: index <= statusStep ? '#4caf50' : '#fff',
                                border: index <= statusStep ? '3px solid #4caf50' : '3px solid #eee',
                                color: index <= statusStep ? 'white' : '#ccc',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 10px', transition: 'all 0.3s', fontWeight: 'bold'
                            }}>
                                {index < statusStep ? '✓' : index + 1}
                            </div>
                            <span style={{
                                fontSize: '12px',
                                color: index <= statusStep ? '#333' : '#bbb',
                                fontWeight: index <= statusStep ? '700' : '400'
                            }}>
                                {step}
                            </span>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                    {/* Map Section - Using iframe to avoid react-leaflet dependency issues */}
                    <div style={{ height: '350px', borderRadius: '15px', overflow: 'hidden', border: '2px solid #eee', position: 'relative' }}>
                        <iframe
                            width="100%"
                            height="100%"
                            src={mapSrc}
                            style={{ border: 0 }}
                            title="Live Location"
                        ></iframe>
                        <div style={{
                            position: 'absolute', bottom: '10px', left: '10px',
                            background: 'rgba(255,255,255,0.9)', padding: '5px 10px',
                            borderRadius: '5px', fontSize: '10px', color: '#666'
                        }}>
                            OpenStreetMap Data
                        </div>
                    </div>

                    {/* Delivery Boy Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '15px', border: '1px solid #eee' }}>
                            <h3 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: '700' }}>Delivery Partner</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{
                                    width: '60px', height: '60px', borderRadius: '50%',
                                    background: '#ddd', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: '24px'
                                }}>
                                    🛵
                                </div>
                                <div>
                                    <p style={{ fontWeight: 'bold', fontSize: '16px', margin: '0 0 5px 0' }}>Ramesh Kumar</p>
                                    <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>4.8 ★ Rating • Vaccination Done</p>
                                </div>
                            </div>

                            <div style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
                                <button style={{
                                    flex: 1, padding: '12px', borderRadius: '8px',
                                    border: 'none', background: '#4caf50', color: 'white',
                                    cursor: 'pointer', fontWeight: '600', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}>
                                    <i className="fa-solid fa-phone"></i> Call
                                </button>
                                <button style={{
                                    flex: 1, padding: '12px', borderRadius: '8px',
                                    border: '1px solid #ddd', background: 'white', color: '#333',
                                    cursor: 'pointer', fontWeight: '600', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}>
                                    <i className="fa-solid fa-message"></i> Message
                                </button>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', padding: '15px', background: '#fff3e0', borderRadius: '10px', fontSize: '13px', color: '#e65100' }}>
                            <strong>Note:</strong> Live location is simulated. In a real app, this would track the driver's actual GPS coordinates in real-time.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
