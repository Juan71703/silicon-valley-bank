import React, { createContext, useContext, useState, useCallback } from "react";

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
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateAvatar: (dataUrl: string) => void;
  updateUser: (updates: Partial<User>) => void;
  updatePassword: (oldPassword: string, newPassword: string) => boolean;
  setTransactionPin: (pin: string) => void;
  resetPassword: (email: string) => string | null;
  verifyResetCode: (email: string, code: string) => boolean;
  completePasswordReset: (email: string, newPassword: string) => boolean;
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

const MOCK_USERS: (User & { password: string })[] = [
  {
    id: "1",
    firstName: "Smith",
    lastName: "Johnson",
    email: "smith@svb.com",
    phone: "+1 (555) 123-4567",
    password: "Password123!",
    country: "United States",
    language: "English",
    accountNumber: "4076612345",
    balance: 832000,
    accountStatus: "Active",
  },
];

// Store reset codes
const resetCodes: Record<string, string> = {};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem("svb_user") || localStorage.getItem("svb_user");
    return stored ? JSON.parse(stored) : null;
  });

  const persistUser = (userData: User, remember?: boolean) => {
    const existing = localStorage.getItem("svb_user");
    if (remember || existing) {
      localStorage.setItem("svb_user", JSON.stringify(userData));
    } else {
      sessionStorage.setItem("svb_user", JSON.stringify(userData));
    }
  };

  const login = useCallback(async (email: string, password: string, remember = false) => {
    const found = MOCK_USERS.find((u) => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...userData } = found;
      setUser(userData);
      if (remember) {
        localStorage.setItem("svb_user", JSON.stringify(userData));
      } else {
        sessionStorage.setItem("svb_user", JSON.stringify(userData));
      }
      return true;
    }
    return false;
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || "",
      country: data.country,
      language: data.language,
      accountNumber: `407${Math.floor(1000000 + Math.random() * 9000000)}`,
      balance: 0,
      accountStatus: "Active",
    };
    MOCK_USERS.push({ ...newUser, password: data.password });
    setUser(newUser);
    sessionStorage.setItem("svb_user", JSON.stringify(newUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem("svb_user");
    localStorage.removeItem("svb_user");
  }, []);

  const updateAvatar = useCallback((dataUrl: string) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, avatar: dataUrl };
      sessionStorage.setItem("svb_user", JSON.stringify(updated));
      localStorage.setItem("svb_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      sessionStorage.setItem("svb_user", JSON.stringify(updated));
      localStorage.setItem("svb_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updatePassword = useCallback((oldPassword: string, newPassword: string): boolean => {
    if (!user) return false;
    const found = MOCK_USERS.find(u => u.id === user.id);
    if (!found || found.password !== oldPassword) return false;
    found.password = newPassword;
    return true;
  }, [user]);

  const setTransactionPin = useCallback((pin: string) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, pin };
      sessionStorage.setItem("svb_user", JSON.stringify(updated));
      localStorage.setItem("svb_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetPassword = useCallback((email: string): string | null => {
    const found = MOCK_USERS.find(u => u.email === email);
    if (!found) return null;
    const code = String(Math.floor(100000 + Math.random() * 900000));
    resetCodes[email] = code;
    return code;
  }, []);

  const verifyResetCode = useCallback((email: string, code: string): boolean => {
    return resetCodes[email] === code;
  }, []);

  const completePasswordReset = useCallback((email: string, newPassword: string): boolean => {
    const found = MOCK_USERS.find(u => u.email === email);
    if (!found) return false;
    found.password = newPassword;
    delete resetCodes[email];
    return true;
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, login, register, logout,
      updateAvatar, updateUser, updatePassword, setTransactionPin,
      resetPassword, verifyResetCode, completePasswordReset,
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
