import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as authApi from '../lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, ask the backend who (if anyone) the session cookie
  // belongs to — this is what makes "closes the tab, reopens later" still
  // show as signed in.
  useEffect(() => {
    let cancelled = false;

    authApi
      .fetchCurrentUser()
      .then((data) => {
        if (!cancelled) setUser(data?.user || null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const signup = useCallback(async ({ email, password, name }) => {
    const data = await authApi.signup({ email, password, name });
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const data = await authApi.login({ email, password });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
