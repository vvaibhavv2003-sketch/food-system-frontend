import React from 'react';
import { motion } from 'framer-motion';

const features = [
    {
        id: 1,
        title: 'Fresh Ingredients',
        desc: 'We use the freshest ingredients sourced locally for the best taste.',
        icon: 'https://cdn-icons-png.flaticon.com/512/2921/2921822.png' // Leaf/Fresh icon
    },
    {
        id: 2,
        title: 'Fast Delivery',
        desc: 'Hot food delivered to your doorstep within 30 minutes.',
        icon: 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png' // Scooter icon
    },
    {
        id: 3,
        title: 'Quality Chefs',
        desc: 'Dishes prepared by experienced chefs with passion and care.',
        icon: 'https://cdn-icons-png.flaticon.com/512/1830/1830839.png' // Chef Hat icon
    }
];

const FeaturesSection = () => {
    return (
        <section style={{ padding: 'var(--section-spacing) 0', background: 'white' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: '50px', flexWrap: 'wrap' }}>
                {features.map((feature, index) => (
                    <motion.div
                        key={feature.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                        viewport={{ once: true }}
                        style={{
                            textAlign: 'center',
                            maxWidth: '300px',
                            padding: '20px'
                        }}
                    >
                        <div style={{
                            width: '80px', height: '80px', margin: '0 auto 20px',
                            background: '#FFF5F5', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <img src={feature.icon} alt={feature.title} style={{ width: '40px', opacity: 0.8 }} />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>{feature.title}</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{feature.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default FeaturesSection;
