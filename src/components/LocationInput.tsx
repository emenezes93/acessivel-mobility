import React from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation } from 'lucide-react';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type: 'origin' | 'destination';
  ariaLabel: string;
}

export const LocationInput: React.FC<LocationInputProps> = ({ value, onChange, placeholder, type, ariaLabel }) => {
  const Icon = type === 'origin' ? MapPin : Navigation;
  const iconColor = type === 'origin' ? 'text-primary' : 'text-accent';

  return (
    <div className="relative">
      <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${iconColor}`} />
      <Input 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 bg-background/90 backdrop-blur-sm"
        aria-label={ariaLabel}
      />
    </div>
  );
};