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
  registerStoredUser,
  updateStoredProfile,
} from "@/lib/auth/storage";
import type { ProfileUpdateInput, RegisterInput, UserProfile } from "@/lib/auth/types";

type AuthContextValue = {
  user: UserProfile | null;
  loading: boolean;
  register: (input: RegisterInput) => Promise<UserProfile>;
  login: (email: string, password: string) => Promise<UserProfile>;
  logout: () => void;
  updateProfile: (input: ProfileUpdateInput) => Promise<UserProfile>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredSessionUser());
    setLoading(false);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const profile = registerStoredUser(input);
    setUser(profile);
    return profile;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const profile = loginStoredUser(email, password);
    setUser(profile);
    return profile;
  }, []);

  const logout = useCallback(() => {
    logoutStoredUser();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (input: ProfileUpdateInput) => {
    if (!user) {
      throw new Error("You must be signed in to update your profile.");
    }

    const profile = updateStoredProfile(user.id, input);
    setUser(profile);
    return profile;
  }, [user]);

  const value = useMemo(
    () => ({ user, loading, register, login, logout, updateProfile }),
    [user, loading, register, login, logout, updateProfile],
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
