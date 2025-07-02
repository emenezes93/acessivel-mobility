
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccessibilitySettings } from '../AccessibilitySettings';
import { AccessibilityContext } from '@/contexts/AccessibilityContext';

// Mock do contexto de acessibilidade
const mockSettings = {
  fontSize: 'normal',
  contrast: 'normal',
  voiceEnabled: false,
  hapticEnabled: true,
  reducedMotion: false,
  screenReader: false,
};

const mockUpdateSettings = vi.fn();
const mockSpeak = vi.fn();
const mockVibrate = vi.fn();

vi.mock('@/contexts/AccessibilityContext', () => ({
  useAccessibility: vi.fn().mockReturnValue({
    settings: mockSettings,
    updateSettings: mockUpdateSettings,
    speak: mockSpeak,
    vibrate: mockVibrate,
  }),
}));

describe('AccessibilitySettings', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    mockOnBack.mockClear();
    vi.clearAllMocks();
  });

  it('renders all accessibility settings sections', () => {
    render(<AccessibilitySettings onBack={mockOnBack} />);
    
    // Verifica se o título está presente
    expect(screen.getByText('Configurações de Acessibilidade')).toBeInTheDocument();
    
    // Verifica se todas as seções estão presentes
    expect(screen.getByText('Tamanho da Fonte')).toBeInTheDocument();
    expect(screen.getByText('Contraste')).toBeInTheDocument();
    expect(screen.getByText('Funcionalidades')).toBeInTheDocument();
    expect(screen.getByText('Teste de Acessibilidade')).toBeInTheDocument();
    
    // Verifica se o botão de voltar está presente
    expect(screen.getByLabelText('Voltar ao menu principal')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    render(<AccessibilitySettings onBack={mockOnBack} />);
    
    const backButton = screen.getByLabelText('Voltar ao menu principal');
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('renders font size options with correct selection', () => {
    render(<AccessibilitySettings onBack={mockOnBack} />);
    
    // Verifica se todas as opções de tamanho de fonte estão presentes
    expect(screen.getByLabelText('Normal (16px)')).toBeInTheDocument();
    expect(screen.getByLabelText('Grande (18px)')).toBeInTheDocument();
    expect(screen.getByLabelText('Extra Grande (24px)')).toBeInTheDocument();
    
    // Verifica se a opção 'normal' está selecionada por padrão
    expect(screen.getByLabelText('Normal (16px)')).toBeChecked();
    expect(screen.getByLabelText('Grande (18px)')).not.toBeChecked();
    expect(screen.getByLabelText('Extra Grande (24px)')).not.toBeChecked();
  });

  it('calls updateSettings and speak when font size is changed', () => {
    // Limpa os mocks para este teste
    mockUpdateSettings.mockClear();
    mockSpeak.mockClear();
    mockVibrate.mockClear();
    
    render(<AccessibilitySettings onBack={mockOnBack} />);
    
    // Clica na opção 'Grande (18px)'
    fireEvent.click(screen.getByLabelText('Grande (18px)'));
    
    // Verifica se updateSettings foi chamado com o valor correto
    expect(mockUpdateSettings).toHaveBeenCalledWith({ fontSize: 'large' });
    
    // Verifica se speak foi chamado com a mensagem correta
    expect(mockSpeak).toHaveBeenCalledWith('Tamanho da fonte alterado para Grande (18px)');
  });

  it('renders contrast options with correct selection', () => {
    render(<AccessibilitySettings onBack={mockOnBack} />);
    
    // Verifica se todas as opções de contraste estão presentes
    expect(screen.getByLabelText('Contraste Normal')).toBeInTheDocument();
    expect(screen.getByLabelText('Alto Contraste')).toBeInTheDocument();
    
    // Verifica se a opção 'normal' está selecionada por padrão
    expect(screen.getByLabelText('Contraste Normal')).toBeChecked();
    expect(screen.getByLabelText('Alto Contraste')).not.toBeChecked();
  });

  it('calls updateSettings and speak when contrast is changed', () => {
    // Limpa os mocks para este teste
    mockUpdateSettings.mockClear();
    mockSpeak.mockClear();
    mockVibrate.mockClear();
    
    render(<AccessibilitySettings onBack={mockOnBack} />);
    
    // Clica na opção 'Alto Contraste'
    fireEvent.click(screen.getByLabelText('Alto Contraste'));
    
    // Verifica se updateSettings foi chamado com o valor correto
    expect(mockUpdateSettings).toHaveBeenCalledWith({ contrast: 'high' });
    
    // Verifica se speak foi chamado com a mensagem correta
    expect(mockSpeak).toHaveBeenCalledWith('Contraste alterado para Alto Contraste');
  });

  it('renders functionality checkboxes with correct initial states', () => {
    render(<AccessibilitySettings onBack={mockOnBack} />);
    
    // Verifica se todos os checkboxes estão presentes
    expect(screen.getByLabelText('🎤 Comandos de Voz')).toBeInTheDocument();
    expect(screen.getByLabelText('📳 Feedback Tátil (Vibração)')).toBeInTheDocument();
    expect(screen.getByLabelText('🎭 Reduzir Animações')).toBeInTheDocument();
    expect(screen.getByLabelText('👁️ Otimizado para Leitor de Tela')).toBeInTheDocument();
    
    // Verifica os estados iniciais dos checkboxes
    expect(screen.getByLabelText('🎤 Comandos de Voz')).not.toBeChecked();
    expect(screen.getByLabelText('📳 Feedback Tátil (Vibração)')).toBeChecked();
    expect(screen.getByLabelText('🎭 Reduzir Animações')).not.toBeChecked();
    expect(screen.getByLabelText('👁️ Otimizado para Leitor de Tela')).not.toBeChecked();
  });

  it('calls updateSettings and speak when a checkbox is toggled', () => {
    // Limpa os mocks para este teste
    mockUpdateSettings.mockClear();
    mockSpeak.mockClear();
    mockVibrate.mockClear();
    
    render(<AccessibilitySettings onBack={mockOnBack} />);
    
    // Clica no checkbox 'Comandos de Voz'
    fireEvent.click(screen.getByLabelText('🎤 Comandos de Voz'));
    
    // Verifica se updateSettings foi chamado com o valor correto
    expect(mockUpdateSettings).toHaveBeenCalledWith({ voiceEnabled: true });
    
    // Verifica se speak foi chamado com a mensagem correta
    expect(mockSpeak).toHaveBeenCalledWith('Comandos de voz ativado');
  });

  it('renders test buttons and calls appropriate functions when clicked', () => {
    // Limpa os mocks para este teste
    mockUpdateSettings.mockClear();
    mockSpeak.mockClear();
    mockVibrate.mockClear();
    
    render(<AccessibilitySettings onBack={mockOnBack} />);
    
    // Verifica se os botões de teste estão presentes
    expect(screen.getByText('🔊 Testar Síntese de Voz')).toBeInTheDocument();
    expect(screen.getByText('📳 Testar Vibração')).toBeInTheDocument();
    
    // Clica no botão 'Testar Síntese de Voz'
    fireEvent.click(screen.getByText('🔊 Testar Síntese de Voz'));
    
    // Verifica se speak foi chamado com a mensagem correta
    expect(mockSpeak).toHaveBeenCalledWith(
      'Este é um teste de síntese de voz. Se você consegue ouvir esta mensagem, o sistema está funcionando corretamente.'
    );
  });
});
