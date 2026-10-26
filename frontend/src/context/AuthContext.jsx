import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import API, { clearToken, readToken, storeToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);

  const fetchCurrentUser = useCallback(async () => {
    if (!readToken()) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    try {
      const response = await API.get('/auth/profile');
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (_error) {
      clearToken();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async ({ email, password, rememberMe }) => {
    setAuthBusy(true);
    try {
      const response = await API.post('/auth/login', { email, password, rememberMe });
      storeToken(response.data.token, rememberMe);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Incorrect email or password.' };
    } finally {
      setAuthBusy(false);
    }
  };

  const register = async (payload) => {
    setAuthBusy(true);
    try {
      const response = await API.post('/auth/register', payload);
      return { success: true, message: response.data.message || 'Account created successfully!' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed.' };
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (_error) {
      /* token is cleared locally either way */
    }
    clearToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (next) => setUser((prev) => ({ ...prev, ...next }));

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, authBusy, login, register, logout, updateUser, refreshUser: fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
