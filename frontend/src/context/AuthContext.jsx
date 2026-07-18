import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sap_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loginStudent = async (hall_ticket_number, password) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/student/login', { hall_ticket_number, password });
      const { token, user: userData } = res.data;
      localStorage.setItem('sap_token', token);
      localStorage.setItem('sap_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const loginAdmin = async (username, password) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/admin/login', { username, password });
      const { token, user: userData } = res.data;
      localStorage.setItem('sap_token', token);
      localStorage.setItem('sap_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Admin login failed.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('sap_token');
    localStorage.removeItem('sap_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, loginStudent, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
