import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  verifyMfa as apiVerifyMfa,
  fetchMe,
  logoutRequest,
  setStoredAccessToken,
  getStoredAccessToken,
  DEMO_ACCOUNTS,
} from '../lib/api';

const AuthContext = createContext(null);

const SESSION_USER_KEY = 'meridian_healthcare_session_user_v1';

function persistUser(user) {
  try {
    if (user) localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_USER_KEY);
  } catch {
    /* storage unavailable */
  }
}

function readPersistedUser() {
  try {
    const raw = localStorage.getItem(SESSION_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mfaPending, setMfaPending] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const storedToken = getStoredAccessToken();
      const cachedUser = readPersistedUser();

      if (!storedToken) {
        if (!cancelled) {
          setUser(null);
          setToken(null);
          setIsLoading(false);
        }
        return;
      }

      if (cachedUser && !cancelled) {
        setUser(cachedUser);
        setToken(storedToken);
      }

      try {
        const me = await fetchMe();
        if (!cancelled) {
          setUser(me);
          setToken(storedToken);
          persistUser(me);
        }
      } catch {
        setStoredAccessToken(null);
        persistUser(null);
        if (!cancelled) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const initiateLogin = async ({ email, password }) => {
    const result = await apiLogin(email, password);
    setMfaPending(result);
    return result;
  };

  const initiateRegister = async ({ name, email, password, dateOfBirth }) => {
    const result = await apiRegister({ name, email, password, dateOfBirth });
    setMfaPending(result);
    return result;
  };

  const verifyMfa = async (code) => {
    if (!mfaPending?.pendingToken) {
      throw new Error('No pending verification session found. Please sign in again.');
    }

    const result = await apiVerifyMfa(mfaPending.pendingToken, code);

    setStoredAccessToken(result.token);
    persistUser(result.user);
    setUser(result.user);
    setToken(result.token);
    setMfaPending(null);

    return result.user;
  };

  const cancelMfa = () => {
    setMfaPending(null);
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      setStoredAccessToken(null);
      persistUser(null);
      setUser(null);
      setToken(null);
      setMfaPending(null);
    }
  };

  const getPortalPath = (targetRole) => {
    const r = targetRole || user?.role;
    if (r === 'provider') return '/provider';
    if (r === 'admin') return '/admin';
    return '/patient';
  };

  const value = {
    user,
    role: user?.role || null,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    mfaPending,
    initiateLogin,
    initiateRegister,
    verifyMfa,
    cancelMfa,
    logout,
    getPortalPath,
    demoAccounts: DEMO_ACCOUNTS,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
