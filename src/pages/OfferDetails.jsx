import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FoodCard from '../components/FoodCard';
import { useFood } from '../context/FoodContext';
import { useOffers } from '../context/OfferContext';

const OfferDetails = ({ addToCart, cart, decreaseQuantity }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { foodItems } = useFood();
    const { offers } = useOffers();

    const [offerTitle, setOfferTitle] = useState('');
    const [offerSubtitle, setOfferSubtitle] = useState('');
    const [filteredItems, setFilteredItems] = useState([]);

    useEffect(() => {
        let title = "";
        let subtitle = "";
        let specificItems = [];

        // 1. First, find a potential dynamic offer that matches this ID or has a similar title
        const dynamicOffer = offers.find(o => o._id === id);

        // 2. Handle Logic
        if (dynamicOffer) {
            title = dynamicOffer.title;
            subtitle = dynamicOffer.subtitle || dynamicOffer.description || "Exclusive Deal";

            if (dynamicOffer.items && dynamicOffer.items.length > 0) {
                specificItems = dynamicOffer.items.map(item => ({
                    ...item,
                    _id: item._id || Math.random().toString(36),
                    id: item._id || Math.random().toString(36),
                    category: 'Offer Item',
                    rating: 4.5,
                    votes: 120,
                    deliveryTime: '25-35 min'
                }));
            } else {
                // Fallback to menu filtering
                const keyword = dynamicOffer.title.toLowerCase();
                specificItems = foodItems.filter(i =>
                    i.category.toLowerCase().includes(keyword) ||
                    i.name.toLowerCase().includes(keyword)
                );
            }
        }
        // 3. Fallback for Static IDs if no dynamic offer matches ID directly
        else if (id === 'pizza-bumper') {
            title = "🍕 Pizza Bumper Offers";
            subtitle = "Hot & Cheesy Pizzas at 30% OFF!";
            specificItems = foodItems.filter(i => i.category === 'Pizza');
        } else if (id === 'combo-offer') {
            title = "🍱 Super Combo Offers";
            subtitle = "Best of both worlds - Meals & Drinks!";

            // Check if user created a dynamic "Combo Offers" in DB
            const dbCombo = offers.find(o => o.title.toLowerCase().includes('combo'));
            if (dbCombo && dbCombo.items && dbCombo.items.length > 0) {
                specificItems = dbCombo.items.map(item => ({ ...item, id: item._id, category: 'Offer Item', rating: 4.8, votes: 150 }));
            } else {
                specificItems = foodItems.filter(i => i.category === 'Combo');
            }
        } else if (id === 'burger-combo') {
            title = "🍔 Burger Bonanza";
            subtitle = "Juicy Burgers with crispy fries.";
            specificItems = foodItems.filter(i => i.category === 'Burger');
        }

        setOfferTitle(title || "Special Offer");
        setOfferSubtitle(subtitle || "Limited time deals selected for you.");
        setFilteredItems(specificItems);

    }, [id, offers, foodItems]);

    return (
        <div style={{ padding: '100px 0 60px 0', minHeight: '100vh', background: '#f8f9fa' }}>
            <div className="container">
                <button
                    onClick={() => navigate('/')}
                    style={{
                        marginBottom: '20px',
                        padding: '10px 20px',
                        border: 'none',
                        background: '#e9ecef',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        color: '#495057'
                    }}
                >
                    <i className="fa-solid fa-arrow-left"></i> Back to Home
                </button>

                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#2d3436' }}>{offerTitle}</h1>
                    <p style={{ color: '#888', maxWidth: '600px', margin: '10px auto', fontSize: '18px' }}>
                        {offerSubtitle}
                    </p>
                </div>

                {filteredItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
                        <h3>No specific items found for this offer right now.</h3>
                        <p>Check back later or explore our full menu!</p>
                        <button onClick={() => navigate('/menu')} className="btn-primary" style={{ marginTop: '20px', padding: '10px 20px' }}>
                            View Full Menu
                        </button>
                    </div>
                ) : (
                    <div className="grid-container">
                        {filteredItems.map(item => (
                            <FoodCard key={item.id} item={item} addToCart={addToCart} cart={cart} decreaseQuantity={decreaseQuantity} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OfferDetails;
