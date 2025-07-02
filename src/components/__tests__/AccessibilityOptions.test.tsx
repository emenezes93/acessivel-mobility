import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AccessibilityOptions } from '../AccessibilityOptions';

describe('AccessibilityOptions', () => {
  const mockOnToggle = vi.fn();
  
  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  it('renders correctly with no options selected', () => {
    render(<AccessibilityOptions options={[]} onToggle={mockOnToggle} />);
    
    // Verifica se o título está presente
    expect(screen.getByText('Necessidades Especiais')).toBeInTheDocument();
    
    // Verifica se todos os itens de acessibilidade estão presentes
    expect(screen.getByText('Cadeirante')).toBeInTheDocument();
    expect(screen.getByText('Def. Auditivo')).toBeInTheDocument();
    expect(screen.getByText('Def. Visual')).toBeInTheDocument();
    
    // Verifica se os ícones estão presentes (pelo aria-label)
    expect(screen.getByLabelText('Cadeirante')).toBeInTheDocument();
    expect(screen.getByLabelText('Def. Auditivo')).toBeInTheDocument();
    expect(screen.getByLabelText('Def. Visual')).toBeInTheDocument();
  });

  it('renders correctly with pre-selected options', () => {
    render(<AccessibilityOptions 
      options={['wheelchair', 'visuallyImpaired']} 
      onToggle={mockOnToggle} 
    />);
    
    // Verifica se os itens selecionados têm a classe correta
    const wheelchairItem = screen.getByLabelText('Cadeirante');
    const visuallyImpairedItem = screen.getByLabelText('Def. Visual');
    const hearingImpairedItem = screen.getByLabelText('Def. Auditivo');
    
    // Verifica se os itens estão selecionados corretamente
    expect(wheelchairItem).toHaveAttribute('data-state', 'on');
    expect(visuallyImpairedItem).toHaveAttribute('data-state', 'on');
    expect(hearingImpairedItem).toHaveAttribute('data-state', 'off');
  });

  it('calls onToggle when an option is clicked', () => {
    render(<AccessibilityOptions options={[]} onToggle={mockOnToggle} />);
    
    // Clica em um item
    fireEvent.click(screen.getByLabelText('Cadeirante'));
    
    // Verifica se a função onToggle foi chamada com o valor correto
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
    expect(mockOnToggle).toHaveBeenCalledWith(['wheelchair']);
    
    // Clica em outro item
    fireEvent.click(screen.getByLabelText('Def. Visual'));
    
    // Verifica se a função onToggle foi chamada novamente com o valor correto
    expect(mockOnToggle).toHaveBeenCalledTimes(2);
    expect(mockOnToggle).toHaveBeenCalledWith(['wheelchair', 'visuallyImpaired']);
  });

  it('removes an option when clicked again', () => {
    render(<AccessibilityOptions 
      options={['wheelchair', 'visuallyImpaired']} 
      onToggle={mockOnToggle} 
    />);
    
    // Clica em um item já selecionado
    fireEvent.click(screen.getByLabelText('Cadeirante'));
    
    // Verifica se a função onToggle foi chamada com o valor correto (removendo o item)
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
    expect(mockOnToggle).toHaveBeenCalledWith(['visuallyImpaired']);
  });
});