import React, { useState, useMemo, useEffect } from 'react';
import Hero from '../components/Hero';
import FeaturesSection from '../components/FeaturesSection';
import PromoBanners from '../components/PromoBanners';
import FoodCard from '../components/FoodCard';
import InspirationCarousel from '../components/InspirationCarousel';
import Filters from '../components/Filters';
import ReservationSection from '../components/ReservationSection';
import Footer from '../components/Footer';
import { useFood } from '../context/FoodContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const TypewriterText = () => {
    return (
        <h2 style={{ fontSize: '36px', fontWeight: '800', marginTop: '10px' }}>
            <span>Wake Up Your </span>
            <span style={{ color: 'var(--primary)' }}>Taste Buds</span>
        </h2>
    );
};

const Home = ({ addToCart, cart, decreaseQuantity }) => {
    const { foodItems } = useFood();
    const { user } = useAuth();
    const { fetchUserOrders } = useOrders();
    const navigate = useNavigate();
    const [recentOrders, setRecentOrders] = useState([]);

    // Fetch recent orders if user is logged in
    useEffect(() => {
        const getRecent = async () => {
            if (user && user.role === 'user') {
                const data = await fetchUserOrders(user._id);
                // Filter for orders in the last 30 days
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

                const lastMonthOrders = data.filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= oneMonthAgo;
                });

                setRecentOrders(lastMonthOrders);
            }
        };

        getRecent();

        // Listen for new orders to refresh live
        window.addEventListener('orderPlaced', getRecent);
        return () => window.removeEventListener('orderPlaced', getRecent);
    }, [user]);

    // Home page only shows first 6 featured items
    const featuredFood = useMemo(() => {
        return foodItems.slice(0, 6);
    }, [foodItems]);

    const handleCategoryClick = (catName) => {
        navigate(`/menu/${catName}`);
    };

    return (
        <div style={{ background: '#fcfcfc' }}>
            <Hero />

            <FeaturesSection />

            <PromoBanners />

            {/* Dashboard removed to show menu directly */}

            <main className="container" id="menu" style={{ margin: '0 auto', paddingBottom: 'var(--section-spacing)' }}>

                {/* Menu Section Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '13px' }}>
                        Our Menu
                    </span>
                    <TypewriterText />
                </div>

                {/* Inspiration + Filters */}
                <InspirationCarousel setCategory={handleCategoryClick} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '800' }}>Featured Selection</h3>
                    <Link to="/menu" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>
                        See all <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                </div>

                {/* Grid - Only 6 items */}
                <div className="grid-container">
                    {featuredFood.map(item => (
                        <FoodCard key={item.id} item={item} addToCart={addToCart} cart={cart} decreaseQuantity={decreaseQuantity} />
                    ))}
                </div>

                {/* Always show "Explore Full Menu" button */}
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <Link to="/menu" style={{ textDecoration: 'none' }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-primary"
                            style={{
                                padding: '14px 40px',
                                fontSize: '16px',
                                borderRadius: '50px',
                                boxShadow: '0 10px 20px rgba(var(--primary-rgb), 0.3)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            Explore Full Menu <i className="fa-solid fa-utensils"></i>
                        </motion.button>
                    </Link>
                </div>
            </main>

            <ReservationSection />

            <Footer />
        </div>
    );
};

export default Home;
