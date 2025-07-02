
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserProvider, useUser } from '../UserContext';

// Componente de teste para acessar o contexto
const TestComponent = () => {
  const { user, setUser, updateUser } = useUser();
  
  return (
    <div>
      <div data-testid="user-data">{user ? JSON.stringify(user) : 'No user'}</div>
      <button 
        onClick={() => setUser({
          id: '123',
          name: 'Teste',
          email: 'teste@example.com',
          phone: '123456789',
          userType: 'passenger',
          accessibilityNeeds: {
            visualImpairment: false,
            hearingImpairment: false,
            mobilityImpairment: true,
            cognitiveImpairment: false,
            preferredInterface: 'visual'
          },
          emergencyContacts: []
        })}
        data-testid="set-user"
      >
        Set User
      </button>
      <button 
        onClick={() => updateUser({ name: 'Nome Atualizado' })}
        data-testid="update-user"
      >
        Update User
      </button>
    </div>
  );
};

describe('UserContext', () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
    global.localStorage = localStorageMock as any;
    localStorageMock.clear();
  });

  it('provides null user by default', () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );
    
    const userDataElement = screen.getByTestId('user-data');
    expect(userDataElement.textContent).toBe('No user');
  });

  it('allows setting a user', () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );
    
    // Verifica o estado inicial
    let userDataElement = screen.getByTestId('user-data');
    expect(userDataElement.textContent).toBe('No user');
    
    // Define um usuário
    const setUserButton = screen.getByTestId('set-user');
    fireEvent.click(setUserButton);
    
    // Verifica se o usuário foi definido
    userDataElement = screen.getByTestId('user-data');
    const userData = JSON.parse(userDataElement.textContent);
    expect(userData.id).toBe('123');
    expect(userData.name).toBe('Teste');
    expect(userData.email).toBe('teste@example.com');
    expect(userData.userType).toBe('passenger');
  });

  it('allows updating a user', () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );
    
    // Define um usuário
    const setUserButton = screen.getByTestId('set-user');
    fireEvent.click(setUserButton);
    
    // Atualiza o usuário
    const updateUserButton = screen.getByTestId('update-user');
    fireEvent.click(updateUserButton);
    
    // Verifica se o usuário foi atualizado
    const userDataElement = screen.getByTestId('user-data');
    const userData = JSON.parse(userDataElement.textContent);
    expect(userData.name).toBe('Nome Atualizado');
    expect(userData.email).toBe('teste@example.com'); // Outros campos permanecem inalterados
    
    // Verifica se o usuário foi salvo no localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user', expect.any(String));
    const savedUser = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedUser.name).toBe('Nome Atualizado');
  });

  it('does not update user when user is null', () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );
    
    // Tenta atualizar o usuário sem defini-lo primeiro
    const updateUserButton = screen.getByTestId('update-user');
    fireEvent.click(updateUserButton);
    
    // Verifica se o usuário continua nulo
    const userDataElement = screen.getByTestId('user-data');
    expect(userDataElement.textContent).toBe('No user');
    
    // Verifica se o localStorage não foi chamado
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });
});
