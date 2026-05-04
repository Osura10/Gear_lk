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
  const defaultImage = process.env.EXPO_PUBLIC_DEFAULT_IMAGE_URL || 'https://via.placeholder.com/300?text=GearLK';
  
  if (!path) return defaultImage;
  
  // Clean path of any whitespace
  const cleanStr = path.trim();
  
  // If it's already a full URL (Cloudinary or other)
  if (cleanStr.startsWith('http')) {
    return cleanStr;
  }

  // Handle local mobile paths
  if (cleanStr.startsWith('file://') || cleanStr.startsWith('content://')) {
    return cleanStr;
  }
  
  // Normalize slashes (especially for paths from Windows local dev)
  let normalizedPath = cleanStr.replace(/\\/g, '/');
  
  // If the path is an absolute Windows path (e.g., C:/Users/...), extract the relative part
  if (normalizedPath.includes(':/') && !normalizedPath.startsWith('http')) {
    const parts = normalizedPath.split('uploads/');
    if (parts.length > 1) {
      normalizedPath = 'uploads/' + parts[1];
    }
  }

  // Remove leading slash if present to avoid double slashes
  const cleanPath = normalizedPath.startsWith('/') ? normalizedPath.substring(1) : normalizedPath;
  
  // Return absolute URL
  // Ensure BASE_URL doesn't end with slash and cleanPath doesn't start with one
  const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  return `${baseUrl}/${cleanPath}`;
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
