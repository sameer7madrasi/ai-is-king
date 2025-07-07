"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type BackgroundType = 'default' | 'custom' | 'gradient' | 'image';

export interface BackgroundSettings {
  type: BackgroundType;
  customGradient?: string;
  customImage?: string;
  customColor?: string;
}

interface BackgroundContextType {
  background: BackgroundSettings;
  setBackground: (settings: BackgroundSettings) => void;
  getBackgroundStyle: () => React.CSSProperties;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

const DEFAULT_BACKGROUND: BackgroundSettings = {
  type: 'default',
};

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const [background, setBackgroundState] = useState<BackgroundSettings>(DEFAULT_BACKGROUND);

  useEffect(() => {
    // Load background settings from localStorage
    const saved = localStorage.getItem('background-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBackgroundState(parsed);
      } catch (error) {
        console.error('Failed to parse background settings:', error);
      }
    }
  }, []);

  const setBackground = (settings: BackgroundSettings) => {
    setBackgroundState(settings);
    localStorage.setItem('background-settings', JSON.stringify(settings));
  };

  const getBackgroundStyle = (): React.CSSProperties => {
    switch (background.type) {
      case 'custom':
        return {
          backgroundColor: background.customColor || '#f8fafc',
        };
      case 'gradient':
        return {
          background: background.customGradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        };
      case 'image':
        return {
          backgroundImage: `url(${background.customImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        };
      default:
        return {
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        };
    }
  };

  return (
    <BackgroundContext.Provider value={{ background, setBackground, getBackgroundStyle }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
} 