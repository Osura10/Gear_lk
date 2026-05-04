import api, { getImageUrl } from './api';

// Auth Services
export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const getProfile = () => api.get('/auth/profile');

// Listing Services
export const getAllListings = (params) => api.get('/listings', { params });
export const getListingById = (id) => api.get(`/listings/${id}`);
export const getMyListings = () => api.get('/listings/seller/my-listings');
export const createListing = (listingData) => api.post('/listings', listingData);
export const updateListing = (id, listingData) => api.put(`/listings/${id}`, listingData);
export const deleteListing = (id) => api.delete(`/listings/${id}`);

// Favorite Services
export const getMyFavorites = () => api.get('/favorites');
export const addFavorite = (instrumentId) => api.post('/favorites', { instrumentId });
export const removeFavorite = (id) => api.delete(`/favorites/${id}`);

// Order Services
export const createOrder = (orderData) => api.post('/orders', orderData);
export const checkout = (orderData) => api.post('/orders/checkout', orderData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getMyOrders = () => api.get('/orders/my-orders');
export const getIncomingOrders = () => api.get('/orders/incoming');
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });

// Review Services
export const addReview = (reviewData) => api.post('/reviews', reviewData);
export const getInstrumentReviews = (instrumentId) => api.get(`/reviews/instrument/${instrumentId}`);
export const updateReview = (id, reviewData) => api.put(`/reviews/${id}`, reviewData);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

// Cart Services
export const getCart = () => api.get('/cart');
export const addToCart = (listingId, quantity = 1) => api.post('/cart/add', { listingId, quantity });
export const updateCartItem = (listingId, data) => api.put(`/cart/item/${listingId}`, data);
export const removeFromCart = (listingId) => api.delete(`/cart/remove/${listingId}`);
export const clearCart = () => api.delete('/cart/clear');
export const applyVoucher = (code) => api.post('/cart/apply-voucher', { code });
export const removeVoucher = () => api.delete('/cart/remove-voucher');

// Voucher Services (Seller/Admin)
export const getVouchers = () => api.get('/vouchers');
export const getPublicVouchers = () => api.get('/vouchers/public');
export const getVoucherById = (id) => api.get(`/vouchers/${id}`);
export const createVoucher = (data) => api.post('/vouchers', data);
export const updateVoucher = (id, data) => api.put(`/vouchers/${id}`, data);
export const deleteVoucher = (id) => api.delete(`/vouchers/${id}`);



export default {
  registerUser,
  loginUser,
  getProfile,
  getAllListings,
  getListingById,
  getMyListings,
  createListing,
  updateListing,
  deleteListing,
  getMyFavorites,
  addFavorite,
  removeFavorite,
  createOrder,
  checkout,
  getMyOrders,
  getIncomingOrders,
  updateOrderStatus,
  addReview,
  getInstrumentReviews,
  updateReview,
  deleteReview,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyVoucher,
  removeVoucher,
  getVouchers,
  getPublicVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  getImageUrl,
};
