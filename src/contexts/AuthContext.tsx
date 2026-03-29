import React, { createContext, useContext, useState, useCallback } from "react";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  language: string;
  accountNumber: string;
  balance: number;
  accountStatus: "Active" | "Inactive";
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateAvatar: (dataUrl: string) => void;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  language: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USERS: (User & { password: string })[] = [
  {
    id: "1",
    firstName: "Smith",
    lastName: "Johnson",
    email: "smith@svb.com",
    password: "Password123!",
    country: "United States",
    language: "English",
    accountNumber: "4076612345",
    balance: 832000,
    accountStatus: "Active",
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem("svb_user") || localStorage.getItem("svb_user");
    return stored ? JSON.parse(stored) : null;
  });

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
      const stored = sessionStorage.getItem("svb_user");
      if (stored) sessionStorage.setItem("svb_user", JSON.stringify(updated));
      const lstored = localStorage.getItem("svb_user");
      if (lstored) localStorage.setItem("svb_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
