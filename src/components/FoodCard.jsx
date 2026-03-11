import React from 'react';

const FoodCard = ({ item, addToCart, cart, decreaseQuantity, imageFit = 'cover' }) => {

    // Calculate quantity safely
    // Calculate quantity safely
    const getQty = () => {
        if (!cart) return 0;
        const itemId = item.id || item._id;
        if (!itemId) return 0;
        return cart.filter(c => (c.id || c._id) === itemId).length;
    };

    const qty = getQty();

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
        >
            <div className="image-box" style={{ height: '180px', position: 'relative' }}>
                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: imageFit }} />
                <span style={{
                    position: 'absolute', bottom: '10px', left: '10px',
                    background: 'white', padding: '2px 8px', borderRadius: '4px',
                    fontWeight: '700', fontSize: '12px', color: '#333',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                    {item.deliveryTime}
                </span>
            </div>

            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{item.name}</h3>
                    <span className={item.isVeg ? 'badge veg' : 'badge non-veg'}>
                        {item.isVeg ? 'VEG' : 'NON-VEG'}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '12px', fontSize: '13px', color: '#555' }}>
                    <span style={{
                        background: '#26a541', color: 'white', padding: '1px 5px',
                        borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: '700', fontSize: '11px'
                    }}>
                        {item.rating} <i className="fa-solid fa-star" style={{ fontSize: '9px' }}></i>
                    </span>
                    <span>({item.votes} votes)</span>
                    <span>•</span>
                    <span>{item.category}</span>
                </div>

                <p style={{ fontSize: '13px', color: '#777', marginBottom: '16px', lineHeight: '1.5', flex: 1 }}>
                    {item.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
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
