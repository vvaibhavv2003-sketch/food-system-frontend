import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { API_NOMINATIM_REVERSE } from '../config/apiConfig';

const Checkout = ({ cart, totalPrice, clearCart, addToCart, decreaseQuantity }) => {
    const navigate = useNavigate();
    const { placeOrder } = useOrders();
    const { user } = useAuth();

    const [address, setAddress] = useState({
        name: user?.name || '',
        street: '',
        flatNo: '',
        society: '',
        city: '',
        zip: '',
        phone: user?.mobile || '',
        lat: null,
        lng: null
    });

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [loading, setLoading] = useState(false);
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });
    const [upiId, setUpiId] = useState('');
    const [selectedUpiApp, setSelectedUpiApp] = useState('');
    const [showQR, setShowQR] = useState(true);

    const handleInputChange = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    const handleCardChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'number') {
            formattedValue = value.replace(/\D/g, '').substring(0, 16).replace(/(\d{4})/g, '$1 ').trim();
        } else if (name === 'expiry') {
            formattedValue = value.replace(/\D/g, '').substring(0, 4).replace(/^(\d{2})/, '$1/').trim();
        } else if (name === 'cvv') {
            formattedValue = value.replace(/\D/g, '').substring(0, 3);
        }

        setCardDetails({ ...cardDetails, [name]: formattedValue });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            alert("Your cart is empty!");
            navigate('/');
            return;
        }

        if (!address.name || !address.street || !address.city || !address.phone) {
            alert("Please fill in all address details (Name, Address, Phone).");
            return;
        }

        if (paymentMethod === 'Credit Card') {
            if (cardDetails.number.length < 19 || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
                alert("Please fill in all card details.");
                return;
            }
        }

        if (paymentMethod === 'UPI' && !upiId && !showQR) {
            alert("Please enter UPI ID or Scan QR Code.");
            return;
        }

        setLoading(true);

        // Simulate Payment Processing
        if (paymentMethod !== 'COD') {
            try {
                await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec delay
            } catch (err) {
                setLoading(false);
                alert("Payment Failed. Please try again.");
                return;
            }
        }

        // Group items for backend
        const itemMap = new Map();
        cart.forEach(item => {
            const id = item.id || item._id;
            if (itemMap.has(id)) {
                itemMap.get(id).qty += 1;
            } else {
                itemMap.set(id, {
                    name: item.name,
                    qty: 1,
                    price: item.price
                });
            }
        });

        const orderData = {
            items: Array.from(itemMap.values()),
            totalAmount: totalPrice,
            deliveryAddress: {
                ...address,
                street: `Name: ${address.name} || ${address.flatNo ? address.flatNo + ', ' : ''}${address.society ? address.society + ', ' : ''}${address.street}`, // Embedding Name for immediate robustness
            },
            paymentMethod,
            paymentResult: paymentMethod === 'COD' ? {} : {
                id: `TXN_${Math.floor(Math.random() * 100000000)}`,
                status: 'COMPLETED',
                update_time: new Date().toISOString(),
                email_address: user?.email || 'guest@example.com'
            },
            user: user ? user._id : 'Guest'
        };

        if (paymentMethod === 'UPI') {
            // Logic for UPI Redirection
            const newOrder = await placeOrder(orderData);
            setLoading(false);

            if (newOrder) {
                // Determine Scheme based on selection
                let appScheme = 'upi://pay';
                if (selectedUpiApp === 'GPay') appScheme = 'tez://upi/pay';
                if (selectedUpiApp === 'PhonePe') appScheme = 'phonepe://pay';
                if (selectedUpiApp === 'Paytm') appScheme = 'paytmmp://pay';

                // Construct Deep Link with Exact Amount
                const upiDeepLink = `${appScheme}?pa=vaibhavpanchal3518@oksbi&pn=Gourmet%20Paradise&am=${totalPrice}&cu=INR&tn=Order_${newOrder._id.slice(-6)}`;

                // Redirect User
                window.location.href = upiDeepLink;

                // Navigate users to tracking page so they see it when they switch back/close the app
                alert(`Order Placed! Redirecting to ${selectedUpiApp || 'UPI App'} to pay ₹${totalPrice}...`);
                clearCart();
                navigate(`/order-tracking/${newOrder._id}`);
            } else {
                alert('Failed to place order. Please try again.');
            }
            return;
        }

        const newOrder = await placeOrder(orderData);
        setLoading(false);

        if (newOrder) {
            alert(`Order Placed Successfully! (${paymentMethod})\nWe will deliver to: ${address.flatNo ? address.flatNo + ', ' : ''}${address.street}, ${address.city}`);
            clearCart();
            navigate(`/order-tracking/${newOrder._id}`);
        } else {
            alert('Failed to place order. Please try again.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ padding: '100px 5% 50px', maxWidth: '1200px', margin: '0 auto' }}
        >
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '30px', textAlign: 'center' }}>
                Checkout ({cart.length} Items)
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                {/* Left Column: Forms */}
                <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2 style={{ fontSize: '24px', margin: 0 }}>1. Delivery Address</h2>
                        <button
                            type="button"
                            onClick={() => {
                                if (navigator.geolocation) {
                                    navigator.geolocation.getCurrentPosition(async (position) => {
                                        const { latitude, longitude } = position.coords;

                                        try {
                                            const response = await fetch(API_NOMINATIM_REVERSE(latitude, longitude));
                                            const data = await response.json();
                                            const addr = data.address;

                                            // More aggressive mapping to ensure fields are filled
                                            const house = addr.house_number || addr.building || '';
                                            const building = addr.residential || addr.apartment || addr.naming || addr.commercial || addr.industrial || '';
                                            const area = addr.suburb || addr.neighbourhood || addr.quarter || addr.hamlet || addr.isolated_dwelling || '';
                                            const road = addr.road || addr.pedestrian || addr.footway || addr.path || '';

                                            setAddress({
                                                ...address,
                                                lat: latitude,
                                                lng: longitude,
                                                flatNo: house,
                                                society: building ? `${building}, ${area}` : area,
                                                street: road || area,
                                                city: addr.city || addr.town || addr.village || addr.municipality || addr.county || data.display_name.split(',')[0],
                                                zip: addr.postcode || ''
                                            });

                                            if (!house) {
                                                alert(`Location Detected!\n\n⚠️ Note: Exact House/Flat Number could not be detected from map data.\n\nPlease manually enter your "Flat / House No.". \n\n(Precise GPS location captured for delivery)`);
                                            } else {
                                                alert(`Location Detected! Address filled.\nLat: ${latitude}\nLng: ${longitude}`);
                                            }
                                        } catch (error) {
                                            console.error("Error fetching address:", error);
                                            setAddress({
                                                ...address,
                                                lat: latitude,
                                                lng: longitude,
                                                flatNo: '',
                                                society: 'Location via GPS',
                                                street: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
                                                city: 'Detected Location'
                                            });
                                            alert("GPS Coordinates captured for tracking!");
                                        }
                                    }, (error) => {
                                        alert("Error detecting location: " + error.message);
                                    });
                                } else {
                                    alert("Geolocation is not supported by this browser.");
                                }
                            }}
                            style={{ padding: '8px 15px', borderRadius: '20px', border: 'none', background: '#e3f2fd', color: '#2196f3', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                        >
                            📍 Use Current Location
                        </button>
                    </div>
                    <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={address.name}
                            onChange={handleInputChange}
                            style={inputStyle}
                            required
                        />
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <input
                                type="text"
                                name="flatNo"
                                placeholder="Flat / House No."
                                value={address.flatNo}
                                onChange={handleInputChange}
                                style={{ ...inputStyle, flex: 1 }}
                            />
                            <input
                                type="text"
                                name="society"
                                placeholder="Building / Society / Landmark"
                                value={address.society}
                                onChange={handleInputChange}
                                style={{ ...inputStyle, flex: 2 }}
                            />
                        </div>
                        <input
                            type="text"
                            name="street"
                            placeholder="Street / Area / Colony"
                            value={address.street}
                            onChange={handleInputChange}
                            style={inputStyle}
                            required
                        />
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <input
                                type="text"
                                name="city"
                                placeholder="City"
                                value={address.city}
                                onChange={handleInputChange}
                                style={{ ...inputStyle, flex: 1 }}
                                required
                            />
                            <input
                                type="text"
                                name="zip"
                                placeholder="Zip Code"
                                value={address.zip}
                                onChange={handleInputChange}
                                style={{ ...inputStyle, flex: 1 }}
                            />
                        </div>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            value={address.phone}
                            onChange={handleInputChange}
                            style={inputStyle}
                            required
                        />
                    </form>

                    <h2 style={{ fontSize: '24px', margin: '30px 0 20px' }}>2. Payment Method</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={radioLabelStyle(paymentMethod === 'COD')}>
                            <input
                                type="radio"
                                name="payment"
                                value="COD"
                                checked={paymentMethod === 'COD'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                style={{ marginRight: '10px' }}
                            />
                            Cash on Delivery (COD)
                        </label>
                        <label style={radioLabelStyle(paymentMethod === 'Credit Card')}>
                            <input
                                type="radio"
                                name="payment"
                                value="Credit Card"
                                checked={paymentMethod === 'Credit Card'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                style={{ marginRight: '10px' }}
                            />
                            Credit / Debit Card
                        </label>
                        <label style={radioLabelStyle(paymentMethod === 'UPI')}>
                            <input
                                type="radio"
                                name="payment"
                                value="UPI"
                                checked={paymentMethod === 'UPI'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                style={{ marginRight: '10px' }}
                            />
                            UPI (GPay, PhonePe)
                        </label>
                        {paymentMethod === 'UPI' && (
                            <div style={{ marginLeft: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <p style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: '#555' }}>Select UPI App:</p>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {['GPay', 'PhonePe', 'Paytm'].map(app => (
                                        <button
                                            key={app}
                                            type="button"
                                            onClick={() => setSelectedUpiApp(app)}
                                            style={{
                                                flex: 1,
                                                padding: '12px',
                                                border: selectedUpiApp === app ? '2px solid #28a745' : '1px solid #ddd',
                                                borderRadius: '8px',
                                                background: selectedUpiApp === app ? '#e8f5e9' : '#fff',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                color: selectedUpiApp === app ? '#28a745' : '#555',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '5px'
                                            }}
                                        >
                                            {app === 'GPay' && <span style={{ color: '#4285F4' }}>G</span>}
                                            {app === 'PhonePe' && <span style={{ color: '#5f259f' }}>P</span>}
                                            {app}
                                        </button>
                                    ))}
                                </div>

                                <div style={{ textAlign: 'center', marginTop: '5px', padding: '20px', background: '#fff', borderRadius: '15px', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>Scan QR to Pay <strong>₹{totalPrice}</strong></p>
                                    <div style={{ background: 'white', padding: '10px', display: 'inline-block', borderRadius: '10px', border: '1px solid #eee' }}>
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=vaibhavpanchal3518@oksbi&pn=Gourmet%20Paradise&am=${totalPrice}&cu=INR`}
                                            alt="UPI QR"
                                            style={{ borderRadius: '5px', width: '160px', height: '160px', display: 'block' }}
                                        />
                                    </div>
                                    <div style={{ marginTop: '15px', background: '#f5f5f5', padding: '8px 15px', borderRadius: '20px', display: 'inline-block' }}>
                                        <p style={{ fontSize: '12px', margin: 0, color: '#555', fontFamily: 'monospace' }}>
                                            UPI ID: <strong>vaibhavpanchal3518@oksbi</strong>
                                        </p>
                                    </div>
                                    {selectedUpiApp && (
                                        <p style={{ fontSize: '12px', color: '#28a745', marginTop: '10px', fontWeight: '500' }}>
                                            Open <strong>{selectedUpiApp}</strong> and scan this code
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'Credit Card' && (
                            <div style={{ marginLeft: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <input
                                    type="text"
                                    name="number"
                                    placeholder="Card Number (0000 ...)"
                                    value={cardDetails.number}
                                    onChange={handleCardChange}
                                    style={inputStyle}
                                    maxLength="19"
                                />
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        name="expiry"
                                        placeholder="MM/YY"
                                        value={cardDetails.expiry}
                                        onChange={handleCardChange}
                                        style={inputStyle}
                                        maxLength="5"
                                    />
                                    <input
                                        type="text"
                                        name="cvv"
                                        placeholder="CVV"
                                        value={cardDetails.cvv}
                                        onChange={handleCardChange}
                                        style={inputStyle}
                                        maxLength="3"
                                    />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Card Holder Name"
                                    value={cardDetails.name}
                                    onChange={handleCardChange}
                                    style={inputStyle}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Order Summary - Logic Update */}
                <div style={{ background: '#f8f9fa', padding: '30px', borderRadius: '20px', height: 'fit-content' }}>
                    <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Order Summary</h2>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
                        {cart.length === 0 ? <p style={{ textAlign: 'center', color: '#999' }}>Your cart is empty.</p> :
                            Object.values(cart.reduce((acc, item) => {
                                // Force ID to string to ensure "1" == 1 match
                                const storedId = item.id || item._id;
                                const id = storedId ? String(storedId) : 'unknown';

                                if (!acc[id]) {
                                    acc[id] = { ...item, qty: 0 };
                                }
                                acc[id].qty++;
                                return acc;
                            }, {})).map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{item.name}</h4>
                                        <div style={{ fontSize: '13px', color: '#666' }}>₹{item.price} x {item.qty}</div>
                                    </div>
                                    <div style={{ fontWeight: 'bold' }}>
                                        ₹{item.price * item.qty}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    <div style={{ borderTop: '2px solid #ddd', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold' }}>
                        <span>Total</span>
                        <span>₹{totalPrice}</span>
                    </div>

                    <button
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="btn-primary"
                        style={{
                            width: '100%',
                            marginTop: '30px',
                            padding: '15px',
                            borderRadius: '10px',
                            opacity: loading ? 0.7 : 1,
                            background: loading ? '#ccc' : '#28a745',
                            color: '#fff',
                            border: 'none',
                            fontSize: '18px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        {loading ? (
                            <>
                                <span style={{
                                    width: '20px', height: '20px', border: '3px solid #fff',
                                    borderTop: '3px solid transparent', borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></span>
                                Processing...
                            </>
                        ) : 'Place Order'}
                    </button>
                    <p style={{ marginTop: '15px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                        By placing an order, you agree to our Terms and Conditions.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

const inputStyle = {
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px',
    outline: 'none',
    width: '100%',
    backgroundColor: '#fafafa'
};

const radioLabelStyle = (isActive) => ({
    padding: '15px',
    borderRadius: '8px',
    border: listBorder(isActive),
    backgroundColor: isActive ? '#fff5f5' : '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontWeight: isActive ? '600' : '400',
    transition: 'all 0.2s'
});

const listBorder = (active) => active ? '2px solid #ff4757' : '1px solid #ddd';

const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(styleSheet);


export default Checkout;
