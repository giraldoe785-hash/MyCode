import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const isAuth = localStorage.getItem('mycode_is_auth') === 'true';
        if (isAuth) {
          const currentUser = await api.auth.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          // Default demo session is loaded as ready for immediate exploration
          const currentUser = await api.auth.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);
          localStorage.setItem('mycode_is_auth', 'true');
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password, rememberMe = true) => {
    const res = await api.auth.login(email, password, rememberMe);
    if (res.success) {
      setUser(res.user);
      setIsAuthenticated(true);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    if (res.success) {
      setUser(res.user);
      setIsAuthenticated(true);
    }
    return res;
  };

  const logout = async () => {
    await api.auth.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const res = await api.auth.updateProfile(updates);
    if (res.success) {
      setUser(res.user);
    }
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}