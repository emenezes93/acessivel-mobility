
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { AccessibleButton } from '@/components/AccessibleButton';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <AccessibleButton
      onClick={toggleTheme}
      variant="outline"
      size="sm"
      ariaLabel={`Alternar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
      voiceAnnouncement={`Modo ${theme === 'light' ? 'escuro' : 'claro'} ativado`}
      className="h-10 w-10 p-0"
    >
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </AccessibleButton>
  );
};
