import React, { createContext, useContext, useState, useEffect } from 'react';
import { foodData as initialFoodData, categoryData as initialCategoryData } from '../data';
import {
    API_FOODS,
    API_FOOD_BY_ID,
    API_CATEGORIES,
    API_CATEGORY_BY_ID
} from '../config/apiConfig';

const FoodContext = createContext();

export const useFood = () => {
    return useContext(FoodContext);
};

export const FoodProvider = ({ children }) => {
    const [foodItems, setFoodItems] = useState(initialFoodData);

    const [categories, setCategories] = useState(initialCategoryData);

    // Fetch food items and categories
    useEffect(() => {
        const fetchData = async () => {
            try {
                const foodRes = await fetch(API_FOODS);
                const foodData = await foodRes.json();
                // Sort foods by category then name
                foodData.sort((a, b) => {
                    if (a.category === b.category) {
                        return a.name.localeCompare(b.name);
                    }
                    return a.category.localeCompare(b.category);
                });
                setFoodItems(foodData);

                const catRes = await fetch(API_CATEGORIES);
                const catData = await catRes.json();
                // Sort categories alphabetically
                catData.sort((a, b) => a.name.localeCompare(b.name));
                setCategories(catData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const addMenuItem = async (newItem) => {
        try {
            const res = await fetch(API_FOODS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            });
            const data = await res.json();
            const newItems = [...foodItems, data].sort((a, b) => {
                if (a.category === b.category) {
                    return a.name.localeCompare(b.name);
                }
                return a.category.localeCompare(b.category);
            });
            setFoodItems(newItems);
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

    const updateMenuItem = async (id, updatedItem) => {
        try {
            const res = await fetch(API_FOOD_BY_ID(id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedItem)
            });
            const data = await res.json();
            const updatedList = foodItems.map(item => item.id === id ? data : item).sort((a, b) => {
                if (a.category === b.category) {
                    return a.name.localeCompare(b.name);
                }
                return a.category.localeCompare(b.category);
            });
            setFoodItems(updatedList);
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };

    const deleteMenuItem = async (id) => {
        try {
            const res = await fetch(API_FOOD_BY_ID(id), {
                method: 'DELETE'
            });
            if (res.ok) {
                setFoodItems(foodItems.filter(item => item.id !== id));
                return { success: true };
            } else {
                const data = await res.json();
                return { success: false, message: data.message || 'Failed to delete item' };
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            return { success: false, message: 'Network error or server down' };
        }
    };

    const addCategory = async (newCategory) => {
        try {
            const res = await fetch(API_CATEGORIES, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCategory)
            });
            const data = await res.json();
            if (res.ok) {
                const newCategories = [...categories, data].sort((a, b) => a.name.localeCompare(b.name));
                setCategories(newCategories);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error adding category:', error);
            return false;
        }
    };

    const deleteCategory = async (id) => {
        try {
            const res = await fetch(API_CATEGORY_BY_ID(id), {
                method: 'DELETE'
            });
            if (res.ok) {
                setCategories(categories.filter(cat => cat._id !== id));
                return { success: true };
            } else {
                const data = await res.json();
                return { success: false, message: data.message || 'Failed to delete category' };
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            return { success: false, message: 'Network error or server down' };
        }
    };

    const updateCategory = async (id, updatedCategory) => {
        try {
            const res = await fetch(API_CATEGORY_BY_ID(id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCategory)
            });
            const data = await res.json();
            if (res.ok) {
                setCategories(categories.map(cat => cat._id === id ? data : cat));
                return { success: true };
            } else {
                return { success: false, message: data.message || 'Failed to update' };
            }
        } catch (error) {
            console.error('Error updating category:', error);
            return { success: false, message: 'Network error or server down' };
        }
    };

    const value = {
        foodItems,
        categories,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        addCategory,
        deleteCategory,
        updateCategory
    };

    return (
        <FoodContext.Provider value={value}>
            {children}
        </FoodContext.Provider>
    );
};
