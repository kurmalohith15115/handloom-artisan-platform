import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLanguage } from './LanguageContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('handloom_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [artisanProfile, setArtisanProfile] = useState(() => {
    const saved = localStorage.getItem('handloom_artisan_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('handloom_token'));
  const [loading, setLoading] = useState(true);

  const { setLanguage } = useLanguage();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('handloom_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('handloom_user', JSON.stringify(res.user));
            if (res.user.languagePreference) {
              setLanguage(res.user.languagePreference);
            }
            if (res.artisanProfile) {
              setArtisanProfile(res.artisanProfile);
              localStorage.setItem('handloom_artisan_profile', JSON.stringify(res.artisanProfile));
            }
          }
        } catch (err) {
          console.warn('[AUTH] Session verification failed, clearing tokens:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();

    const handleTokenExpired = () => {
      logout();
    };
    window.addEventListener('auth_token_expired', handleTokenExpired);
    return () => window.removeEventListener('auth_token_expired', handleTokenExpired);
  }, []);

  const login = async (email, password, expectedRole = null) => {
    const res = await api.post('/auth/login', { email, password, expectedRole });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('handloom_token', res.token);
      localStorage.setItem('handloom_user', JSON.stringify(res.user));

      if (res.artisanProfile) {
        setArtisanProfile(res.artisanProfile);
        localStorage.setItem('handloom_artisan_profile', JSON.stringify(res.artisanProfile));
      }

      if (res.user.languagePreference) {
        setLanguage(res.user.languagePreference);
      }
    }
    return res;
  };

  const registerCustomer = async (data) => {
    const res = await api.post('/auth/register-customer', data);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('handloom_token', res.token);
      localStorage.setItem('handloom_user', JSON.stringify(res.user));
    }
    return res;
  };

  const registerArtisan = async (data) => {
    const res = await api.post('/auth/register-artisan', data);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      setArtisanProfile(res.artisanProfile);
      localStorage.setItem('handloom_token', res.token);
      localStorage.setItem('handloom_user', JSON.stringify(res.user));
      localStorage.setItem('handloom_artisan_profile', JSON.stringify(res.artisanProfile));
    }
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setArtisanProfile(null);
    localStorage.removeItem('handloom_token');
    localStorage.removeItem('handloom_user');
    localStorage.removeItem('handloom_artisan_profile');
  };

  const updateUserProfile = async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem('handloom_user', JSON.stringify(res.user));
    }
    return res;
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('handloom_user', JSON.stringify(res.user));
        if (res.artisanProfile) {
          setArtisanProfile(res.artisanProfile);
          localStorage.setItem('handloom_artisan_profile', JSON.stringify(res.artisanProfile));
        }
      }
    } catch (err) {
      console.warn('Failed to refresh user profile:', err);
    }
  };

  const value = {
    user,
    artisanProfile,
    token,
    role: user?.role || 'guest',
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    isArtisan: user?.role === 'artisan',
    isCustomer: user?.role === 'customer',
    loading,
    login,
    registerCustomer,
    registerArtisan,
    logout,
    updateUserProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
