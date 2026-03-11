import React from 'react';
import { motion } from 'framer-motion';

import { useFood } from '../context/FoodContext';

const InspirationCarousel = ({ setCategory }) => {
    const { categories } = useFood();
    return (
        <section style={{ padding: '30px 0' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#1c1c1c' }}>
                Inspiration for your first order
            </h3>
            <div
                style={{
                    display: 'flex',
                    gap: '40px',
                    overflowX: 'auto',
                    padding: '10px 10px 20px 10px',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'var(--primary) #eee'
                }}
                className="custom-scrollbar"
            >
                {categories.map((cat, index) => (
                    <motion.div
                        key={cat.name}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCategory(cat.name)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            minWidth: '120px'
                        }}
                    >
                        <div style={{
                            width: '140px',
                            height: '140px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            marginBottom: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                            <img
                                src={cat.image}
                                alt={cat.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <span style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#3d4152'
                        }}>
                            {cat.name}
                        </span>
                    </motion.div>
                ))}
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--primary);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #d32f2f;
                }
                @media (max-width: 768px) {
                    .custom-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .custom-scrollbar {
                        scrollbar-width: none;
                    }
                }
            `}</style>
        </section>
    );
};

export default InspirationCarousel;
