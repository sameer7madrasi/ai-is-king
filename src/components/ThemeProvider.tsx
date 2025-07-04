"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme | null>(null);

  useEffect(() => {
    let stored = (typeof window !== 'undefined' && localStorage.getItem("theme")) as Theme | null;
    if (!stored) stored = "system";
    setThemeState(stored);
    applyTheme(stored);
    console.log("[ThemeProvider] Mounted. Initial theme:", stored);
    if (stored === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    }
  }, []);

  function applyTheme(selected: Theme) {
    console.log("[ThemeProvider] Applying theme:", selected);
    if (selected === "dark") {
      document.documentElement.classList.add("dark");
      console.log("[ThemeProvider] Added 'dark' class to <html>");
    } else if (selected === "light") {
      document.documentElement.classList.remove("dark");
      console.log("[ThemeProvider] Removed 'dark' class from <html>");
    } else {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isDark) {
        document.documentElement.classList.add("dark");
        console.log("[ThemeProvider] System is dark, added 'dark' class");
      } else {
        document.documentElement.classList.remove("dark");
        console.log("[ThemeProvider] System is light, removed 'dark' class");
      }
    }
  }

  function setTheme(theme: Theme) {
    setThemeState(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem("theme", theme);
      applyTheme(theme);
      console.log("[ThemeProvider] setTheme called with:", theme);
    }
  }

  if (theme === null) return null;

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
} 