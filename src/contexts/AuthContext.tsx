import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminDb } from "@/integrations/supabase/adminClient";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  language: string;
  accountNumber: string;
  balance: number;
  accountStatus: "Active" | "Inactive";
  avatar?: string;
  pin?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (email: string, token: string) => Promise<{ success: boolean; error?: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateAvatar: (dataUrl: string) => void;
  updateUser: (updates: Partial<User>) => void;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  setTransactionPin: (pin: string) => void;
  resetPassword: (email: string) => Promise<boolean>;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  language: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    phone: data.phone || "",
    country: data.country || "",
    language: data.language || "English",
    accountNumber: data.account_number,
    balance: Number(data.balance),
    accountStatus: (data.account_status as "Active" | "Inactive") || "Active",
    avatar: data.avatar_url || undefined,
    pin: data.pin || undefined,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Restore session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        fetchProfile(session.user.id).then(profile => {
          if (mounted) {
            setUser(profile);
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for subsequent auth changes (no await inside callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (session?.user) {
        // Use setTimeout to avoid deadlock with Supabase internals
        setTimeout(() => {
          fetchProfile(session.user.id).then(profile => {
            if (mounted) {
              setUser(profile);
              setLoading(false);
            }
          });
        }, 0);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes("Email not confirmed")) {
        return { success: false, error: "Please verify your email before signing in. Check your inbox for the verification link." };
      }
      return { success: false, error: error.message };
    }
    return { success: true };
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone || "",
          country: data.country,
          language: data.language,
        },
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const verifyOtp = useCallback(async (email: string, token: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: "signup" });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const resendVerification = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const updateAvatar = useCallback((dataUrl: string) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, avatar: dataUrl };
      // Persist to DB
      supabase.from("profiles").update({ avatar_url: dataUrl }).eq("id", prev.id).then();
      return updated;
    });
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      // Map to DB columns
      const dbUpdates: Record<string, any> = {};
      if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
      if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.country !== undefined) dbUpdates.country = updates.country;
      if (updates.language !== undefined) dbUpdates.language = updates.language;
      if (Object.keys(dbUpdates).length > 0) {
        supabase.from("profiles").update(dbUpdates).eq("id", prev.id).then();
      }
      return updated;
    });
  }, []);

  const updatePassword = useCallback(async (_oldPassword: string, newPassword: string): Promise<boolean> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return !error;
  }, []);

  const setTransactionPin = useCallback((pin: string) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, pin };
      supabase.from("profiles").update({ pin }).eq("id", prev.id).then();
      return updated;
    });
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return !error;
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, loading, login, register, verifyOtp, resendVerification,
      logout, updateAvatar, updateUser, updatePassword, setTransactionPin, resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
