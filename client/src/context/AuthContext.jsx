import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

function normalizeUser(raw) {
  if (!raw) return null;
  const id = raw.id != null ? String(raw.id) : raw._id != null ? String(raw._id) : '';
  if (!id) return null;
  return {
    id,
    username: raw.username,
    email: raw.email,
    role: raw.role,
    favorites: (raw.favorites || []).map((f) =>
      f && typeof f === 'object' && f._id != null ? String(f._id) : String(f)
    ),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const saved = localStorage.getItem('user');
    if (token && saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(normalizeUser(parsed));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((token, u) => {
    localStorage.setItem('token', token);
    const nu = normalizeUser(u);
    if (nu) {
      localStorage.setItem('user', JSON.stringify(nu));
      setUser(nu);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { data } = await api.get('/users/profile');
      const merged = normalizeUser({
        _id: data._id,
        username: data.username,
        email: data.email,
        role: data.role,
        favorites: data.favorites,
      });
      if (merged) {
        localStorage.setItem('user', JSON.stringify(merged));
        setUser(merged);
      }
    } catch {
      logout();
    }
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      refreshUser,
      isAdmin: user?.role === 'admin',
    }),
    [user, loading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside provider');
  return ctx;
}
