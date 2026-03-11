import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    API_ORDERS,
    API_ORDER_STATUS,
    API_ORDERS_BY_USER
} from '../config/apiConfig';

const OrderContext = createContext();

export const useOrders = () => {
    return useContext(OrderContext);
};

export const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch(API_ORDERS);
            const data = await res.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const placeOrder = async (orderData) => {
        try {
            const res = await fetch(API_ORDERS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            const newOrder = await res.json();
            setOrders([newOrder, ...orders]);
            // Trigger refresh event for Home page
            window.dispatchEvent(new Event('orderPlaced'));
            return newOrder;
        } catch (error) {
            console.error('Error placing order:', error);
        }
    };

    const resetOrders = async () => {
        try {
            await fetch(API_ORDERS, { method: 'DELETE' });
            setOrders([]);
        } catch (error) {
            console.error('Error resetting orders:', error);
        }
    };

    const updateOrderStatus = async (id, status) => {
        try {
            const res = await fetch(API_ORDER_STATUS(id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                const updatedOrder = await res.json();
                setOrders(orders.map(order => order._id === id ? updatedOrder : order));
                return { success: true };
            } else {
                return { success: false, message: 'Failed to update' };
            }
        } catch (error) {
            console.error('Error updating status:', error);
            return { success: false, message: error.message };
        }
    };

    const fetchUserOrders = async (userId) => {
        try {
            const res = await fetch(API_ORDERS_BY_USER(userId));
            const data = await res.json();
            return data;
        } catch (error) {
            console.error('Error fetching user orders:', error);
            return [];
        }
    };

    const value = {
        orders,
        placeOrder,
        resetOrders,
        fetchOrders,
        updateOrderStatus,
        fetchUserOrders
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};
