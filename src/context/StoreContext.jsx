import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_STORE } from '../config/apiConfig';

const StoreContext = createContext();

export const useStore = () => {
    return useContext(StoreContext);
};

export const StoreProvider = ({ children }) => {
    const [storeSettings, setStoreSettings] = useState({
        storeName: 'Toasty Bites',
        contactEmail: '',
        contactPhone: '',
        upiId: '',
        printerType: 'thermal',
        heroTitle: 'Experience The Taste of Italy',
        heroSubtitle: 'We provide the best food delivery service with a wide variety of meals to choose from.',
        heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
        address: '',
        gstNo: '',
        fssaiNo: '',
        taxPercent: 5, // Default to 5%
        heroImages: [
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
            'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
            'https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80'
        ]
    });
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const res = await fetch(API_STORE);
            if (res.ok) {
                const data = await res.json();
                // Merge to ensure we don't lose fields if database record is old/partial
                setStoreSettings(prev => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error('Error fetching store settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (newSettings) => {
        try {
            const res = await fetch(API_STORE, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings)
            });
            if (res.ok) {
                const data = await res.json();
                // Merge to ensure we don't lose fields if backend response is partial
                setStoreSettings(prev => ({ ...prev, ...data }));
                return { success: true };
            } else {
                return { success: false, message: 'Failed to update' };
            }
        } catch (error) {
            console.error('Error updating store settings:', error);
            return { success: false, message: error.message };
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <StoreContext.Provider value={{ storeSettings, loading, updateSettings }}>
            {children}
        </StoreContext.Provider>
    );
};
