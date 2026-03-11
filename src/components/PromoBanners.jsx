
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOffers } from '../context/OfferContext';
import { useNavigate } from 'react-router-dom';

const TypewriterText = ({ text }) => {
    const [isVisible, setIsVisible] = useState(true);

    React.useEffect(() => {
        let timeout;
        if (isVisible) {
            timeout = setTimeout(() => {
                setIsVisible(false);
            }, 5000);
        } else {
            timeout = setTimeout(() => {
                setIsVisible(true);
            }, 2500);
        }
        return () => clearTimeout(timeout);
    }, [isVisible]);

    return (
        <motion.h2
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={{
                visible: {
                    transition: { staggerChildren: 0.1 }
                },
                hidden: {
                    transition: { staggerChildren: 0.05, staggerDirection: -1 }
                }
            }}
            style={{ fontSize: '28px', fontWeight: '800', color: '#333', margin: 0, lineHeight: 1 }}
        >
            {text.split("").map((char, index) => (
                <motion.span
                    key={index}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1 }
                    }}
                    transition={{ duration: 0 }}
                    style={{ color: (text.indexOf('Toasty Bites') !== -1 && index >= text.indexOf('Toasty Bites')) ? 'var(--primary)' : 'inherit' }}
                >
                    {char}
                </motion.span>
            ))}
        </motion.h2>
    );
};

const PromoBanners = () => {
    const { offers } = useOffers();
    const navigate = useNavigate();

    // Default static offers matching the User's Screenshot
    const defaultOffers = [
        {
            _id: 'pizza-bumper',
            title: 'Pizza',
            subtitle: 'Bumper Offers',
            image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            discount: 30
        },
        {
            _id: 'combo-offer',
            title: 'Combo Offers',
            subtitle: 'Limited Offer',
            image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            discount: 40
        },
        {
            _id: 'burger-combo',
            title: 'Burger Combo',
            subtitle: 'Limited Offer',
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            discount: 26
        }
    ];

    // Merge Database Offers with Defaults
    let displayOffers = [...defaultOffers];

    if (offers && offers.length > 0) {
        offers.forEach(dbOffer => {
            if (dbOffer.isActive === false) return;

            // Check if this DB offer is an "override" for a default one (by title check)
            const existingIndex = displayOffers.findIndex(def =>
                def.title.toLowerCase() === dbOffer.title.toLowerCase() ||
                def._id === dbOffer._id
            );

            if (existingIndex !== -1) {
                displayOffers[existingIndex] = dbOffer;
            } else {
                displayOffers.push(dbOffer);
            }
        });
    }

    const handleOfferClick = (offerId) => {
        navigate(`/offers/${offerId}`);
    };

    return (
        <section style={{ padding: '40px 0 80px 0', background: '#fcfcfc' }}>
            <div className="container">

                {/* Animated Heading */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '60px',
                    background: 'white',
                    padding: '10px 40px',
                    borderRadius: '50px',
                    boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
                    width: 'fit-content',
                    margin: '0 auto 60px auto'
                }}>
                    <TypewriterText text="New Best Offers in Toasty Bites.." />
                </div>

                {/* Cards Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '40px',
                    paddingTop: '40px'
                }}>
                    <AnimatePresence mode="wait">
                        {displayOffers.map((item, index) => (
                            <motion.div
                                key={item._id || index}
                                onClick={() => handleOfferClick(item._id)}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                whileHover={{ translateY: -10, cursor: 'pointer' }}
                                style={{
                                    background: 'white',
                                    borderRadius: '30px',
                                    padding: '0 20px 30px 20px',
                                    textAlign: 'center',
                                    boxShadow: '0 15px 40px rgba(0,0,0,0.08)',
                                    position: 'relative',
                                    marginTop: '100px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}
                            >
                                {/* Floating Image */}
                                <div style={{
                                    width: '240px',
                                    height: '240px',
                                    borderRadius: '50%',
                                    marginTop: '-120px',
                                    marginBottom: '20px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                                    overflow: 'hidden',
                                    border: '6px solid white',
                                    position: 'relative',
                                    zIndex: 2,
                                    background: '#eee'
                                }}>
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>

                                {/* Content */}
                                <h3 style={{
                                    fontFamily: '"Playfair Display", serif',
                                    fontSize: '22px',
                                    fontWeight: '800',
                                    color: '#2d3436',
                                    marginBottom: '15px'
                                }}>
                                    {item.title}
                                </h3>

                                <p style={{
                                    fontSize: '14px',
                                    color: '#636e72',
                                    lineHeight: '1.6',
                                    fontStyle: 'italic',
                                    marginBottom: '20px',
                                    flex: 1
                                }}>
                                    "{item.subtitle || 'Special offer just for you'}"
                                </p>

                                <div style={{
                                    marginTop: 'auto',
                                    fontSize: '20px',
                                    fontWeight: '800',
                                    color: 'var(--primary)'
                                }}>
                                    {item.discount > 0 ? `${item.discount}% OFF` : 'Special Deal'}
                                </div>

                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

export default PromoBanners;
