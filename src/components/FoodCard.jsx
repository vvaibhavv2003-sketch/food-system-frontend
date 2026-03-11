import React from 'react';
import './FoodCard.css';

const FoodCard = ({ item, addToCart, cart, decreaseQuantity, imageFit = 'cover' }) => {

    const getQty = () => {
        if (!cart) return 0;
        const itemId = item.id || item._id;
        if (!itemId) return 0;
        return cart.filter(c => (c.id || c._id) === itemId).length;
    };

    const qty = getQty();

    return (
        <div className="food-card">
            <div className="food-card-image-box">
                <img src={item.image} alt={item.name} style={{ objectFit: imageFit }} />
                <span className="food-card-delivery-time">{item.deliveryTime}</span>
            </div>

            <div className="food-card-body">
                <div className="food-card-title-row">
                    <h3 className="food-card-name">{item.name}</h3>
                    <span className={item.isVeg ? 'badge veg' : 'badge non-veg'}>
                        {item.isVeg ? 'VEG' : 'NON-VEG'}
                    </span>
                </div>

                <div className="food-card-meta">
                    <span className="food-card-rating">
                        {item.rating} <i className="fa-solid fa-star" style={{ fontSize: '9px' }}></i>
                    </span>
                    <span>({item.votes} votes)</span>
                    <span>•</span>
                    <span>{item.category}</span>
                </div>

                <p className="food-card-description">{item.description}</p>

                <div className="food-card-footer">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.originalPrice && (
                            <span style={{ fontSize: '13px', textDecoration: 'line-through', color: '#999' }}>₹{item.originalPrice}</span>
                        )}
                        <span style={{ fontSize: '18px', fontWeight: '700', color: '#333' }}>₹{item.price}</span>
                    </div>

                    {qty === 0 ? (
                        <button
                            onClick={() => addToCart(item)}
                            style={{
                                background: 'white',
                                border: '1px solid var(--border-light)',
                                color: 'var(--primary)',
                                padding: '8px 24px',
                                borderRadius: '8px',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'var(--primary)';
                                e.target.style.color = 'white';
                                e.target.style.borderColor = 'var(--primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'white';
                                e.target.style.color = 'var(--primary)';
                                e.target.style.borderColor = 'var(--border-light)';
                            }}
                        >
                            Add
                        </button>
                    ) : (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0',
                            background: 'white',
                            border: '1px solid var(--primary)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}>
                            <button
                                onClick={() => decreaseQuantity(item)}
                                style={{
                                    border: 'none',
                                    background: 'white',
                                    color: 'var(--primary)',
                                    padding: '8px 12px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={e => e.target.style.background = '#f0f0f0'}
                                onMouseLeave={e => e.target.style.background = 'white'}
                            >-</button>
                            <span style={{
                                fontWeight: '700',
                                fontSize: '14px',
                                color: 'var(--primary)',
                                minWidth: '20px',
                                textAlign: 'center'
                            }}>{qty}</span>
                            <button
                                onClick={() => addToCart(item)}
                                style={{
                                    border: 'none',
                                    background: 'white',
                                    color: 'var(--primary)',
                                    padding: '8px 12px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={e => e.target.style.background = '#f0f0f0'}
                                onMouseLeave={e => e.target.style.background = 'white'}
                            >+</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FoodCard;
