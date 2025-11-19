
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'universal-cookie';
import { clearTokens, getTokens, setTokens } from './api';
import { useNavigate } from 'react-router-dom';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const cookies = new Cookies();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
  
    const raw = cookies.get('vs_user');
    if (raw) {
      try {
        setUser(typeof raw === 'string' ? JSON.parse(raw) : raw);
      } catch (e) {
        setUser(raw);
      }
    }
    setLoadingUser(false);
  }, []);

  const login = useCallback((userData, accessToken = null, refreshToken = null) => {
    
    setUser(userData);
    if (accessToken || refreshToken) {
      setTokens({ access: accessToken, refresh: refreshToken });
    } else {
   
    }


    cookies.set('vs_user', JSON.stringify(userData), { path: '/' });
  }, [cookies]);

  const logout = useCallback(() => {
    setUser(null);
    clearTokens();
    cookies.remove('vs_user', { path: '/' });
   
    try {
      navigate('/login');
    } catch (e) {
    
    }
  }, [cookies, navigate]);

  const isAuthenticated = !!user;

  return (
    <UserContext.Provider value={{ user, login, logout, isAuthenticated, loadingUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
