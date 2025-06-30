
import React, { useState } from 'react';
import { AccessibleButton } from "@/components/AccessibleButton";
import { RideRequestForm } from "@/components/RideRequestForm";
import { AccessibilitySettings } from "@/components/AccessibilitySettings";
import { RideHistory } from "@/components/RideHistory";
import { useUser } from "@/contexts/UserContext";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Card } from "@/components/ui/card";

interface DashboardProps {
  onLogout: () => void;
}

type DashboardView = 'home' | 'request-ride' | 'settings' | 'history';

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [currentView, setCurrentView] = useState<DashboardView>('home');
  const { user } = useUser();
  const { speak } = useAccessibility();

  const navigateToView = (view: DashboardView, announcement?: string) => {
    setCurrentView(view);
    if (announcement) {
      speak(announcement);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    speak('Logout realizado com sucesso');
    onLogout();
  };

  const renderView = () => {
    switch (currentView) {
      case 'request-ride':
        return <RideRequestForm onBack={() => navigateToView('home', 'Voltando ao menu principal')} />;
      case 'settings':
        return <AccessibilitySettings onBack={() => navigateToView('home', 'Voltando ao menu principal')} />;
      case 'history':
        return <RideHistory onBack={() => navigateToView('home', 'Voltando ao menu principal')} />;
      default:
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="text-center space-y-4">
                <div className="text-4xl" role="img" aria-label="Bem-vindo">
                  👋
                </div>
                <h2 className="text-2xl font-bold">
                  Olá, {user?.name}!
                </h2>
                <p className="text-lg text-muted-foreground">
                  Como podemos ajudá-lo hoje?
                </p>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              <AccessibleButton
                onClick={() => navigateToView('request-ride', 'Abrindo formulário de solicitação de corrida')}
                variant="primary"
                size="lg"
                ariaLabel="Solicitar uma corrida"
                className="h-20 text-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🚗</span>
                  <span>Solicitar Corrida</span>
                </div>
              </AccessibleButton>

              <AccessibleButton
                onClick={() => navigateToView('history', 'Abrindo histórico de corridas')}
                variant="outline"
                size="lg"
                ariaLabel="Ver histórico de corridas"
                className="h-20 text-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📋</span>
                  <span>Histórico</span>
                </div>
              </AccessibleButton>

              <AccessibleButton
                onClick={() => navigateToView('settings', 'Abrindo configurações de acessibilidade')}
                variant="outline"
                size="lg"
                ariaLabel="Configurações de acessibilidade"
                className="h-20 text-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⚙️</span>
                  <span>Configurações</span>
                </div>
              </AccessibleButton>

              <AccessibleButton
                onClick={handleLogout}
                variant="secondary"
                size="lg"
                ariaLabel="Sair da conta"
                className="h-20 text-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🚪</span>
                  <span>Sair</span>
                </div>
              </AccessibleButton>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-md mx-auto">
        <header className="mb-6 pt-20">
          <h1 className="text-3xl font-bold text-center text-primary">
            Mobilidade Acessível
          </h1>
        </header>

        <main>
          {renderView()}
        </main>
      </div>
    </div>
  );
};
