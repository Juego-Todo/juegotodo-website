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
  getStoredSessionUser,
  loginStoredUser,
  logoutStoredUser,
  migrateLegacyRememberedCredentials,
  registerStoredUser,
  requestPasswordReset,
  subscribeAuthChanges,
  updateStoredPassword,
  updateStoredProfile,
  usesSupabaseBackend,
} from "@/lib/auth/storage";
import type { ProfileUpdateInput, RegisterInput, UserProfile } from "@/lib/auth/types";

type AuthContextValue = {
  user: UserProfile | null;
  loading: boolean;
  usesSupabase: boolean;
  register: (input: RegisterInput) => Promise<UserProfile>;
  login: (email: string, password: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateProfile: (input: ProfileUpdateInput) => Promise<UserProfile>;
  refreshUser: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ delivery: "email" | "demo" }>;
  updatePassword: (email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const usesSupabase = usesSupabaseBackend();

  useEffect(() => {
    let active = true;
    let authEventReceived = false;

    migrateLegacyRememberedCredentials();

    getStoredSessionUser()
      .then((profile) => {
        if (active && !authEventReceived) {
          setUser(profile);
        }
      })
      .catch(() => {
        if (active && !authEventReceived) {
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    const unsubscribe = subscribeAuthChanges((profile) => {
      if (active) {
        authEventReceived = true;
        setUser(profile);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const profile = await registerStoredUser(input);
    setUser(profile);
    return profile;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const profile = await loginStoredUser(email, password);
    setUser(profile);
    return profile;
  }, []);

  const logout = useCallback(async () => {
    await logoutStoredUser();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (input: ProfileUpdateInput) => {
      if (!user) {
        throw new Error("You must be signed in to update your profile.");
      }

      const profile = await updateStoredProfile(user.id, input);
      setUser(profile);
      return profile;
    },
    [user],
  );

  const refreshUser = useCallback(async () => {
    const profile = await getStoredSessionUser();
    setUser(profile);
  }, []);

  const requestPasswordResetFn = useCallback(async (email: string) => {
    return requestPasswordReset(email);
  }, []);

  const updatePassword = useCallback(async (email: string, password: string) => {
    await updateStoredPassword(email, password);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      usesSupabase,
      register,
      login,
      logout,
      updateProfile,
      refreshUser,
      requestPasswordReset: requestPasswordResetFn,
      updatePassword,
    }),
    [user, loading, usesSupabase, register, login, logout, updateProfile, refreshUser, requestPasswordResetFn, updatePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
