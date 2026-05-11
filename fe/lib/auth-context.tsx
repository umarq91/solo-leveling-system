"use client";

import { createContext, useContext, useCallback, useEffect, useState, ReactNode } from "react";
import { api, getToken, setToken, clearToken, User } from "./api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (u: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_CACHE_KEY = "sl_user_cache";

function readCachedUser(): User | null {
  try { return JSON.parse(localStorage.getItem(USER_CACHE_KEY) ?? "null"); } catch { return null; }
}

function writeCachedUser(u: User | null) {
  if (u) localStorage.setItem(USER_CACHE_KEY, JSON.stringify(u));
  else localStorage.removeItem(USER_CACHE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  function _setUser(u: User | null) {
    setUser(u);
    writeCachedUser(u);
  }

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.auth.me();
      _setUser(data.user);
    } catch {
      clearToken();
      _setUser(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    const cached = readCachedUser();
    if (cached) {
      // Show cached user immediately — no loading spinner
      setUser(cached);
      setLoading(false);
      // Re-validate in background, silently update if changed
      refreshUser();
    } else {
      refreshUser().finally(() => setLoading(false));
    }
  }, [refreshUser]);

  async function login(email: string, password: string) {
    const data = await api.auth.login({ email, password });
    setToken(data.token);
    _setUser(data.user);
  }

  async function register(username: string, email: string, password: string) {
    await api.auth.register({ username, email, password });
  }

  function logout() {
    clearToken();
    _setUser(null);
  }

  function updateUser(u: User) {
    _setUser(u);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
