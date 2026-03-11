import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';

const Hero = () => {
    const { storeSettings } = useStore();
    const [currentImage, setCurrentImage] = useState(0);

    // Default images if none in settings (fallback)
    const images = (storeSettings.heroImages && storeSettings.heroImages.length > 0)
        ? storeSettings.heroImages
        : [storeSettings.heroImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80'];

    useEffect(() => {
        if (images.length > 1) {
            const interval = setInterval(() => {
                setCurrentImage(prev => (prev + 1) % images.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [images]);

    return (
        <section style={{
            position: 'relative',
            height: '90vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            background: 'black' // Fallback color
        }}>
            {/* Background Slider */}
            <AnimatePresence initial={false}>
                <motion.div
                    key={currentImage}
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${images[currentImage]})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        zIndex: 1
                    }}
                />
            </AnimatePresence>

            {/* Dark Overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2 }}></div>

            <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '800px' }}>
                <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        color: 'var(--primary)',
                        fontWeight: '700',
                        letterSpacing: '4px',
                        textTransform: 'uppercase',
                        fontSize: '14px',
                        marginBottom: '20px',
                        background: 'rgba(255,255,255,0.9)',
                        display: 'inline-block',
                        padding: '8px 16px',
                        borderRadius: '4px'
                    }}
                >
                    Premium Food Delivery
                </motion.span>

                <motion.h1
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                    style={{
                        fontSize: '4.5rem',
                        lineHeight: '1.1',
                        fontWeight: '800',
                        marginBottom: '32px',
                        textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        color: 'white' // Forced white as requested
                    }}
                >
                    <span style={{ color: '#ff4757' }}>{storeSettings.heroTitle ? storeSettings.heroTitle.charAt(0) : ''}</span>
                    {storeSettings.heroTitle ? storeSettings.heroTitle.slice(1) : ''}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                    style={{
                        fontSize: '1.2rem',
                        color: '#f0f0f0', // Already white/light
                        marginBottom: '40px',
                        lineHeight: '1.6',
                        maxWidth: '600px',
                        margin: '0 auto 40px'
                    }}
                >
                    {storeSettings.heroSubtitle}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="hero-buttons"
                >
                    <a href="#menu" className="btn-primary hero-btn">
                        Order Now
                    </a>
                    <a href="#reservation" className="hero-btn hero-btn-outline">
                        Book a Table
                    </a>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
