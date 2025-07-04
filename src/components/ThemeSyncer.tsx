"use client";
import { useEffect } from "react";

export default function ThemeSyncer() {
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    console.log("[ThemeSyncer] stored theme:", stored, "system dark:", isSystemDark);
    if (stored === "dark" || (!stored && isSystemDark)) {
      document.documentElement.classList.add("dark");
      console.log("[ThemeSyncer] Added 'dark' class to <html>");
    } else {
      document.documentElement.classList.remove("dark");
      console.log("[ThemeSyncer] Removed 'dark' class from <html>");
    }
  }, []);
  return null;
} 