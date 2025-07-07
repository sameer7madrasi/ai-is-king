"use client";

import { useTheme } from "@/components/ThemeProvider";
import { useBackground, BackgroundType } from "@/components/BackgroundProvider";
import { useState } from "react";

const THEME_OPTIONS = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

const BACKGROUND_OPTIONS = [
  { label: "Default (90s Coded)", value: "default" as BackgroundType },
  { label: "Custom Color", value: "custom" as BackgroundType },
  { label: "Custom Gradient", value: "gradient" as BackgroundType },
  { label: "Custom Image", value: "image" as BackgroundType },
];

const PRESET_GRADIENTS = [
  { name: "Sunset", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Ocean", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Forest", value: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
  { name: "Fire", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { name: "Midnight", value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { background, setBackground } = useBackground();
  const [customColor, setCustomColor] = useState(background.customColor || "#f8fafc");
  const [customGradient, setCustomGradient] = useState(background.customGradient || PRESET_GRADIENTS[0].value);
  const [customImage, setCustomImage] = useState(background.customImage || "");

  const handleBackgroundChange = (type: BackgroundType) => {
    setBackground({
      type,
      customColor: type === 'custom' ? customColor : undefined,
      customGradient: type === 'gradient' ? customGradient : undefined,
      customImage: type === 'image' ? customImage : undefined,
    });
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    if (background.type === 'custom') {
      setBackground({
        ...background,
        customColor: color,
      });
    }
  };

  const handleCustomGradientChange = (gradient: string) => {
    setCustomGradient(gradient);
    if (background.type === 'gradient') {
      setBackground({
        ...background,
        customGradient: gradient,
      });
    }
  };

  const handleCustomImageChange = (imageUrl: string) => {
    setCustomImage(imageUrl);
    if (background.type === 'image') {
      setBackground({
        ...background,
        customImage: imageUrl,
      });
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Settings</h1>
        
        {/* Appearance Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Appearance</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <div className="flex space-x-3">
                {THEME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value as any)}
                    className={`px-4 py-2 rounded-lg font-medium border transition-colors duration-200 focus:outline-none
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
          </div>
        </div>

        {/* Background Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Background</h2>
          <div className="space-y-6">
            {/* Background Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Background Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {BACKGROUND_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleBackgroundChange(option.value)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                      background.type === option.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                    }`}
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Picker */}
            {background.type === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="#f8fafc"
                  />
                </div>
              </div>
            )}

            {/* Custom Gradient Picker */}
            {background.type === 'gradient' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Gradient
                </label>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_GRADIENTS.map((gradient) => (
                      <button
                        key={gradient.name}
                        onClick={() => handleCustomGradientChange(gradient.value)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                          customGradient === gradient.value
                            ? "border-blue-500"
                            : "border-gray-200 dark:border-gray-600"
                        }`}
                        style={{ background: gradient.value }}
                      >
                        <span className="text-sm font-medium text-white drop-shadow-lg">
                          {gradient.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={customGradient}
                    onChange={(e) => handleCustomGradientChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  />
                </div>
              </div>
            )}

            {/* Custom Image URL */}
            {background.type === 'image' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={customImage}
                  onChange={(e) => handleCustomImageChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="https://example.com/image.jpg"
                />
                {customImage && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preview
                    </label>
                    <div 
                      className="w-full h-32 rounded-lg border-2 border-gray-200 dark:border-gray-600"
                      style={{
                        backgroundImage: `url(${customImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Preview</h2>
          <div 
            className="w-full h-32 rounded-lg border-2 border-gray-200 dark:border-gray-600 relative overflow-hidden"
            style={background.type === 'default' ? {
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            } : background.type === 'custom' ? {
              backgroundColor: customColor
            } : background.type === 'gradient' ? {
              background: customGradient
            } : background.type === 'image' ? {
              backgroundImage: `url(${customImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            } : {}}
          >
            {/* 90s elements for default background */}
            {background.type === 'default' && (
              <>
                <div className="absolute top-4 left-4 w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute top-8 right-6 w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg opacity-60 animate-bounce"></div>
                <div className="absolute bottom-6 left-6 w-10 h-10 bg-gradient-to-r from-green-400 to-blue-400 transform rotate-45 opacity-60 animate-pulse"></div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 