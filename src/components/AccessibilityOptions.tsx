import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Accessibility, Ear, Eye } from 'lucide-react';

interface AccessibilityOptionsProps {
  options: string[];
  onToggle: (option: string[]) => void;
}

export const AccessibilityOptions: React.FC<AccessibilityOptionsProps> = ({ options, onToggle }) => {
  const accessibilityItems = [
    { id: 'wheelchair', label: 'Cadeirante', icon: Accessibility },
    { id: 'hearingImpaired', label: 'Def. Auditivo', icon: Ear },
    { id: 'visuallyImpaired', label: 'Def. Visual', icon: Eye },
  ];

  return (
    <div>
      <h3 className="font-semibold mb-2">Necessidades Especiais</h3>
      <ToggleGroup 
        type="multiple" 
        value={options}
        onValueChange={onToggle}
        className="justify-start"
        aria-label="Opções de acessibilidade"
      >
        {accessibilityItems.map(item => (
          <ToggleGroupItem 
            key={item.id} 
            value={item.id} 
            aria-label={item.label}
            className="flex flex-col h-auto p-2"
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};