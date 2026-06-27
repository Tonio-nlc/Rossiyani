"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "@/lib/auth/auth-client";
import type { AuthUser } from "@/lib/auth/types";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (input: { email: string; password: string }) => Promise<string | null>;
  register: (input: {
    email: string;
    password: string;
    displayName?: string;
  }) => Promise<string | null>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth doit être utilisé dans AuthProvider.");
  }
  return value;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const current = await fetchCurrentUser();
    setUser(current);
  }, []);

  useEffect(() => {
    void refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = useCallback(async (input: { email: string; password: string }) => {
    const result = await loginUser(input);
    if ("error" in result) {
      return result.error;
    }
    setUser(result.user);
    return null;
  }, []);

  const register = useCallback(
    async (input: { email: string; password: string; displayName?: string }) => {
      const result = await registerUser(input);
      if ("error" in result) {
        return result.error;
      }
      setUser(result.user);
      return null;
    },
    [],
  );

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refresh,
    }),
    [user, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
