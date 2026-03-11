// ============================================================
// API Configuration - Central URL Management
// ============================================================
// All API base URLs and endpoint paths are defined here.
// To change the server address, update BASE_URL once below.
// ============================================================

// Base URL for your backend server
// export const BASE_URL = 'http://localhost:5000';https://food-system-backend-vimt.onrender.com/
export const BASE_URL = 'https://food-system-backend-vimt.onrender.com';
// -------------------------------------------------------
// Auth Endpoints
// -------------------------------------------------------
export const API_AUTH_LOGIN = `${BASE_URL}/api/auth/login`;
export const API_AUTH_REGISTER = `${BASE_URL}/api/auth/register`;
export const API_AUTH_VERIFY_OTP = `${BASE_URL}/api/auth/verify-otp`;
export const API_AUTH_FORGOT_PASSWORD = `${BASE_URL}/api/auth/forgot-password`;
export const API_AUTH_RESET_PASSWORD = `${BASE_URL}/api/auth/reset-password`;
export const API_AUTH_PROFILE = `${BASE_URL}/api/auth/profile`;

// -------------------------------------------------------
// Food & Category Endpoints
// -------------------------------------------------------
export const API_FOODS = `${BASE_URL}/api/foods`;
export const API_FOOD_BY_ID = (id) => `${BASE_URL}/api/foods/${id}`;
export const API_CATEGORIES = `${BASE_URL}/api/categories`;
export const API_CATEGORY_BY_ID = (id) => `${BASE_URL}/api/categories/${id}`;

// -------------------------------------------------------
// Orders Endpoints
// -------------------------------------------------------
export const API_ORDERS = `${BASE_URL}/api/orders`;
export const API_ORDER_BY_ID = (id) => `${BASE_URL}/api/orders/${id}`;
export const API_ORDER_STATUS = (id) => `${BASE_URL}/api/orders/${id}/status`;
export const API_ORDERS_BY_USER = (userId) => `${BASE_URL}/api/orders?user=${userId}`;

// -------------------------------------------------------
// Bookings Endpoints
// -------------------------------------------------------
export const API_BOOKINGS = `${BASE_URL}/api/bookings`;
export const API_BOOKINGS_STATUS = (date) => `${BASE_URL}/api/bookings/status?date=${date}`;
export const API_BOOKING_STATUS_TABLE = (tableNumber) => `${BASE_URL}/api/bookings/status/${tableNumber}`;

// -------------------------------------------------------
// Offers Endpoints
// -------------------------------------------------------
export const API_OFFERS = `${BASE_URL}/api/offers`;
export const API_OFFER_BY_ID = (id) => `${BASE_URL}/api/offers/${id}`;

// -------------------------------------------------------
// Newsletter Endpoints
// -------------------------------------------------------
export const API_NEWSLETTER_SUBSCRIBE = `${BASE_URL}/api/newsletter/subscribe`;
export const API_NEWSLETTER_UPDATE_SUMMARY = `${BASE_URL}/api/newsletter/update-summary`;
export const API_NEWSLETTER_BROADCAST = `${BASE_URL}/api/newsletter/broadcast`;

// -------------------------------------------------------
// Store / Upload Endpoints
// -------------------------------------------------------
export const API_STORE = `${BASE_URL}/api/store`;
export const API_UPLOAD = `${BASE_URL}/api/upload`;

// -------------------------------------------------------
// Third-Party / External URLs
// -------------------------------------------------------
export const API_NOMINATIM_REVERSE = (lat, lon) =>
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
