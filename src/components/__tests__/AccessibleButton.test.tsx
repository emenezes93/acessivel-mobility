
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { AccessibleButton } from '../AccessibleButton';
import { AccessibilityContext } from '@/contexts/AccessibilityContext';

// Mock do contexto de acessibilidade
const mockSpeak = vi.fn();
const mockVibrate = vi.fn();
const mockSettings = {
  fontSize: 'normal',
  contrast: 'normal',
  voiceEnabled: true,
  hapticEnabled: true,
  reducedMotion: false,
  screenReader: false,
};

vi.mock('@/contexts/AccessibilityContext', () => ({
  useAccessibility: vi.fn().mockReturnValue({
    settings: mockSettings,
    speak: mockSpeak,
    vibrate: mockVibrate,
  }),
}));

describe('AccessibleButton', () => {
  it('renders correctly with default props', () => {
    render(<AccessibleButton>Test Button</AccessibleButton>);
    
    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
  });

  it('renders with correct variant classes', () => {
    const { rerender } = render(
      <AccessibleButton variant="secondary">Secondary</AccessibleButton>
    );
    
    let button = screen.getByRole('button', { name: 'Secondary' });
    expect(button).toHaveClass('bg-gray-100');
    
    rerender(<AccessibleButton variant="destructive">Destructive</AccessibleButton>);
    button = screen.getByRole('button', { name: 'Destructive' });
    expect(button).toHaveClass('bg-destructive');
    
    rerender(<AccessibleButton variant="outline">Outline</AccessibleButton>);
    button = screen.getByRole('button', { name: 'Outline' });
    expect(button).toHaveClass('border-gray-200');
    
    rerender(<AccessibleButton variant="ghost">Ghost</AccessibleButton>);
    button = screen.getByRole('button', { name: 'Ghost' });
    expect(button).toHaveClass('hover:bg-gray-100');
    
    rerender(<AccessibleButton variant="link">Link</AccessibleButton>);
    button = screen.getByRole('button', { name: 'Link' });
    expect(button).toHaveClass('text-primary');
  });

  it('applies aria-label correctly', () => {
    render(<AccessibleButton ariaLabel="Accessible Label">Button</AccessibleButton>);
    
    const button = screen.getByRole('button', { name: 'Accessible Label' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Accessible Label');
  });

  it('calls accessibility functions on click', () => {
    const { useAccessibility } = require('@/contexts/AccessibilityContext');
    const mockOnClick = vi.fn();
    
    // Limpa os mocks para este teste
    mockSpeak.mockClear();
    mockVibrate.mockClear();
    
    render(
      <AccessibleButton 
        onClick={mockOnClick} 
        voiceAnnouncement="Button clicked"
      >
        Click Me
      </AccessibleButton>
    );
    
    const button = screen.getByRole('button', { name: 'Click Me' });
    fireEvent.click(button);
    
    expect(mockVibrate).toHaveBeenCalledWith(200);
    expect(mockSpeak).toHaveBeenCalledWith('Button clicked');
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('uses ariaLabel for voice announcement when voiceAnnouncement is not provided', () => {
    // Limpa os mocks para este teste
    mockSpeak.mockClear();
    mockVibrate.mockClear();
    
    render(
      <AccessibleButton ariaLabel="Accessible Label">
        Click Me
      </AccessibleButton>
    );
    
    const button = screen.getByRole('button', { name: 'Accessible Label' });
    fireEvent.click(button);
    
    expect(mockSpeak).toHaveBeenCalledWith('Accessible Label');
  });

  it('applies reduced motion styles when reducedMotion is enabled', () => {
    const { useAccessibility } = require('@/contexts/AccessibilityContext');
    
    // Modifica as configurações para este teste
    const originalSettings = {...mockSettings};
    mockSettings.reducedMotion = true;
    
    // Restaura as configurações após o teste
    afterEach(() => {
      Object.assign(mockSettings, originalSettings);
    });
    
    render(<AccessibleButton>Reduced Motion</AccessibleButton>);
    
    const button = screen.getByRole('button', { name: 'Reduced Motion' });
    expect(button).toHaveClass('active:scale-100');
    expect(button).toHaveClass('transition-none');
  });
});
