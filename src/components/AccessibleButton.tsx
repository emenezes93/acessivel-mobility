
import React from 'react';
import { Button, ButtonProps } from "@/components/ui/button";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { cn } from "@/lib/utils";

interface AccessibleButtonProps extends ButtonProps {
  ariaLabel?: string;
  hapticFeedback?: boolean;
  voiceAnnouncement?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  ariaLabel,
  hapticFeedback = true,
  voiceAnnouncement,
  onClick,
  className,
  ...props
}) => {
  const { speak, vibrate, settings } = useAccessibility();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (hapticFeedback) {
      vibrate(200);
    }
    
    if (voiceAnnouncement) {
      speak(voiceAnnouncement);
    } else if (ariaLabel) {
      speak(ariaLabel);
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      aria-label={ariaLabel}
      className={cn(
        "min-h-[44px] min-w-[44px] text-lg font-semibold transition-all duration-200",
        "focus:ring-4 focus:ring-primary/50 focus:outline-none",
        "hover:scale-105 active:scale-95",
        settings.reducedMotion && "hover:scale-100 active:scale-100 transition-none",
        className
      )}
    >
      {children}
    </Button>
  );
};
