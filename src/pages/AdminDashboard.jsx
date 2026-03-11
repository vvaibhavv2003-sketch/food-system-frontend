import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFood } from '../context/FoodContext';
import { useOrders } from '../context/OrderContext';
import { useStore } from '../context/StoreContext';
import { useOffers } from '../context/OfferContext';
import AdminAnalytics from './AdminAnalytics';
import {
    API_UPLOAD,
    BASE_URL,
    API_NEWSLETTER_UPDATE_SUMMARY,
    API_NEWSLETTER_BROADCAST,
    API_BOOKINGS_STATUS,
    API_BOOKING_STATUS_TABLE
} from '../config/apiConfig';

const PAGINATION_LIMIT_ORDERS = 10;
const PAGINATION_LIMIT_FOOD = 10;

const handleFileUpload = async (e, setUrlCallback) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(API_UPLOAD, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.success) {
            const fullUrl = data.filePath.startsWith('http') ? data.filePath : `${BASE_URL}${data.filePath}`;
            setUrlCallback(fullUrl);
        } else {
            alert('Upload failed: ' + data.message);
            setUrlCallback(null); // Signal failure
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error uploading file');
        setUrlCallback(null);
    }
};


const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const { foodItems, categories, addMenuItem, updateMenuItem, deleteMenuItem, addCategory, deleteCategory, updateCategory } = useFood();
    const { orders, resetOrders, updateOrderStatus } = useOrders();
    const { storeSettings, updateSettings } = useStore();
    const { offers, addOffer, updateOffer, deleteOffer } = useOffers();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('menu');
    const [openMenus, setOpenMenus] = useState({ menu: true, settings: false });
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: 'Pizza',
        price: '',
        image: '',
        description: '',
        isVeg: true,
        rating: 4.5,
        deliveryTime: '30-40 min'
    });

    // Pagination State
    const [currentPageOrders, setCurrentPageOrders] = useState(1);
    const [currentPageFoodItems, setCurrentPageFoodItems] = useState(1);
    const [searchTermFood, setSearchTermFood] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

    // Order Filters
    const [searchTermOrder, setSearchTermOrder] = useState('');
    const [filterOrderStatus, setFilterOrderStatus] = useState('All');

    const [printableOrder, setPrintableOrder] = useState(null);

    const isAdmin = user && (user.role?.toLowerCase() === 'admin' || user.isAdmin);

    if (!isAdmin) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '100px', padding: '40px', background: 'white', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔐</div>
                <h2>Access Denied</h2>
                <p style={{ color: '#666', marginBottom: '30px' }}>You do not have permission to view the Admin Dashboard.</p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button onClick={() => navigate('/')} className="btn-primary" style={{ background: '#eee', color: '#333' }}>Back to Home</button>
                    {!user && <button onClick={() => navigate('/login')} className="btn-primary">Login as Admin</button>}
                </div>
            </div>
        );
    }

    const toggleMenu = (menu) => {
        setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: 'Pizza',
            price: '',
            image: '',
            description: '',
            isVeg: true,
            rating: 4.5,
            deliveryTime: '30-40 min'
        });
        setIsEditing(false);
        setCurrentId(null);
        setShowForm(false);
    };

    const handleEdit = (item) => {
        setFormData(item);
        setCurrentId(item.id);
        setIsEditing(true);
        setShowForm(true);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            await deleteMenuItem(id);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const itemData = { ...formData, price: Number(formData.price) };
        if (isEditing) {
            await updateMenuItem(currentId, itemData);
            alert('Item updated successfully!');
        } else {
            await addMenuItem(itemData);
            alert('Item added successfully!');
        }
        resetForm();
    };

    const handleResetOrders = async () => {
        if (window.confirm('WARNING: This will delete ALL orders history. Are you sure?')) {
            await resetOrders();
            alert('All orders have been reset.');
        }
    };

    const handlePrintOrder = (order) => {
        setPrintableOrder(order);
        setTimeout(() => {
            window.print();
            setPrintableOrder(null);
        }, 500);
    };

    const displayFoodItems = foodItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTermFood.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTermFood.toLowerCase());
        const matchesCategory = selectedCategoryFilter === 'All' || item.category === selectedCategoryFilter;
        return matchesSearch && matchesCategory;
    });

    const filteredOrders = orders.filter(order => {
        const matchesSearch = String(order._id).toLowerCase().includes(searchTermOrder.toLowerCase()) ||
            (order.tableNo && String(order.tableNo).toLowerCase().includes(searchTermOrder.toLowerCase()));
        const matchesStatus = filterOrderStatus === 'All' || order.status === filterOrderStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div style={{ width: '100%' }}>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#333', display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '10px' }} onClick={() => navigate('/')}>
                        <span style={{ color: 'var(--primary)' }}>Gourmet</span>
                        <span className="admin-logo-text" style={{ marginLeft: '5px' }}>Admin</span>
                    </div>

                    <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', marginBottom: '20px' }}>Management Menu</div>

                    <div className="admin-nav-links">
                        <div className={`admin-nav-link ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
                            <i className="fa-solid fa-chart-pie"></i> <span>Dashboard</span>
                        </div>
                        <div className={`admin-nav-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                            <i className="fa-solid fa-receipt"></i> <span>Orders</span>
                        </div>
                        <div className={`admin-nav-link ${(activeTab === 'menu' || activeTab === 'categories' || activeTab === 'offers') ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
                            <i className="fa-solid fa-utensils"></i> <span>Menu Management</span>
                        </div>
                        <div className={`admin-nav-link ${(activeTab === 'broadcast' || activeTab === 'subscriber-updates') ? 'active' : ''}`} onClick={() => setActiveTab('broadcast')}>
                            <i className="fa-solid fa-bullhorn"></i> <span>Marketing</span>
                        </div>
                        <div className={`admin-nav-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                            <i className="fa-solid fa-sliders"></i> <span>Store Settings</span>
                        </div>
                        <div className={`admin-nav-link ${activeTab === 'tables' ? 'active' : ''}`} onClick={() => setActiveTab('tables')}>
                            <i className="fa-solid fa-table"></i> <span>Table Management</span>
                        </div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 15px', background: '#f9f9f9', borderRadius: '12px', marginBottom: '10px' }}>
                        <div
                            style={{
                                width: '35px',
                                height: '35px',
                                borderRadius: '50%',
                                background: 'white',
                                border: '2px solid var(--primary)',
                                color: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold'
                            }}
                        >
                            {user.name.charAt(0)}
                        </div>
                        <div className="admin-logo-text">
                            <p style={{ margin: 0, fontWeight: '700', fontSize: '13px', color: '#333' }}>{user.name}</p>
                            <p style={{ margin: 0, fontSize: '10px', color: '#999' }}>Super Admin</p>
                        </div>
                    </div>
                    <div
                        onClick={logout}
                        className="admin-nav-link"
                        style={{ color: '#e74c3c' }}
                    >
                        <i className="fa-solid fa-right-from-bracket"></i> <span>Logout</span>
                    </div>
                </div>
            </aside>

            <div className="admin-main-container">
                {/* Sub Navbar for Menu Management */}
                {(activeTab === 'menu' || activeTab === 'categories' || activeTab === 'offers') && (
                    <div className="admin-sub-navbar">
                        <span className={`admin-sub-link ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>All Food Items</span>
                        <span className={`admin-sub-link ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>Categories</span>
                        <span className={`admin-sub-link ${activeTab === 'offers' ? 'active' : ''}`} onClick={() => setActiveTab('offers')}>Special Offers</span>
                    </div>
                )}

                {/* Sub Navbar for Marketing */}
                {(activeTab === 'broadcast' || activeTab === 'subscriber-updates') && (
                    <div className="admin-sub-navbar">
                        <span className={`admin-sub-link ${activeTab === 'broadcast' ? 'active' : ''}`} onClick={() => setActiveTab('broadcast')}>Email Broadcast</span>
                        <span className={`admin-sub-link ${activeTab === 'subscriber-updates' ? 'active' : ''}`} onClick={() => setActiveTab('subscriber-updates')}>Newsletter Summary</span>
                    </div>
                )}

                <main className="admin-main">
                    {activeTab === 'analytics' && <AdminAnalytics />}
                    {activeTab === 'categories' && <CategoryManager categories={categories} addCategory={addCategory} deleteCategory={deleteCategory} updateCategory={updateCategory} />}
                    {activeTab === 'settings' && <StoreSettingsManager storeSettings={storeSettings} updateSettings={updateSettings} />}
                    {activeTab === 'offers' && <OfferManager offers={offers} addOffer={addOffer} updateOffer={updateOffer} deleteOffer={deleteOffer} />}
                    {activeTab === 'subscriber-updates' && <SubscriberUpdateManager />}
                    {activeTab === 'broadcast' && <BroadcastManager />}
                    {activeTab === 'tables' && <BookingManager />}
                    {activeTab === 'orders' && (
                        <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <h3 style={{ margin: 0 }}>Recent Orders</h3>

                                    <div style={{ position: 'relative', width: '250px' }}>
                                        <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }}></i>
                                        <input
                                            type="text"
                                            placeholder="Search Order ID..."
                                            value={searchTermOrder}
                                            onChange={(e) => {
                                                setSearchTermOrder(e.target.value);
                                                setCurrentPageOrders(1);
                                            }}
                                            style={{ ...inputStyle, paddingLeft: '35px', borderRadius: '25px', background: '#f8f9fa' }}
                                        />
                                    </div>

                                    <select
                                        value={filterOrderStatus}
                                        onChange={(e) => {
                                            setFilterOrderStatus(e.target.value);
                                            setCurrentPageOrders(1);
                                        }}
                                        style={{ ...inputStyle, width: '150px', borderRadius: '25px', background: '#f8f9fa' }}
                                    >
                                        <option value="All">All Status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Preparing">Preparing</option>
                                        <option value="Out for Delivery">Out for Delivery</option>
                                        <option value="Delivered">Delivered</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleResetOrders}
                                    style={{
                                        background: '#e74c3c', color: 'white', padding: '10px 20px',
                                        border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
                                        display: 'flex', alignItems: 'center', gap: '8px'
                                    }}
                                >
                                    Reset All Orders 🗑️
                                </button>
                            </div>

                            {orders.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '50px', background: '#f9f9f9', borderRadius: '12px' }}>
                                    <p style={{ color: '#999', fontSize: '18px', marginBottom: '10px' }}>No active orders.</p>
                                    <p style={{ fontSize: '14px', color: '#ccc' }}>New orders will appear here instantly.</p>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'grid', gap: '20px' }}>
                                        {filteredOrders.slice((currentPageOrders - 1) * PAGINATION_LIMIT_ORDERS, currentPageOrders * PAGINATION_LIMIT_ORDERS).map((order) => (
                                            <div key={order._id} style={{
                                                border: '1px solid #eee', padding: '20px', borderRadius: '10px',
                                                background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                                                    <div>
                                                        <span style={{ fontWeight: 'bold', fontSize: '16px', display: 'block' }}>Order #{order._id.substring(order._id.length - 6)}</span>
                                                        <span style={{ fontSize: '12px', color: '#888' }}>{new Date(order.createdAt).toLocaleString()}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                        <button
                                                            onClick={() => handlePrintOrder(order)}
                                                            className="no-print"
                                                            style={{
                                                                background: 'none', border: 'none', cursor: 'pointer',
                                                                color: '#666', fontSize: '20px', display: 'flex',
                                                                alignItems: 'center', justifyContent: 'center',
                                                                transition: 'color 0.2s'
                                                            }}
                                                            onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
                                                            onMouseOut={(e) => e.currentTarget.style.color = '#666'}
                                                            title="Print Invoice"
                                                        >
                                                            <i className="fa-solid fa-print"></i>
                                                        </button>
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                            className="no-print"
                                                            style={{
                                                                padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                                                                background: order.status === 'Pending' ? '#fff3cd' : order.status === 'Delivered' ? '#d4edda' : '#e3f2fd',
                                                                color: order.status === 'Pending' ? '#856404' : order.status === 'Delivered' ? '#155724' : '#0c5460',
                                                                border: 'none', cursor: 'pointer', outline: 'none'
                                                            }}
                                                        >
                                                            {['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'].map(s => (
                                                                <option key={s} value={s}>{s}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div style={{ marginBottom: '15px' }}>
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', marginBottom: '8px', color: '#444' }}>
                                                            <span><span style={{ fontWeight: 'bold', marginRight: '10px' }}>{item.qty}x</span> {item.name}</span>
                                                            <span>₹{item.price}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '2px dashed #eee', fontWeight: 'bold', fontSize: '18px' }}>
                                                    <span>Total Amount</span>
                                                    <span style={{ color: 'var(--primary)' }}>₹{order.totalAmount}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {filteredOrders.length > PAGINATION_LIMIT_ORDERS && (
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '30px', padding: '15px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                            <button disabled={currentPageOrders === 1} onClick={() => setCurrentPageOrders(prev => prev - 1)} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: currentPageOrders === 1 ? '#f1f1f1' : 'var(--primary)', color: currentPageOrders === 1 ? '#aaa' : 'white', cursor: currentPageOrders === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold', transition: '0.2s' }}>Previous</button>
                                            <span style={{ padding: '8px 16px', fontWeight: 'bold', color: '#555' }}>Page {currentPageOrders} of {Math.ceil(filteredOrders.length / PAGINATION_LIMIT_ORDERS)}</span>
                                            <button disabled={currentPageOrders === Math.ceil(filteredOrders.length / PAGINATION_LIMIT_ORDERS)} onClick={() => setCurrentPageOrders(prev => prev + 1)} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: currentPageOrders === Math.ceil(filteredOrders.length / PAGINATION_LIMIT_ORDERS) ? '#f1f1f1' : 'var(--primary)', color: currentPageOrders === Math.ceil(filteredOrders.length / PAGINATION_LIMIT_ORDERS) ? '#aaa' : 'white', cursor: currentPageOrders === Math.ceil(filteredOrders.length / PAGINATION_LIMIT_ORDERS) ? 'not-allowed' : 'pointer', fontWeight: 'bold', transition: '0.2s' }}>Next</button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'menu' && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <h3>Menu Overview</h3>

                                <button
                                    onClick={() => { resetForm(); setShowForm(!showForm); }}
                                    style={{ padding: '8px 16px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    {showForm ? 'Cancel' : '+ Add New Item'}
                                </button>
                            </div>

                            {/* Quick Stats for Menu Tab */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid var(--primary)' }}>
                                    <h3 style={{ fontSize: '16px', color: '#888' }}>Total Items</h3>
                                    <p style={{ fontSize: '32px', fontWeight: '800', color: '#333' }}>{foodItems.length}</p>
                                </div>
                                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid var(--success)' }}>
                                    <h3 style={{ fontSize: '16px', color: '#888' }}>Categories</h3>
                                    <p style={{ fontSize: '32px', fontWeight: '800', color: '#333' }}>{[...new Set(foodItems.map(i => i.category))].length}</p>
                                </div>
                                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid #f39c12' }}>
                                    <h3 style={{ fontSize: '16px', color: '#888' }}>News Desk</h3>
                                    <p style={{ fontSize: '32px', fontWeight: '800', color: '#333' }}>Ready to Send ✉️</p>
                                </div>
                            </div>

                            {/* Add/Edit Form */}
                            {showForm && (
                                <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: 'var(--shadow-md)', marginBottom: '40px', animation: 'slideInDown 0.3s ease' }}>
                                    <h3 style={{ marginBottom: '20px' }}>{isEditing ? 'Edit Item' : 'Add New Item'}</h3>
                                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Item Name</label>
                                            <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Category</label>
                                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={inputStyle}>
                                                {categories.map(cat => (
                                                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Price (₹)</label>
                                            <input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} style={inputStyle} />
                                        </div>

                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Image</label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <input required type="url" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} style={inputStyle} placeholder="Image URL or Upload..." />
                                                <label style={{ padding: '10px 15px', background: '#e9ecef', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    Upload 📂
                                                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setFormData({ ...formData, image: url }))} style={{ display: 'none' }} />
                                                </label>
                                            </div>
                                        </div>

                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Description</label>
                                            <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ ...inputStyle, height: '80px' }} />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Is Vegetarian?</label>
                                            <input type="checkbox" checked={formData.isVeg} onChange={e => setFormData({ ...formData, isVeg: e.target.checked })} style={{ transform: 'scale(1.5)', marginLeft: '5px' }} />
                                        </div>

                                        <button type="submit" style={{ gridColumn: '1 / -1', padding: '15px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
                                            {isEditing ? 'Update Item' : 'Add Item'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Search and Top Pagination */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px', marginBottom: '20px', gap: '20px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                                    <h3 style={{ margin: 0, whiteSpace: 'nowrap' }}>All Menu Items</h3>
                                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                                        <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }}></i>
                                        <input
                                            type="text"
                                            placeholder="Search items or categories..."
                                            value={searchTermFood}
                                            onChange={(e) => {
                                                setSearchTermFood(e.target.value);
                                                setCurrentPageFoodItems(1);
                                            }}
                                            style={{ ...inputStyle, paddingLeft: '35px', borderRadius: '25px', background: '#f8f9fa' }}
                                        />
                                    </div>
                                    <select
                                        value={selectedCategoryFilter}
                                        onChange={(e) => {
                                            setSelectedCategoryFilter(e.target.value);
                                            setCurrentPageFoodItems(1);
                                        }}
                                        style={{ ...inputStyle, width: '150px', borderRadius: '25px', background: '#f8f9fa' }}
                                    >
                                        <option value="All">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat.name} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div style={{ background: 'white', borderRadius: '12px', overflowX: 'auto', boxShadow: 'var(--shadow-sm)' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f9f9f9', textAlign: 'left', fontSize: '14px', color: '#666' }}>
                                            <th style={{ padding: '15px' }}>Image</th>
                                            <th style={{ padding: '15px' }}>Name</th>
                                            <th style={{ padding: '15px' }}>Category</th>
                                            <th style={{ padding: '15px' }}>Price</th>
                                            <th style={{ padding: '15px' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayFoodItems
                                            .slice((currentPageFoodItems - 1) * PAGINATION_LIMIT_FOOD, currentPageFoodItems * PAGINATION_LIMIT_FOOD)
                                            .map(item => (
                                                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '15px' }}>
                                                        <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                                                    </td>
                                                    <td style={{ padding: '15px' }}>
                                                        <p style={{ fontWeight: 'bold' }}>{item.name}</p>
                                                        <p style={{ fontSize: '12px', color: '#888' }}>{item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}</p>
                                                    </td>
                                                    <td style={{ padding: '15px' }}>
                                                        <span style={{ background: '#eee', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{item.category}</span>
                                                    </td>
                                                    <td style={{ padding: '15px', fontWeight: 'bold' }}>₹{item.price}</td>
                                                    <td style={{ padding: '15px' }}>
                                                        <button onClick={() => handleEdit(item)} style={{ marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'orange', fontSize: '18px' }} title="Edit">
                                                            <i className="fa-solid fa-pen-to-square"></i>
                                                        </button>
                                                        <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red', fontSize: '18px' }} title="Delete">
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>

                                {displayFoodItems.length > PAGINATION_LIMIT_FOOD && (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', padding: '20px', background: '#f9f9f9', borderTop: '1px solid #eee' }}>
                                        <button
                                            disabled={currentPageFoodItems === 1}
                                            onClick={() => {
                                                setCurrentPageFoodItems(prev => prev - 1);
                                                window.scrollTo({ top: 800, behavior: 'smooth' });
                                            }}
                                            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: currentPageFoodItems === 1 ? '#e0e0e0' : 'var(--primary)', color: currentPageFoodItems === 1 ? '#888' : 'white', cursor: currentPageFoodItems === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold', transition: '0.2s' }}
                                        >Previous</button>
                                        <span style={{ padding: '8px 16px', fontWeight: 'bold', color: '#555' }}>
                                            Page {currentPageFoodItems} of {Math.ceil(displayFoodItems.length / PAGINATION_LIMIT_FOOD)}
                                        </span>
                                        <button
                                            disabled={currentPageFoodItems === Math.ceil(displayFoodItems.length / PAGINATION_LIMIT_FOOD)}
                                            onClick={() => {
                                                setCurrentPageFoodItems(prev => prev + 1);
                                                window.scrollTo({ top: 800, behavior: 'smooth' });
                                            }}
                                            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: currentPageFoodItems === Math.ceil(displayFoodItems.length / PAGINATION_LIMIT_FOOD) ? '#e0e0e0' : 'var(--primary)', color: currentPageFoodItems === Math.ceil(displayFoodItems.length / PAGINATION_LIMIT_FOOD) ? '#888' : 'white', cursor: currentPageFoodItems === Math.ceil(displayFoodItems.length / PAGINATION_LIMIT_FOOD) ? 'not-allowed' : 'pointer', fontWeight: 'bold', transition: '0.2s' }}
                                        >Next</button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </main>

                {/* Hidden Printable Invoice */}
                {printableOrder && (
                    <div id="printable-invoice">
                        {storeSettings.printerType === 'thermal' ? (
                            /* THERMAL RECEIPT DESIGN (Matches User Image) */
                            <div style={{
                                fontFamily: "'Courier New', Courier, monospace",
                                width: '40%',
                                maxWidth: '600px',
                                margin: '0 auto',
                                fontSize: '12px',
                                color: '#000',
                                backgroundColor: '#fff',
                                padding: '20px'
                            }}>
                                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                                    <h2 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase' }}>{storeSettings?.storeName || 'Store Name'}</h2>
                                    {storeSettings.address && <p style={{ margin: '0 0 2px 0', fontSize: '18px', whiteSpace: 'pre-line' }}>{storeSettings.address}</p>}
                                    {storeSettings.gstNo && <p style={{ margin: '0 0 2px 0', fontSize: '18px', fontWeight: 'bold' }}>GST NO: {storeSettings.gstNo}</p>}
                                    {storeSettings.fssaiNo && <p style={{ margin: '0 0 2px 0', fontSize: '18px', fontWeight: 'bold' }}>FSSAI NO: {storeSettings.fssaiNo}</p>}
                                    {storeSettings.contactPhone && <p style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold' }}>Phone No: {storeSettings.contactPhone}</p>}
                                    <div style={{ borderBottom: '1px solid #000', margin: '5px 0' }}></div>
                                </div>

                                <div style={{ marginBottom: '10px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '16px', gap: '5px' }}>
                                        <div>Date: {new Date(printableOrder.createdAt).toLocaleDateString()}</div>
                                        <div>Dine In: {printableOrder.tableNo || 'N/A'}</div>
                                        <div>Time: {new Date(printableOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                                        <div>Bill No.: {printableOrder._id.substring(printableOrder._id.length - 4).toUpperCase()}</div>
                                        <div>Cashier: biller</div>
                                        <div style={{ fontWeight: 'bold' }}>Token No.: {printableOrder.tokenNo || '1'}</div>
                                    </div>
                                    <div style={{ borderBottom: '1px solid #000', margin: '5px 0' }}></div>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '18px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #000' }}>
                                            <th style={{ textAlign: 'left', padding: '2px 0' }}>No.Item</th>
                                            <th style={{ textAlign: 'center', padding: '2px 0' }}>Qty.</th>
                                            <th style={{ textAlign: 'right', padding: '2px 0' }}>Price</th>
                                            <th style={{ textAlign: 'right', padding: '2px 0' }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {printableOrder.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td style={{ padding: '4px 0' }}>
                                                    <span style={{ marginRight: '5px' }}>{idx + 1}</span>
                                                    <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>{item.qty}</td>
                                                <td style={{ textAlign: 'right' }}>{item.price.toFixed(1)}</td>
                                                <td style={{ textAlign: 'right' }}>{(item.qty * item.price).toFixed(1)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div style={{ borderBottom: '1px solid #000', margin: '5px 0' }}></div>

                                <div style={{ fontSize: '18px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginBottom: '3px' }}>
                                        <span>Total Qty: {printableOrder.items.reduce((sum, item) => sum + item.qty, 0)}</span>
                                        <span>Sub Total: {printableOrder.totalAmount.toFixed(1)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginBottom: '2px' }}>
                                        <span>{printableOrder.totalAmount.toFixed(1)} @ CGST {(storeSettings.taxPercent / 2).toFixed(1)}%</span>
                                        <span>{(printableOrder.totalAmount * (storeSettings.taxPercent / 200)).toFixed(1)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginBottom: '2px' }}>
                                        <span>{printableOrder.totalAmount.toFixed(1)} @ SGST {(storeSettings.taxPercent / 2).toFixed(1)}%</span>
                                        <span>{(printableOrder.totalAmount * (storeSettings.taxPercent / 200)).toFixed(1)}</span>
                                    </div>
                                    <div style={{ borderBottom: '1px solid #000', margin: '3px 0' }}></div>
                                    <div style={{ textAlign: 'right', fontSize: '12px' }}>Round off: 0.0</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Grand Total</span>
                                        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{(printableOrder.totalAmount * (1 + storeSettings.taxPercent / 100)).toFixed(1)}</span>
                                    </div>
                                    <div style={{ borderBottom: '1px solid #000', margin: '5px 0' }}></div>
                                </div>

                                <div style={{ textAlign: 'center', marginTop: '15px', marginBottom: '10px' }}>
                                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>
                                        Thank You {
                                            printableOrder.deliveryAddress?.name ||
                                            (printableOrder.deliveryAddress?.street?.includes('||') ? printableOrder.deliveryAddress.street.split('||')[0].replace('Name:', '').trim() : '') ||
                                            'Customer'
                                        }, Visit Again....
                                    </p>
                                    {storeSettings.upiId && <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <p style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#333', fontWeight: 'bold' }}>SCAN & PAY VIA UPI</p>
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${storeSettings.upiId}&pn=${storeSettings.storeName}&am=${(printableOrder.totalAmount * (1 + storeSettings.taxPercent / 100)).toFixed(1)}&cu=INR`)}`}
                                            alt="UPI QR Code"
                                            style={{ width: '100px', height: '100px', border: '1px solid #000', padding: '5px', borderRadius: '8px' }}
                                        />
                                    </div>}
                                </div>
                            </div>
                        ) : (
                            /* SMART / A4 INVOICE DESIGN */
                            <div style={{
                                fontFamily: "'Poppins', sans-serif",
                                width: '100%',
                                padding: '40px',
                                color: '#333'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '2px solid var(--primary)', paddingBottom: '20px' }}>
                                    <div>
                                        <h1 style={{ margin: 0, color: 'var(--primary)', fontSize: '32px' }}>{storeSettings.storeName || 'Store Name'}</h1>
                                        <p style={{ margin: '5px 0', fontSize: '14px', whiteSpace: 'pre-line' }}>{storeSettings.address}</p>
                                        {storeSettings.gstNo && <p style={{ margin: 0, fontSize: '14px' }}>GSTIN: {storeSettings.gstNo}</p>}
                                        {storeSettings.fssaiNo && <p style={{ margin: 0, fontSize: '14px' }}>FSSAI: {storeSettings.fssaiNo}</p>}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <h2 style={{ margin: 0, color: '#666' }}>INVOICE</h2>
                                        <p style={{ margin: '5px 0' }}>#INV-{printableOrder._id.substring(printableOrder._id.length - 8).toUpperCase()}</p>
                                        <p style={{ margin: 0 }}>Date: {new Date(printableOrder.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '30px' }}>
                                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Order Details</h3>
                                    <p><strong>Status:</strong> <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{printableOrder.status.toUpperCase()}</span></p>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '2px solid #eee' }}>
                                            <th style={{ textAlign: 'left', padding: '15px' }}>Item Description</th>
                                            <th style={{ textAlign: 'center', padding: '15px' }}>Quantity</th>
                                            <th style={{ textAlign: 'right', padding: '15px' }}>Price</th>
                                            <th style={{ textAlign: 'right', padding: '15px' }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {printableOrder.items.map((item, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '15px' }}>{item.name}</td>
                                                <td style={{ textAlign: 'center', padding: '15px' }}>{item.qty}</td>
                                                <td style={{ textAlign: 'right', padding: '15px' }}>₹{item.price.toFixed(2)}</td>
                                                <td style={{ textAlign: 'right', padding: '15px' }}>₹{(item.qty * item.price).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <div style={{ width: '300px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                                            <span>Subtotal:</span>
                                            <span>₹{printableOrder.totalAmount.toFixed(2)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                                            <span>Tax ({storeSettings.taxPercent}%):</span>
                                            <span>₹{(printableOrder.totalAmount * (storeSettings.taxPercent / 100)).toFixed(2)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: 'bold', fontSize: '20px', color: 'var(--primary)', borderTop: '2px solid #333' }}>
                                            <span>Total Amount:</span>
                                            <span>₹{(printableOrder.totalAmount * (1 + storeSettings.taxPercent / 100)).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {storeSettings.upiId && (
                                    <div style={{ marginTop: '60px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                                        <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#888' }}>SCAN TO PAY</p>
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${storeSettings.upiId}&pn=${encodeURIComponent(storeSettings.storeName || 'Store')}`}
                                            alt="UPI QR Code"
                                            style={{ width: '100px', height: '100px', borderRadius: '8px' }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
};

const SubscriberUpdateManager = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleSendUpdate = async () => {
        if (!window.confirm('Are you sure you want to send a summary update to ALL subscribers? This will automatically include the newest menu items, offers, and categories.')) return;

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await fetch(API_NEWSLETTER_UPDATE_SUMMARY, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (res.ok) {
                setStatus({ type: 'success', message: 'Summary update email sent successfully!' });
            } else {
                setStatus({ type: 'error', message: data.message || 'Failed to send update.' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Network error.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ width: '100%', height: '250px', position: 'relative', overflow: 'hidden' }}>
                <img
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                    alt="Restaurant Updates"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))', display: 'flex', alignItems: 'flex-end', padding: '30px', justifyContent: 'center' }}>
                    <h2 style={{ color: 'white', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>📢 Keep Your Subscribers Updated</h2>
                </div>
            </div>

            <div style={{ padding: '40px' }}>
                <div style={{ fontSize: '50px', marginBottom: '10px' }}>✉️</div>
                <h3 style={{ marginBottom: '15px' }}>Automatic Summary Update</h3>
                <p style={{ color: '#666', marginBottom: '30px', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto 30px' }}>
                    Send a direct notification to all your fans! This feature gathers your newest menu items,
                    active promotions, and food categories into one professional email.
                </p>

                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '30px', textAlign: 'left', border: '1px dashed #ddd' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>What's included in the email?</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#666', lineHeight: '1.8' }}>
                        <li>🔥 Latest 3 Active Offers</li>
                        <li>🍕 Top 3 Newest Menu Items</li>
                        <li>🏷️ Most Recent Food Categories</li>
                        <li>🔗 Direct link to your website</li>
                    </ul>
                </div>

                {status.message && (
                    <div style={{
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        background: status.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: status.type === 'success' ? '#155724' : '#721c24',
                        border: `1px solid ${status.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                    }}>
                        {status.message}
                    </div>
                )}

                <button
                    onClick={handleSendUpdate}
                    disabled={loading}
                    style={{
                        padding: '15px 40px',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '30px',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 15px rgba(255, 71, 87, 0.3)',
                        transition: 'all 0.3s ease',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Processing & Sending...' : 'Update for Subscribers 🚀'}
                </button>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '15px' }}>
                    * This functionality is only for website subscribers.
                </p>
            </div>
        </div>
    );
};




const BroadcastManager = () => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [image, setImage] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!window.confirm('Send this broadcast to ALL subscribers?')) return;
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await fetch(API_NEWSLETTER_BROADCAST, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, message, image })
            });
            const data = await res.json();
            if (res.ok) {
                setStatus({ type: 'success', message: 'Broadcast sent successfully!' });
                setSubject('');
                setMessage('');
                setImage('');
            } else {
                setStatus({ type: 'error', message: data.message || 'Failed to send.' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Network error.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '20px' }}>📢 Broadcast Message</h3>
            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
                <form onSubmit={handleSend} style={{ display: 'grid', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Subject</label>
                        <input required type="text" value={subject} onChange={e => setSubject(e.target.value)} style={inputStyle} placeholder="Email Subject" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Message</label>
                        <textarea required value={message} onChange={e => setMessage(e.target.value)} style={{ ...inputStyle, height: '150px' }} placeholder="Your message..." />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Image URL (Optional)</label>
                        <input type="url" value={image} onChange={e => setImage(e.target.value)} style={inputStyle} placeholder="https://..." />
                    </div>
                    {status.message && (
                        <div style={{ padding: '15px', borderRadius: '6px', background: status.type === 'success' ? '#d4edda' : '#f8d7da', color: status.type === 'success' ? '#155724' : '#721c24' }}>
                            {status.message}
                        </div>
                    )}
                    <button disabled={loading} type="submit" className="btn-primary" style={{ padding: '15px' }}>
                        {loading ? 'Sending...' : 'Send Broadcast 🚀'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const CategoryManager = ({ categories, addCategory, deleteCategory, updateCategory }) => {
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isEditing) {
            const result = await updateCategory(editId, { name, image });
            if (result.success) {
                alert('Category updated successfully!');
                resetForm();
            } else {
                alert(`Failed to update category: ${result.message}`);
            }
        } else {
            const success = await addCategory({ name, image });
            if (success) {
                alert('Category added successfully!');
                resetForm();
            } else {
                alert('Failed to add category. Name might be duplicate.');
            }
        }
    };

    const handleEdit = (cat) => {
        setName(cat.name);
        setImage(cat.image);
        setIsEditing(true);
        setEditId(cat._id);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    const resetForm = () => {
        setName('');
        setImage('');
        setIsEditing(false);
        setEditId(null);
    };

    return (
        <div>
            <h3>Manage Categories</h3>

            {/* Add/Edit Category Form */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0 }}>{isEditing ? 'Edit Category' : 'Add New Category'}</h4>
                    {isEditing && <button onClick={resetForm} style={{ padding: '5px 10px', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>}
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '15px', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Category Name</label>
                        <input required type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="e.g. Pasta" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Image</label>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <input required type="url" value={image} onChange={e => setImage(e.target.value)} style={inputStyle} placeholder="URL or Upload..." />
                            <label style={{ padding: '10px', background: '#ddd', borderRadius: '4px', cursor: 'pointer' }}>
                                📂
                                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setImage)} style={{ display: 'none' }} />
                            </label>
                        </div>
                    </div>
                    <button type="submit" style={{ padding: '10px', background: isEditing ? 'orange' : 'var(--success)', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', height: '40px' }}>
                        {isEditing ? 'Update' : 'Add'}
                    </button>
                </form>
            </div>

            {/* Category List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {categories.map(cat => (
                    <div key={cat._id} style={{ background: 'white', padding: '15px', borderRadius: '10px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                            <button
                                onClick={() => handleEdit(cat)}
                                style={{ background: '#fff3cd', border: 'none', color: '#856404', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Edit"
                            >
                                <i className="fa-solid fa-pen" style={{ fontSize: '12px' }}></i>
                            </button>
                            <button
                                onClick={async () => {
                                    if (window.confirm('Delete category?')) {
                                        const result = await deleteCategory(cat._id);
                                        if (!result.success) alert(`Failed to delete: ${result.message}`);
                                    }
                                }}
                                style={{ background: '#ffebeb', border: 'none', color: 'red', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Delete"
                            >
                                &times;
                            </button>
                        </div>
                        <img src={cat.image} alt={cat.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px' }} />
                        <h4 style={{ margin: 0 }}>{cat.name}</h4>
                    </div>
                ))}
            </div>
        </div>
    );
};


const StoreSettingsManager = ({ storeSettings, updateSettings }) => {
    const [settings, setSettings] = useState(storeSettings || {});
    const [editMode, setEditMode] = useState(false);

    // Sync state when props change
    useEffect(() => {
        if (storeSettings) setSettings(storeSettings);
    }, [storeSettings]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await updateSettings(settings);
        if (result.success) {
            alert('Store settings updated successfully!');
            setEditMode(false);
        } else {
            alert('Failed to update settings: ' + result.message);
        }
    };

    return (
        <div style={{ width: '100%', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ margin: 0, fontSize: '24px' }}>🛠️ Manage Store Settings</h3>
                <button
                    type="button"
                    onClick={() => {
                        if (editMode) setSettings(storeSettings); // Reset on cancel
                        setEditMode(!editMode);
                    }}
                    style={{
                        padding: '10px 25px',
                        background: editMode ? '#f5f5f5' : 'var(--primary)',
                        color: editMode ? '#333' : 'white',
                        border: 'none',
                        borderRadius: '25px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}
                >
                    {editMode ? 'Cancel' : 'Edit Details ✏️'}
                </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
                <div style={{ display: 'grid', gap: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary)', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>General Information</h4>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Store Name</label>
                        <input
                            type="text"
                            readOnly={!editMode}
                            value={settings.storeName || ''}
                            onChange={e => setSettings({ ...settings, storeName: e.target.value })}
                            style={{ ...inputStyle, background: editMode ? 'white' : '#fff', color: '#333', border: editMode ? '1px solid var(--primary)' : '1px solid #eee', cursor: editMode ? 'text' : 'default' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Contact Email</label>
                            <input
                                type="email"
                                readOnly={!editMode}
                                value={settings.contactEmail || ''}
                                onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
                                style={{ ...inputStyle, background: editMode ? 'white' : '#fff', color: '#333', border: editMode ? '1px solid var(--primary)' : '1px solid #eee', cursor: editMode ? 'text' : 'default' }}
                                placeholder="store@example.com"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Contact Phone</label>
                            <input
                                type="tel"
                                readOnly={!editMode}
                                value={settings.contactPhone || ''}
                                onChange={e => setSettings({ ...settings, contactPhone: e.target.value })}
                                style={{ ...inputStyle, background: editMode ? 'white' : '#fff', color: '#333', border: editMode ? '1px solid var(--primary)' : '1px solid #eee', cursor: editMode ? 'text' : 'default' }}
                                placeholder="+91 9988776655"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>UPI ID (for payments)</label>
                        <input
                            type="text"
                            readOnly={!editMode}
                            value={settings.upiId || ''}
                            onChange={e => setSettings({ ...settings, upiId: e.target.value })}
                            style={{ ...inputStyle, background: editMode ? 'white' : '#fff', color: '#333', border: editMode ? '1px solid var(--primary)' : '1px solid #eee', cursor: editMode ? 'text' : 'default' }}
                            placeholder="yourname@bank"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Business Address</label>
                        <textarea
                            readOnly={!editMode}
                            value={settings.address || ''}
                            onChange={e => setSettings({ ...settings, address: e.target.value })}
                            style={{ ...inputStyle, height: '60px', background: editMode ? 'white' : '#fff', color: '#333', border: editMode ? '1px solid var(--primary)' : '1px solid #eee', cursor: editMode ? 'text' : 'default' }}
                            placeholder="Full address of your store"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>GST NO</label>
                            <input
                                type="text"
                                readOnly={!editMode}
                                value={settings.gstNo || ''}
                                onChange={e => setSettings({ ...settings, gstNo: e.target.value })}
                                style={{ ...inputStyle, background: editMode ? 'white' : '#fff', color: '#333', border: editMode ? '1px solid var(--primary)' : '1px solid #eee', cursor: editMode ? 'text' : 'default' }}
                                placeholder="24ABCDE1234F1Z5"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>FSSAI NO</label>
                            <input
                                type="text"
                                readOnly={!editMode}
                                value={settings.fssaiNo || ''}
                                onChange={e => setSettings({ ...settings, fssaiNo: e.target.value })}
                                style={{ ...inputStyle, background: editMode ? 'white' : '#fff', color: '#333', border: editMode ? '1px solid var(--primary)' : '1px solid #eee', cursor: editMode ? 'text' : 'default' }}
                                placeholder="20724034002453"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Tax (%)</label>
                            <input
                                type="number"
                                readOnly={!editMode}
                                value={settings.taxPercent || 0}
                                onChange={e => setSettings({ ...settings, taxPercent: Number(e.target.value) })}
                                style={{ ...inputStyle, background: editMode ? 'white' : '#fff', color: '#333', border: editMode ? '1px solid var(--primary)' : '1px solid #eee', cursor: editMode ? 'text' : 'default' }}
                                placeholder="5"
                            />
                        </div>
                    </div>

                    <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                        <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>🖨️ Printer Configuration</label>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="printerType"
                                    disabled={!editMode}
                                    value="thermal"
                                    checked={settings.printerType === 'thermal'}
                                    onChange={e => setSettings({ ...settings, printerType: e.target.value })}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: editMode ? 'pointer' : 'default' }}
                                />
                                <span>Thermal Printer</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="printerType"
                                    disabled={!editMode}
                                    value="smart"
                                    checked={settings.printerType === 'smart'}
                                    onChange={e => setSettings({ ...settings, printerType: e.target.value })}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: editMode ? 'pointer' : 'default' }}
                                />
                                <span>Smart Printer</span>
                            </label>
                        </div>
                    </div>

                </div>

                <div style={{ display: 'grid', gap: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary)', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>Website Content</h4>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Hero Title</label>
                        <input
                            type="text"
                            readOnly={!editMode}
                            value={settings.heroTitle || ''}
                            onChange={e => setSettings({ ...settings, heroTitle: e.target.value })}
                            style={{ ...inputStyle, background: editMode ? 'white' : '#fff', color: '#333', border: editMode ? '1px solid var(--primary)' : '1px solid #eee', cursor: editMode ? 'text' : 'default' }}
                            placeholder="e.g. Experience The Taste of Italy"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Hero Subtitle</label>
                        <textarea
                            readOnly={!editMode}
                            value={settings.heroSubtitle || ''}
                            onChange={e => setSettings({ ...settings, heroSubtitle: e.target.value })}
                            style={{ ...inputStyle, height: '80px', background: editMode ? 'white' : '#fff', color: '#333', border: editMode ? '1px solid var(--primary)' : '1px solid #eee', cursor: editMode ? 'text' : 'default' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Hero Background Images (Slider)</label>
                        {(settings.heroImages || []).map((img, index) => (
                            <div key={index} style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
                                <input
                                    type="url"
                                    readOnly={!editMode}
                                    value={img}
                                    onChange={e => {
                                        const newImages = [...(settings.heroImages || [])];
                                        newImages[index] = e.target.value;
                                        setSettings({ ...settings, heroImages: newImages });
                                    }}
                                    style={{ ...inputStyle, background: editMode ? 'white' : '#fff', color: '#333', border: editMode ? '1px solid var(--primary)' : '1px solid #eee', cursor: editMode ? 'text' : 'default' }}
                                    placeholder={`Image URL ${index + 1}`}
                                />
                                {editMode && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newImages = settings.heroImages.filter((_, i) => i !== index);
                                            setSettings({ ...settings, heroImages: newImages });
                                        }}
                                        style={{ background: '#ffebeb', color: 'red', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0 10px' }}
                                    >
                                        &times;
                                    </button>
                                )}
                            </div>
                        ))}
                        {editMode && (
                            <button
                                type="button"
                                onClick={() => setSettings({ ...settings, heroImages: [...(settings.heroImages || []), ''] })}
                                style={{ padding: '8px 12px', background: '#e3f2fd', color: '#2196f3', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                            >
                                + Add Image
                            </button>
                        )}

                        {/* Preview first image */}
                        {settings.heroImages && settings.heroImages.length > 0 && settings.heroImages[0] && (
                            <div style={{ marginTop: '10px', height: '150px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee' }}>
                                <img src={settings.heroImages[0]} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        )}
                    </div>
                </div>

                {editMode && (
                    <button type="submit" className="btn-primary" style={{ gridColumn: '1 / -1', padding: '15px', marginTop: '20px', borderRadius: '30px', maxWidth: '300px', margin: '20px auto 0', transition: '0.3s' }}>
                        Save Changes ✅
                    </button>
                )}
            </form>
        </div>
    );
};

const OfferManager = ({ offers, addOffer, updateOffer, deleteOffer }) => {
    const [formData, setFormData] = useState({
        title: '',
        subtitle: 'Limited Offer',
        description: '',
        discount: '',
        price: '',
        image: '',
        isActive: true,
        items: []
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [managingOfferId, setManagingOfferId] = useState(null); // ID of the offer being managed

    const resetForm = () => {
        setFormData({
            title: '',
            subtitle: 'Limited Offer',
            description: '',
            discount: '',
            price: '',
            image: '',
            isActive: true,
            items: []
        });
        setIsEditing(false);
        setEditId(null);
    };

    const handleEdit = (offer) => {
        setFormData({
            title: offer.title || '',
            subtitle: offer.subtitle || '',
            description: offer.description || '',
            discount: offer.discount || '',
            price: offer.price || '',
            image: offer.image || '',
            isActive: offer.isActive !== undefined ? offer.isActive : true,
            items: offer.items || []
        });
        setIsEditing(true);
        setEditId(offer._id);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    const handleUpdateItems = async (offerId, newItems) => {
        // Look up the offer by ID to get the current state
        const originalOffer = offers.find(o => o._id === offerId);
        if (!originalOffer) return { success: false };

        // Prepare minimal update data
        const updatedData = {
            ...originalOffer,
            items: newItems
        };

        const result = await updateOffer(offerId, updatedData);
        if (result.success) {
            // Success! The context update will trigger a re-render.
            return { success: true };
        } else {
            alert('Failed to update items: ' + result.message);
            return { success: false };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            discount: formData.discount ? Number(formData.discount) : 0,
            price: formData.price ? Number(formData.price) : 0
        };

        if (isEditing) {
            const result = await updateOffer(editId, data);
            if (result.success) {
                alert('Offer updated successfully!');
                resetForm();
            } else {
                alert(`Failed to update offer: ${result.message}`);
            }
        } else {
            const result = await addOffer(data);
            if (result.success) {
                alert('Offer added successfully!');
                resetForm();
            } else {
                alert(`Failed to add offer: ${result.message}`);
            }
        }
    };

    const managingOffer = managingOfferId ? offers.find(o => o._id === managingOfferId) : null;

    if (managingOffer) {
        return (
            <div>
                <button onClick={() => setManagingOfferId(null)} style={{ marginBottom: '20px', padding: '10px', cursor: 'pointer' }}>
                    ← Back to Offers List
                </button>
                <OfferItemManager offer={managingOffer} onUpdate={(items) => handleUpdateItems(managingOffer._id, items)} />
            </div>
        );
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this offer?')) {
            const result = await deleteOffer(id);
            if (!result.success) alert(`Failed to delete: ${result.message}`);
        }
    };

    return (
        <div>
            <h3>Manage Offers</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginBottom: '40px' }}>
                {/* 1. Add/Edit Form */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h4 style={{ margin: 0 }}>{isEditing ? 'Edit Offer' : 'Add New Offer'}</h4>
                        {isEditing && <button onClick={resetForm} style={{ padding: '5px 10px', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>}
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Title</label>
                            <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={inputStyle} placeholder="e.g. Super Delicious Burger" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Subtitle</label>
                            <input type="text" value={formData.subtitle} onChange={e => setFormData({ ...formData, subtitle: e.target.value })} style={inputStyle} placeholder="e.g. Limited Offer" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Discount %</label>
                            <input type="number" value={formData.discount} onChange={e => setFormData({ ...formData, discount: e.target.value })} style={inputStyle} placeholder="e.g. 20" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Price (₹)</label>
                            <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} style={inputStyle} placeholder="e.g. 199" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Image</label>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <input required type="url" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} style={inputStyle} placeholder="URL or Upload..." />
                                <label style={{ padding: '10px', background: '#ddd', borderRadius: '4px', cursor: 'pointer' }}>
                                    📂
                                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setFormData({ ...formData, image: url }))} style={{ display: 'none' }} />
                                </label>
                            </div>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Description (Optional)</label>
                            <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Active Status</label>
                            <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                        </div>

                        <button type="submit" style={{ gridColumn: '1 / -1', padding: '12px', background: isEditing ? 'orange' : 'var(--success)', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                            {isEditing ? 'Update Offer' : 'Add Offer'}
                        </button>
                    </form>
                </div>

                {/* 2. Offers Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {offers.map(offer => (
                        <div key={offer._id} style={{
                            background: `url(${offer.image})`, backgroundSize: 'cover', backgroundPosition: 'center',
                            borderRadius: '15px', padding: '20px', height: '200px', position: 'relative', overflow: 'hidden',
                            color: 'white', boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}></div>

                            <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <span style={{ color: 'orange', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>{offer.subtitle}</span>
                                <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '5px 0' }}>{offer.title}</h2>
                                {offer.discount > 0 && <span style={{ background: 'var(--primary)', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', width: 'fit-content' }}>{offer.discount}% OFF</span>}
                                {offer.price && <span style={{ marginTop: '5px', fontSize: '18px', fontWeight: 'bold' }}>₹{offer.price}</span>}
                            </div>

                            <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px', zIndex: 2 }}>
                                <button onClick={() => handleEdit(offer)} style={{ background: 'white', border: 'none', color: 'orange', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fa-solid fa-pen"></i></button>
                                <button onClick={() => handleDelete(offer._id)} style={{ background: 'white', border: 'none', color: 'red', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fa-solid fa-trash"></i></button>
                            </div>

                            {/* Manage Items button styled like user screenshot with red text */}
                            <button
                                onClick={() => setManagingOfferId(offer._id)}
                                style={{
                                    position: 'absolute', bottom: '10px', right: '10px',
                                    background: 'white', color: 'red',
                                    border: 'none', borderRadius: '20px',
                                    padding: '5px 15px', fontWeight: 'bold', cursor: 'pointer',
                                    fontSize: '12px', zIndex: 2
                                }}
                            >
                                Manage Items ({offer.items ? offer.items.length : 0})
                            </button>
                            {!offer.isActive && <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'red', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', zIndex: 2 }}>INACTIVE</div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const OfferItemManager = ({ offer, onUpdate }) => {
    const [items, setItems] = useState(offer.items || []);
    const [newItem, setNewItem] = useState({ name: '', originalPrice: '', price: '', description: '', isVeg: true, image: '' });
    const [isUploading, setIsUploading] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null); // Track which item is being edited

    // Sync items when offer updates
    useEffect(() => {
        setItems(offer.items || []);
    }, [offer]);

    const handleItemSubmit = async (e) => {
        e.preventDefault();
        const nextItem = {
            ...newItem,
            price: Number(newItem.price),
            originalPrice: newItem.originalPrice ? Number(newItem.originalPrice) : null
        };

        let updatedItems;
        if (editingIndex !== null) {
            // Update existing item
            updatedItems = items.map((item, index) => index === editingIndex ? nextItem : item);
        } else {
            // Add new item
            updatedItems = [...items, nextItem];
        }

        // Optimistic UI update
        setItems(updatedItems);

        const result = await onUpdate(updatedItems);
        if (result && result.success) {
            alert(editingIndex !== null ? 'Item updated successfully!' : 'Item added successfully!');
            setNewItem({ name: '', originalPrice: '', price: '', description: '', isVeg: true, image: '' });
            setEditingIndex(null); // Reset edit mode
        } else {
            // Revert on failure
            setItems(offer.items || []);
        }
    };

    const deleteItem = (index) => {
        const updatedItems = items.filter((_, i) => i !== index);
        setItems(updatedItems);
        onUpdate(updatedItems);
        if (editingIndex === index) {
            setEditingIndex(null);
            setNewItem({ name: '', originalPrice: '', price: '', description: '', isVeg: true, image: '' });
        }
    };

    const startEditing = (index) => {
        const item = items[index];
        setNewItem({
            name: item.name,
            originalPrice: item.originalPrice || '',
            price: item.price,
            description: item.description || '',
            isVeg: item.isVeg,
            image: item.image || ''
        });
        setEditingIndex(index);
        window.scrollTo({ top: 300, behavior: 'smooth' }); // Scroll to form
    };

    const cancelEditing = () => {
        setEditingIndex(null);
        setNewItem({ name: '', originalPrice: '', price: '', description: '', isVeg: true, image: '' });
    };

    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px' }}>
            <h3>Manage Items for: {offer.title}</h3>

            <div style={{
                background: editingIndex !== null ? '#fff3cd' : '#f9f9f9',
                padding: '20px', borderRadius: '8px', marginBottom: '30px',
                border: editingIndex !== null ? '1px solid #ffeeba' : 'none'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0 }}>{editingIndex !== null ? 'Edit Item' : 'Add New Item'}</h4>
                    {editingIndex !== null && (
                        <button onClick={cancelEditing} type="button" style={{ background: '#ddd', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                    )}
                </div>

                <form onSubmit={handleItemSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <input required placeholder="Item Name" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} style={inputStyle} />
                    <input type="number" placeholder="Real Price (Original)" value={newItem.originalPrice} onChange={e => setNewItem({ ...newItem, originalPrice: e.target.value })} style={inputStyle} />
                    <input required type="number" placeholder="Offer Price" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} style={inputStyle} />
                    <input placeholder="Image URL" value={newItem.image} onChange={e => setNewItem({ ...newItem, image: e.target.value })} style={inputStyle} />
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <label style={{ padding: '10px', background: isUploading ? '#eee' : '#ddd', borderRadius: '4px', cursor: isUploading ? 'not-allowed' : 'pointer' }}>
                            {isUploading ? '⌛' : '📂'}
                            <input
                                type="file"
                                accept="image/*"
                                disabled={isUploading}
                                onChange={(e) => {
                                    setIsUploading(true);
                                    handleFileUpload(e, (url) => {
                                        setIsUploading(false);
                                        if (url) setNewItem(prev => ({ ...prev, image: url }));
                                    });
                                }}
                                style={{ display: 'none' }}
                            />
                        </label>
                        {newItem.image && (
                            <div style={{ position: 'relative' }}>
                                <img src={newItem.image} alt="Preview" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', border: '2px solid var(--success)' }} />
                                <button type="button" onClick={() => setNewItem({ ...newItem, image: '' })} style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', border: 'none', width: '15px', height: '15px', fontSize: '10px', cursor: 'pointer' }}>×</button>
                            </div>
                        )}
                    </div>
                    <input placeholder="Description" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} style={inputStyle} />
                    <label style={{ display: 'flex', alignItems: 'center' }}>
                        Veg? <input type="checkbox" checked={newItem.isVeg} onChange={e => setNewItem({ ...newItem, isVeg: e.target.checked })} style={{ marginLeft: '10px', transform: 'scale(1.2)' }} />
                    </label>
                    <button type="submit" disabled={isUploading} style={{ background: isUploading ? '#ccc' : (editingIndex !== null ? 'orange' : 'var(--success)'), color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: isUploading ? 'default' : 'pointer', fontWeight: 'bold' }}>
                        {isUploading ? 'Uploading...' : (editingIndex !== null ? 'Update Item' : '+ Add Item')}
                    </button>
                </form>
            </div>

            <div style={{ display: 'grid', gap: '10px' }}>
                {items.length === 0 ? <p>No items in this offer yet.</p> : items.map((item, idx) => (
                    <div key={idx} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px', border: '1px solid #eee', borderRadius: '4px',
                        background: editingIndex === idx ? '#fff3cd' : 'white',
                        borderLeft: editingIndex === idx ? '4px solid orange' : '1px solid #eee'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {item.image && <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />}
                            <div>
                                <strong>{item.name}</strong>
                                <span style={{ marginLeft: '10px' }}>
                                    {item.originalPrice && (
                                        <span style={{ textDecoration: 'line-through', color: '#999', marginRight: '5px' }}>₹{item.originalPrice}</span>
                                    )}
                                    <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>₹{item.price}</span>
                                </span>
                                <div style={{ fontSize: '12px', color: '#666' }}>{item.description}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => startEditing(idx)} style={{ color: 'orange', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }} title="Edit">
                                <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button onClick={() => deleteItem(idx)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }} title="Delete">
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BookingManager = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBookings();
        const interval = setInterval(fetchBookings, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchBookings = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const res = await fetch(API_BOOKINGS_STATUS(today));
            const data = await res.json();
            setBookings(data || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (tableNumber, newStatus) => {
        try {
            const res = await fetch(API_BOOKING_STATUS_TABLE(tableNumber), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (res.ok) {
                fetchBookings(); // Refresh UI
            } else {
                alert(data.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Server error');
        }
    };

    return (
        <div style={{ padding: '30px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>Table Booking Manager</h2>

            {loading ? (
                <p>Loading table statuses...</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                    {bookings.map(table => (
                        <div key={table.number} style={{
                            padding: '20px',
                            border: '1px solid #eee',
                            borderRadius: '12px',
                            textAlign: 'center',
                            background: table.status === 'Available' ? '#f1f8e9' : table.status === 'Running' ? '#fffde7' : '#ffebee'
                        }}>
                            <h4 style={{ margin: '0 0 10px 0' }}>Table {table.number}</h4>
                            <div style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '700',
                                color: '#fff',
                                background: table.status === 'Available' ? '#4caf50' : table.status === 'Running' ? '#fbc02d' : '#f44336',
                                marginBottom: '10px'
                            }}>
                                {table.status}
                            </div>
                            <select
                                value={table.status}
                                onChange={(e) => updateStatus(table.number, e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '5px',
                                    borderRadius: '4px',
                                    fontSize: '12px'
                                }}
                            >
                                <option value="Available">Available (Green)</option>
                                <option value="Running">Running (Yellow)</option>
                                <option value="Booked">Booked (Red)</option>
                            </select>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

