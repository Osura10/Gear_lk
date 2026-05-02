import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log('Error checking login status', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { 
        email: email.trim(), 
        password: password.trim() 
      });
      const { token, success, ...userData } = response.data;
      console.log('Login success. User role:', userData.role);
      
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.log('Login error:', error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Check your connection.' 
      };
    }
  };

  const register = async (name, email, password, phone, role, address, district) => {
    try {
      const response = await api.post('/auth/register', { 
        name, 
        email: email.trim(), 
        password: password.trim(), 
        phone, 
        role, 
        address, 
        district 
      });
      const { token, success, ...userData } = response.data;
      console.log('Register success. User role:', userData.role);
      
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.log('Register error:', error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Check your connection.' 
      };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
