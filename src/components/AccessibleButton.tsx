
import React from 'react';
import { Button, ButtonProps } from "@/components/ui/button";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { cn } from "@/lib/utils";

interface AccessibleButtonProps extends Omit<ButtonProps, 'variant'> {
  ariaLabel?: string;
  hapticFeedback?: boolean;
  voiceAnnouncement?: string;
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  ariaLabel,
  hapticFeedback = true,
  voiceAnnouncement,
  onClick,
  className,
  variant = 'primary',
  ...props
}) => {
  const { speak, vibrate, settings } = useAccessibility();

  // Map our custom variants to shadcn variants
  const getButtonVariant = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'default';
      case 'secondary':
        return 'secondary';
      case 'destructive':
        return 'destructive';
      case 'outline':
        return 'outline';
      case 'ghost':
        return 'ghost';
      case 'link':
        return 'link';
      default:
        return 'default';
    }
  };

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
      variant={getButtonVariant(variant)}
      onClick={handleClick}
      aria-label={ariaLabel}
      className={cn(
        "min-h-[44px] min-w-[44px] font-medium transition-all duration-200",
        "focus:ring-2 focus:ring-primary/20 focus:outline-none",
        "active:scale-[0.98]",
        // Uber-style button variants
        variant === 'primary' && "bg-primary hover:bg-primary/90 text-white shadow-sm",
        variant === 'outline' && "border-gray-200 hover:bg-gray-50 text-gray-700",
        variant === 'ghost' && "hover:bg-gray-100 text-gray-700",
        variant === 'secondary' && "bg-gray-100 hover:bg-gray-200 text-gray-700",
        settings.reducedMotion && "active:scale-100 transition-none",
        className
      )}
    >
      {children}
    </Button>
  );
};
