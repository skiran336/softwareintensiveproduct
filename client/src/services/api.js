// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api',
});

// Interceptor to add auth token
api.interceptors.request.use(async (config) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    config.headers.Authorization = `Bearer ${user.access_token}`;
  }
  return config;
});

export default {
  getProducts: (params) => api.get('/products/search', { params }),
  addFavorite: (productId) => api.post('/users/favorites', { productId }),
  getFavorites: () => api.get('/users/favorites'),
};