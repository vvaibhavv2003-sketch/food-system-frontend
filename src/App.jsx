import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FoodProvider } from './context/FoodContext';
import { OrderProvider, useOrders } from './context/OrderContext';
import { StoreProvider } from './context/StoreContext';
import { OfferProvider } from './context/OfferContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';
import DeliveryAnalytics from './pages/DeliveryAnalytics';
import OfferDetails from './pages/OfferDetails';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';
import Menu from './pages/Menu';
import { AnimatePresence } from 'framer-motion';
import './index.css';

function AppContent() {
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const location = useLocation();
    const { placeOrder } = useOrders();
    const { user } = useAuth();
    const navigate = useNavigate();

    const addToCart = (item) => {
        setCart(prevCart => {
            const { qty, ...cleanItem } = item;
            return [...prevCart, cleanItem];
        });
    };

    const decreaseQuantity = (item) => {
        const idToCheck = item.id || item._id;
        setCart(prevCart => {
            const index = prevCart.findIndex(cartItem => (cartItem.id || cartItem._id) === idToCheck);
            if (index > -1) {
                const newCart = [...prevCart];
                newCart.splice(index, 1);
                return newCart;
            }
            return prevCart;
        });
    };

    const toggleCart = () => setShowCart(!showCart);
    const totalPrice = cart.reduce((total, item) => total + item.price, 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        if (!user) {
            alert("Please register or login to place an order.");
            toggleCart(); // Close cart modal
            navigate('/login');
            return;
        }

        // Navigate to Checkout page instead of direct API call
        toggleCart();
        navigate('/checkout');
    };

    return (
        <>
            {!location.pathname.startsWith('/admin') && <Navbar cartCount={cart.length} toggleCart={toggleCart} />}

            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<Home addToCart={addToCart} cart={cart} decreaseQuantity={decreaseQuantity} />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/delivery" element={<DeliveryDashboard />} />
                    <Route path="/delivery/analytics" element={<DeliveryAnalytics />} />
                    <Route path="/checkout" element={<Checkout cart={cart} totalPrice={totalPrice} addToCart={addToCart} clearCart={() => setCart([])} />} />
                    <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
                    <Route path="/my-orders" element={<OrderHistory />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/menu" element={<Menu addToCart={addToCart} cart={cart} decreaseQuantity={decreaseQuantity} />} />
                    <Route path="/menu/:category" element={<Menu addToCart={addToCart} cart={cart} decreaseQuantity={decreaseQuantity} />} />
                    <Route path="/offers/:id" element={<OfferDetails addToCart={addToCart} cart={cart} decreaseQuantity={decreaseQuantity} />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AnimatePresence>

            {/* Global Cart Modal (Available on all pages for User) */}
            {showCart && (
                <div className="cart-modal" style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.6)', zIndex: 2000,
                    display: 'flex', justifyContent: 'flex-end'
                }} onClick={(e) => { if (e.target.className === 'cart-modal') toggleCart() }}>

                    <div className="cart-content" style={{
                        background: 'white', width: '100%', maxWidth: '400px', height: '100%',
                        padding: '30px', boxShadow: '-10px 0 30px rgba(0,0,0,0.2)',
                        animation: 'slideInRight 0.3s ease-out', display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>My Cart 🛒</h2>
                            <span onClick={toggleCart} style={{ fontSize: '24px', cursor: 'pointer', color: '#999' }}>&times;</span>
                        </div>

                        <div className="cart-items" style={{ flex: 1, overflowY: 'auto' }}>
                            {cart.length === 0 ? <p style={{ textAlign: 'center', marginTop: '50px', color: '#999' }}>Your cart is empty.</p> : (
                                Object.values(cart.reduce((acc, item) => {
                                    const storedId = item.id || item._id;
                                    const id = storedId ? String(storedId) : 'unknown';
                                    if (!acc[id]) acc[id] = { ...item, qty: 0 };
                                    acc[id].qty++;
                                    return acc;
                                }, {})).map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center', borderBottom: '1px solid #f9f9f9', paddingBottom: '10px' }}>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: '600', marginBottom: '4px' }}>{item.name}</p>
                                            <p style={{ fontSize: '13px', color: '#888' }}>
                                                ₹{item.price} x {item.qty} <span style={{ fontWeight: '700', color: '#333', marginLeft: '5px' }}>= ₹{item.price * item.qty}</span>
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f5f5f5', padding: '4px', borderRadius: '6px' }}>
                                            <button
                                                onClick={() => decreaseQuantity(item)}
                                                style={{
                                                    width: '28px', height: '28px', borderRadius: '4px', border: 'none',
                                                    background: 'white', color: '#ff4757', fontWeight: 'bold', cursor: 'pointer',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                                }}
                                            >−</button>
                                            <span style={{ fontSize: '14px', fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                                            <button
                                                onClick={() => addToCart(item)}
                                                style={{
                                                    width: '28px', height: '28px', borderRadius: '4px', border: 'none',
                                                    background: 'white', color: '#2ecc71', fontWeight: 'bold', cursor: 'pointer',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                                }}
                                            >+</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="cart-total" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>
                                <span>Total Amount</span>
                                <span>₹{totalPrice}</span>
                            </div>
                            <button className="btn-primary" style={{ width: '100%', padding: '15px' }} onClick={handleCheckout}>
                                Checkout Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function App() {
    return (
        <Router>
            <StoreProvider>
                <OfferProvider>
                    <FoodProvider>
                        <AuthProvider>
                            <OrderProvider>
                                <AppContent />
                            </OrderProvider>
                        </AuthProvider>
                    </FoodProvider>
                </OfferProvider>
            </StoreProvider>
        </Router>
    );
}

export default App;
