import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import adminApi, { clearAdminToken, readAdminToken, storeAdminToken } from '../services/adminApi';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);

  const fetchAdmin = useCallback(async () => {
    if (!readAdminToken()) {
      setAdmin(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    try {
      const response = await adminApi.get('/admin/profile');
      setAdmin(response.data.admin);
      setIsAuthenticated(true);
    } catch (_error) {
      clearAdminToken();
      setAdmin(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmin();
  }, [fetchAdmin]);

  const login = async ({ email, password, rememberMe }) => {
    setAuthBusy(true);
    try {
      const response = await adminApi.post('/admin/login', { email, password, rememberMe });
      storeAdminToken(response.data.token, rememberMe);
      setAdmin(response.data.admin);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Incorrect admin email or password.' };
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = async () => {
    try {
      await adminApi.post('/admin/logout');
    } catch (_error) {
      /* token is cleared locally either way */
    }
    clearAdminToken();
    setAdmin(null);
    setIsAuthenticated(false);
  };

  const updateAdmin = (next) => setAdmin((prev) => ({ ...prev, ...next }));

  return (
    <AdminContext.Provider value={{ admin, isAuthenticated, loading, authBusy, login, logout, updateAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
