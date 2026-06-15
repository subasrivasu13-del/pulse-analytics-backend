import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create and export a configured axios instance
export const api = axios.create({
  baseURL: API_URL
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Generate or retrieve Session ID
  useEffect(() => {
    let sessId = sessionStorage.getItem('x-session-id');
    if (!sessId) {
      sessId = 'sess_' + Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
      sessionStorage.setItem('x-session-id', sessId);
    }
  }, []);

  // Configure request interceptor to attach token and session ID to all Axios requests
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const activeToken = localStorage.getItem('token');
        if (activeToken) {
          config.headers.Authorization = `Bearer ${activeToken}`;
        }
        const sessionId = sessionStorage.getItem('x-session-id');
        if (sessionId) {
          config.headers['x-session-id'] = sessionId;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  // Fetch authenticated user details
  const fetchUser = async (authToken) => {
    try {
      const response = await api.get('/auth/user', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setUser(response.data);
    } catch (err) {
      console.error('Failed to fetch user details:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = async () => {
    try {
      if (token) {
        await api.get('/auth/logout');
      }
    } catch (err) {
      console.error('API logout call error:', err);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
