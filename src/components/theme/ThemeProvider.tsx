"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "auto" | "high-contrast";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("auto");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load from cookie first, then localStorage
    const cookieTheme = getCookie("theme") as Theme;
    const stored = (cookieTheme || localStorage.getItem("theme")) as Theme;
    if (stored && ["light", "dark", "auto", "high-contrast"].includes(stored)) {
      setThemeState(stored);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const resolved = getResolvedTheme(theme);

    // Remove all theme classes
    root.classList.remove("light", "dark", "high-contrast");

    // Add current theme class
    if (theme === "high-contrast") {
      root.classList.add("dark", "high-contrast");
    } else if (theme !== "auto") {
      root.classList.add(theme);
    } else {
      root.classList.add(resolved);
    }

    // Update CSS variables
    root.style.colorScheme = resolved;

    // Persist to cookie and localStorage
    setCookie("theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const resolvedTheme = getResolvedTheme(theme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function getResolvedTheme(theme: Theme): "light" | "dark" {
  if (theme === "auto") {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  }
  if (theme === "high-contrast") return "dark";
  return theme;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
