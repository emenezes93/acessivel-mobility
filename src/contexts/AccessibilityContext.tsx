
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
  vibrate: (pattern: number | number[]) => void;
}

export const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

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
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    
    // Apply font size to document root
    const fontSizes = {
      normal: '16px',
      large: '18px',
      'extra-large': '24px'
    };
    document.documentElement.style.fontSize = fontSizes[settings.fontSize];
    
    // Apply contrast
    if (settings.contrast === 'high') {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const speak = (text: string) => {
    if (settings.voiceEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      speechSynthesis.speak(utterance);
    }
  };

  const vibrate = (pattern: number | number[]) => {
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
