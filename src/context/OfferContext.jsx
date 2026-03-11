import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_OFFERS, API_OFFER_BY_ID } from '../config/apiConfig';

const OfferContext = createContext();

export const useOffers = () => {
    return useContext(OfferContext);
};

export const OfferProvider = ({ children }) => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOffers = async () => {
        try {
            const res = await fetch(API_OFFERS);
            if (res.ok) {
                const data = await res.json();
                setOffers(data);
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
        } finally {
            setLoading(false);
        }
    };

    const addOffer = async (offerData) => {
        try {
            const res = await fetch(API_OFFERS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(offerData)
            });
            if (res.ok) {
                const newOffer = await res.json();
                setOffers([...offers, newOffer]);
                return { success: true };
            }
            return { success: false, message: 'Failed to add' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const updateOffer = async (id, offerData) => {
        try {
            const res = await fetch(API_OFFER_BY_ID(id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(offerData)
            });
            if (res.ok) {
                const updatedOffer = await res.json();
                setOffers(offers.map(o => o._id === id ? updatedOffer : o));
                return { success: true };
            }
            return { success: false, message: 'Failed to update' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const deleteOffer = async (id) => {
        try {
            const res = await fetch(API_OFFER_BY_ID(id), {
                method: 'DELETE'
            });
            if (res.ok) {
                setOffers(offers.filter(o => o._id !== id));
                return { success: true };
            }
            return { success: false, message: 'Failed to delete' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    return (
        <OfferContext.Provider value={{ offers, loading, addOffer, updateOffer, deleteOffer }}>
            {children}
        </OfferContext.Provider>
    );
};
