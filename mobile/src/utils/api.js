import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use environment variable for the API URL, falling back to localhost if not set
// Defined in /mobile/.env
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
});

export const IMAGE_URL = `${BASE_URL}/`;

export const getImageUrl = (path) => {
  const defaultImage = process.env.EXPO_PUBLIC_DEFAULT_IMAGE_URL || 'https://via.placeholder.com/150';
  if (!path) return defaultImage;
  if (path.startsWith('http') || path.startsWith('file://') || path.startsWith('content://')) return path;
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${BASE_URL}/${cleanPath}`;
};

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
