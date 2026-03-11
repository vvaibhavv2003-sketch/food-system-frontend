import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Filters = ({ filters, setFilters }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '32px',
            flexWrap: 'nowrap',
            position: 'sticky',
            top: '0',
            background: 'var(--bg-body)',
            padding: '20px 10px', // Added 10px horizontal padding
            zIndex: 10,
            alignItems: 'center',
            overflowX: 'auto',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            minHeight: '60px' // Ensure minimum height
        }}>
            <FilterButton
                active={isOpen}
                icon={<FilterIcon />}
                label="Filters"
                onClick={() => setIsOpen(!isOpen)}
                showChevron={false}
            />

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        style={{ display: 'flex', gap: '12px', alignItems: 'center', whiteSpace: 'nowrap', padding: '0 5px' }} // Added horizontal padding to prevent border clipping
                    >
                        <FilterButton
                            active={filters.isPro}
                            label="Pro"
                            onClick={() => setFilters({ ...filters, isPro: !filters.isPro })}
                        />

                        <FilterButton
                            active={filters.isVeg}
                            label="Pure Veg"
                            onClick={() => setFilters({ ...filters, isVeg: !filters.isVeg })}
                        />

                        {/* Manual Price Range */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'white',
                            padding: '4px 12px',
                            borderRadius: '50px',
                            border: '1px solid #e2e2e2',
                        }}>
                            <span style={{ fontSize: '13px', color: '#666', fontWeight: '600' }}>Price:</span>
                            <input
                                type="number"
                                placeholder="Min"
                                value={filters.minPrice}
                                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                style={{
                                    width: '50px',
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '13px',
                                    background: 'transparent'
                                }}
                            />
                            <span style={{ color: '#ccc' }}>-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                style={{
                                    width: '50px',
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '13px',
                                    background: 'transparent'
                                }}
                            />
                            {(filters.minPrice || filters.maxPrice) && (
                                <span
                                    onClick={() => setFilters({ ...filters, minPrice: '', maxPrice: '' })}
                                    style={{ cursor: 'pointer', fontSize: '12px', color: 'var(--primary)', fontWeight: 'bold' }}
                                >
                                    ✖
                                </span>
                            )}
                        </div>

                        <select
                            value={filters.sort}
                            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '50px',
                                border: '1px solid #e2e2e2',
                                background: 'white',
                                color: '#3d4152',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                        >
                            <option value="relevance">Relevance</option>
                            <option value="rating">Rating: High to Low</option>
                            <option value="price_low">Cost: Low to High</option>
                            <option value="price_high">Cost: High to Low</option>
                        </select>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FilterButton = ({ label, active, onClick, icon, showChevron = true }) => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        style={{
            padding: '8px 20px',
            borderRadius: '50px',
            border: active ? '1px solid var(--primary)' : '1px solid #e2e2e2',
            background: active ? 'rgba(255, 82, 0, 0.05)' : 'white',
            color: active ? 'var(--primary)' : '#3d4152',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            whiteSpace: 'nowrap',
            transition: 'all 0.3s ease'
        }}
    >
        {icon}
        {label}
        {showChevron && active && <span style={{ fontSize: '10px' }}>✖</span>}
    </motion.button>
);

const FilterIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="21" x2="4" y2="14"></line>
        <line x1="4" y1="10" x2="4" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12" y2="3"></line>
        <line x1="20" y1="21" x2="20" y2="16"></line>
        <line x1="20" y1="12" x2="20" y2="3"></line>
        <line x1="1" y1="14" x2="7" y2="14"></line>
        <line x1="9" y1="8" x2="15" y2="8"></line>
        <line x1="17" y1="16" x2="23" y2="16"></line>
    </svg>
);

export default Filters;
