import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InspirationCarousel from '../components/InspirationCarousel';
import Filters from '../components/Filters';
import FoodCard from '../components/FoodCard';
import { useFood } from '../context/FoodContext';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';

const Menu = ({ addToCart, cart, decreaseQuantity }) => {
    const { category: urlCategory } = useParams();
    const navigate = useNavigate();
    const { foodItems } = useFood();

    const [filters, setFilters] = useState({
        category: urlCategory || 'All',
        searchTerm: '',
        isVeg: false,
        isPro: false,
        sort: 'relevance',
        minPrice: '',
        maxPrice: ''
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Update internal filter when URL category changes
    useEffect(() => {
        if (urlCategory) {
            setFilters(prev => ({ ...prev, category: urlCategory }));
            setCurrentPage(1); // Reset to first page on category change
        }
    }, [urlCategory]);

    // Reset page when other filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters.searchTerm, filters.isVeg, filters.isPro, filters.sort, filters.minPrice, filters.maxPrice]);

    const filteredFood = useMemo(() => {
        let result = [...foodItems];

        if (filters.category !== 'All') {
            result = result.filter(item =>
                item.category.toLowerCase() === filters.category.toLowerCase() ||
                (filters.category === 'Veg Meal' && item.isVeg)
            );
        }

        if (filters.searchTerm) {
            result = result.filter(item =>
                item.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
            );
        }

        if (filters.isVeg) {
            result = result.filter(item => item.isVeg);
        }

        if (filters.minPrice) {
            result = result.filter(item => item.price >= Number(filters.minPrice));
        }

        if (filters.maxPrice) {
            result = result.filter(item => item.price <= Number(filters.maxPrice));
        }

        switch (filters.sort) {
            case 'price_low':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price_high':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                result.sort((a, b) => b.rating - a.rating);
                break;
            default:
                break;
        }

        return result;
    }, [filters, foodItems]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredFood.length / itemsPerPage);
    const paginatedFood = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredFood.slice(start, start + itemsPerPage);
    }, [filteredFood, currentPage]);

    const handleCategoryClick = (catName) => {
        navigate(`/menu/${catName}`);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div style={{ background: '#fcfcfc', minHeight: '100vh', paddingTop: '80px' }}>
            <main className="container" style={{ margin: '0 auto', paddingBottom: '60px' }}>

                {/* Top Section - Categories */}
                <InspirationCarousel setCategory={handleCategoryClick} />

                {/* Filters Section */}
                <div style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>
                            {filters.category === 'All' ? 'All Items' : filters.category} <span style={{ color: '#888', fontWeight: '400', fontSize: '16px' }}>({filteredFood.length})</span>
                        </h2>
                    </div>
                    <Filters filters={filters} setFilters={setFilters} />
                </div>

                {/* Food Grid */}
                <motion.div layout className="grid-container">
                    <AnimatePresence mode='popLayout'>
                        {paginatedFood.length > 0 ? (
                            paginatedFood.map(item => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    key={item.id}
                                >
                                    <FoodCard item={item} addToCart={addToCart} cart={cart} decreaseQuantity={decreaseQuantity} />
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px', color: '#888' }}
                            >
                                <img src="https://cdni.iconscout.com/illustration/premium/thumb/sorry-item-not-found-3328225-2809510.png" alt="Not found" style={{ width: '200px', marginBottom: '20px', opacity: 0.7 }} />
                                <h3>No food found.</h3>
                                <button
                                    onClick={() => setFilters({ ...filters, category: 'All' })}
                                    style={{ marginTop: '16px', padding: '8px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    View All Menu
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Pagination UI */}
                {totalPages > 1 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: '50px',
                        gap: '10px'
                    }}>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '50px',
                                border: '1px solid #e2e2e2',
                                background: 'white',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                opacity: currentPage === 1 ? 0.5 : 1,
                                fontWeight: '600',
                                color: '#3d4152'
                            }}
                        >
                            <i className="fa-solid fa-chevron-left"></i> Previous
                        </button>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => handlePageChange(i + 1)}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        border: currentPage === i + 1 ? 'none' : '1px solid #e2e2e2',
                                        background: currentPage === i + 1 ? 'var(--primary)' : 'white',
                                        color: currentPage === i + 1 ? 'white' : '#3d4152',
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '50px',
                                border: '1px solid #e2e2e2',
                                background: 'white',
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                opacity: currentPage === totalPages ? 0.5 : 1,
                                fontWeight: '600',
                                color: '#3d4152'
                            }}
                        >
                            Next <i className="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default Menu;
