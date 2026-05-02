import api from './api';

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
export const checkout = (message) => api.post('/orders/checkout', { message });
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
export const addToCart = (listingId, quantity) => api.post('/cart/add', { listingId, quantity });
export const removeFromCart = (listingId) => api.delete(`/cart/remove/${listingId}`);
export const clearCart = () => api.delete('/cart/clear');

// Messaging Services
export const startConversation = (sellerId, listingId) => api.post('/conversations/start', { sellerId, listingId });
export const getConversations = () => api.get('/conversations');
export const getMessages = (conversationId) => api.get(`/messages/${conversationId}`);
export const sendMessage = (conversationId, text) => api.post(`/messages/${conversationId}`, { text });

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
  removeFromCart,
  clearCart,
  startConversation,
  getConversations,
  getMessages,
  sendMessage,
};
