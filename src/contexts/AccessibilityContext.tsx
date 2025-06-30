
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'extra-large';
  contrast: 'normal' | 'high';
  voiceEnabled: boolean;
  hapticEnabled: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  speak: (text: string) => void;
  vibrate: (pattern?: number | number[]) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 'normal',
    contrast: 'normal',
    voiceEnabled: false,
    hapticEnabled: true,
    reducedMotion: false,
    screenReader: false,
  });

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Check for system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setSettings(prev => ({ ...prev, reducedMotion: true }));
    }
  }, []);

  useEffect(() => {
    // Apply settings to document
    const root = document.documentElement;
    
    // Font size
    switch (settings.fontSize) {
      case 'large':
        root.style.fontSize = '18px';
        break;
      case 'extra-large':
        root.style.fontSize = '24px';
        break;
      default:
        root.style.fontSize = '16px';
    }

    // Contrast
    if (settings.contrast === 'high') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Save settings
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const speak = (text: string) => {
    if (settings.voiceEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const vibrate = (pattern: number | number[] = 200) => {
    if (settings.hapticEnabled && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, speak, vibrate }}>
      {children}
    </AccessibilityContext.Provider>
  );
};
