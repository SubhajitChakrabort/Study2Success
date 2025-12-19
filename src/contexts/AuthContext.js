import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('student'); // Default role
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      try {
         const response = await axios.get('/api/auth/status');
        if (response.data.isAuthenticated) {
          setCurrentUser(response.data.user);
          setUserRole(response.data.user.role || 'student');
        }
      } catch (error) {
        console.error('Auth status check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError('');
      const response = await axios.post('/api/auth/login', { email, password });
      setCurrentUser(response.data.user);
      setUserRole(response.data.user.role || 'student');
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Failed to login');
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError('');
      const response = await axios.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Failed to register');
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setCurrentUser(null);
      setUserRole('student');
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.response?.data?.message || 'Failed to logout');
    }
  };

  const value = {
    currentUser,
    userRole,
    error,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
