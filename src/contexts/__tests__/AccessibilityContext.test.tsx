import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccessibilityProvider, useAccessibility } from '../AccessibilityContext';

// Componente de teste para acessar o contexto
const TestComponent = () => {
  const { settings, updateSettings, speak, vibrate } = useAccessibility();
  
  return (
    <div>
      <div data-testid="settings">{JSON.stringify(settings)}</div>
      <button 
        onClick={() => updateSettings({ fontSize: 'large' })}
        data-testid="update-font"
      >
        Update Font Size
      </button>
      <button 
        onClick={() => speak('Test speech')}
        data-testid="speak-button"
      >
        Speak
      </button>
      <button 
        onClick={() => vibrate(300)}
        data-testid="vibrate-button"
      >
        Vibrate
      </button>
    </div>
  );
};

describe('AccessibilityContext', () => {
  // Mock para localStorage
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => {
        store[key] = value.toString();
      }),
      removeItem: vi.fn((key) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      length: 0,
      key: vi.fn(() => null),
    };
  })();

  // Usaremos os mocks globais definidos em setup.ts
  const mockVibrate = vi.fn();
  const mockSpeechSynthesis = {
    speak: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.localStorage = localStorageMock as any;
    // Substituir os métodos dos mocks globais por spies
    vi.spyOn(global.speechSynthesis, 'speak').mockImplementation(mockSpeechSynthesis.speak);
    vi.spyOn(global.navigator, 'vibrate').mockImplementation(mockVibrate);
    localStorageMock.clear();
  });

  it('provides default settings when no saved settings exist', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );
    
    const settingsElement = screen.getByTestId('settings');
    const settings = JSON.parse(settingsElement.textContent);
    
    expect(settings).toEqual({
      fontSize: 'normal',
      contrast: 'normal',
      voiceEnabled: false,
      hapticEnabled: true,
      reducedMotion: false,
      screenReader: false,
    });
  });

  it('loads saved settings from localStorage', () => {
    // Configura localStorage com configurações salvas
    const savedSettings = {
      fontSize: 'large',
      contrast: 'high',
      voiceEnabled: true,
      hapticEnabled: false,
      reducedMotion: true,
      screenReader: true,
    };
    
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedSettings));
    
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );
    
    const settingsElement = screen.getByTestId('settings');
    const settings = JSON.parse(settingsElement.textContent);
    
    expect(settings).toEqual(savedSettings);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('accessibilitySettings');
  });

  it('updates settings correctly', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );
    
    // Verifica as configurações iniciais
    let settingsElement = screen.getByTestId('settings');
    let settings = JSON.parse(settingsElement.textContent);
    expect(settings.fontSize).toBe('normal');
    
    // Atualiza o tamanho da fonte
    const updateButton = screen.getByTestId('update-font');
    fireEvent.click(updateButton);
    
    // Verifica se as configurações foram atualizadas
    settingsElement = screen.getByTestId('settings');
    settings = JSON.parse(settingsElement.textContent);
    expect(settings.fontSize).toBe('large');
    
    // Verifica se as configurações foram salvas no localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'accessibilitySettings',
      expect.any(String)
    );
    
    const savedSettings = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedSettings.fontSize).toBe('large');
  });

  it('calls speech synthesis when speak is called and voiceEnabled is true', () => {
    // Configura localStorage com voiceEnabled = true
    const savedSettings = {
      fontSize: 'normal',
      contrast: 'normal',
      voiceEnabled: true,
      hapticEnabled: true,
      reducedMotion: false,
      screenReader: false,
    };
    
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedSettings));
    
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );
    
    // Clica no botão para falar
    const speakButton = screen.getByTestId('speak-button');
    fireEvent.click(speakButton);
    
    // Verifica se speechSynthesis.speak foi chamado
    expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    
    // Verifica se speechSynthesis.speak foi chamado
    expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
  });

  it('does not call speech synthesis when voiceEnabled is false', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );
    
    // Clica no botão para falar
    const speakButton = screen.getByTestId('speak-button');
    fireEvent.click(speakButton);
    
    // Verifica se speechSynthesis.speak não foi chamado
    expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled();
    
    // Verifica se speechSynthesis.speak não foi chamado
    expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled();
  });

  it('calls navigator.vibrate when vibrate is called and hapticEnabled is true', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );
    
    // Clica no botão para vibrar
    const vibrateButton = screen.getByTestId('vibrate-button');
    fireEvent.click(vibrateButton);
    
    // Verifica se navigator.vibrate foi chamado com o padrão correto
    expect(mockVibrate).toHaveBeenCalledWith(300);
  });

  it('applies font size to document root', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );
    
    // Atualiza o tamanho da fonte
    const updateButton = screen.getByTestId('update-font');
    fireEvent.click(updateButton);
    
    // Verifica se o tamanho da fonte foi aplicado ao elemento raiz
    expect(document.documentElement.style.fontSize).toBe('18px');
  });
});
