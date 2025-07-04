"use client";

import { useTheme } from "@/components/ThemeProvider";

const THEME_OPTIONS = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl mb-8 text-center">
        This box should change color when you toggle the theme.
      </div>
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Settings</h1>
        <div className="mb-4">
          <span className="text-lg text-gray-800 dark:text-gray-200 block mb-2">Appearance</span>
          <div className="flex space-x-4">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value as any)}
                className={`px-5 py-2 rounded-lg font-medium border transition-colors duration-200 focus:outline-none
                  ${theme === opt.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"}
                `}
                aria-pressed={theme === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          Choose your preferred appearance. "System" will follow your device's theme.
        </p>
      </div>
    </div>
  );
} 