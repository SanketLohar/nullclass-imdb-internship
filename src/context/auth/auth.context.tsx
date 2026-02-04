"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { User } from "./auth.types";

type AuthContextValue = {
  user: User | null;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "mock-auth-user";

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
  }, []);

  function login() {
    // Generate unique user ID for this session
    const userId = localStorage.getItem("user-id") || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("user-id", userId);

    const mockUser: User = {
      id: "user-moviedb-user",
      name: "MovieDB_User",
      username: "MovieDB_User",
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(mockUser)
    );

    setUser(mockUser);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }
  return ctx;
}
