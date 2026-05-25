import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEVICE_ID } from '../utils/constants';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const applyTheme = (color) => {
    if (!color) return;
    const root = document.documentElement;
    root.style.setProperty('--brand', color);
    root.style.setProperty('--brand-dark', color);
    root.style.setProperty('--brand-glow', `${color}44`);
    root.style.setProperty('--brand-subtle', `${color}14`);
  };

  useEffect(() => {
    if (token) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        if (parsedUser.config?.themeColor) {
          applyTheme(parsedUser.config.themeColor);
        }
      }
    }
    setLoading(false);
  }, [token]);

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('token', tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.config?.themeColor) {
      applyTheme(userData.config.themeColor);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
