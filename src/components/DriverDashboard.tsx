import React, { useState, useEffect } from 'react';
import { AccessibleButton } from "@/components/AccessibleButton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { DriverRideList } from "@/components/DriverRideList";
import { DriverProfile } from "@/components/DriverProfile";
import { DriverEarnings } from "@/components/DriverEarnings";
import { DriverSettings } from "@/components/DriverSettings";
import { DriverActiveRide } from "@/components/DriverActiveRide";

interface DriverDashboardProps {
  onLogout: () => void;
}

type DriverDashboardView = 'home' | 'available-rides' | 'active-ride' | 'profile' | 'earnings' | 'settings';

export const DriverDashboard: React.FC<DriverDashboardProps> = ({ onLogout }) => {
  const [currentView, setCurrentView] = useState<DriverDashboardView>('home');
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeRide, setActiveRide] = useState<any>(null);
  const { user } = useUser();
  const { speak, vibrate, settings } = useAccessibility();

  useEffect(() => {
    // Verificar se há uma corrida ativa ao carregar
    const savedActiveRide = localStorage.getItem('activeRide');
    if (savedActiveRide) {
      setActiveRide(JSON.parse(savedActiveRide));
      setCurrentView('active-ride');
    }
  }, []);

  const navigateToView = (view: DriverDashboardView, announcement?: string) => {
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

  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
    speak(isAvailable ? 'Você está offline' : 'Você está online e disponível para corridas');
    vibrate([100, 50, 100]);
  };

  const acceptRide = (ride: any) => {
    setActiveRide(ride);
    localStorage.setItem('activeRide', JSON.stringify(ride));
    setCurrentView('active-ride');
    speak('Corrida aceita. Navegando para detalhes da corrida.');
    vibrate([200, 100, 200]);
  };

  const completeRide = () => {
    speak('Corrida finalizada com sucesso');
    vibrate([300, 100, 300]);
    localStorage.removeItem('activeRide');
    setActiveRide(null);
    setCurrentView('home');
  };

  const renderView = () => {
    switch (currentView) {
      case 'available-rides':
        return <DriverRideList onBack={() => navigateToView('home', 'Voltando ao menu principal')} onAcceptRide={acceptRide} />;
      case 'active-ride':
        return activeRide ? (
          <DriverActiveRide 
            ride={activeRide} 
            onComplete={completeRide} 
            onBack={() => navigateToView('home', 'Voltando ao menu principal')} 
            onStatusChange={(status) => {
              activeRide.status = status;
              localStorage.setItem('activeRide', JSON.stringify(activeRide));
              setActiveRide({...activeRide});
            }}
          />
        ) : (
          <div className="text-center p-6">
            <p className="text-lg">Nenhuma corrida ativa no momento.</p>
            <AccessibleButton
              onClick={() => navigateToView('home', 'Voltando ao menu principal')}
              variant="primary"
              className="mt-4"
            >
              Voltar ao Menu
            </AccessibleButton>
          </div>
        );
      case 'profile':
        return <DriverProfile onBack={() => navigateToView('home', 'Voltando ao menu principal')} />;
      case 'earnings':
        return <DriverEarnings onBack={() => navigateToView('home', 'Voltando ao menu principal')} />;
      case 'settings':
        return <DriverSettings onBack={() => navigateToView('home', 'Voltando ao menu principal')} onLogout={handleLogout} />;
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
                <div className="mt-4">
                  <AccessibleButton
                    onClick={toggleAvailability}
                    variant={isAvailable ? 'primary' : 'secondary'}
                    size="lg"
                    ariaLabel={isAvailable ? 'Você está online' : 'Você está offline'}
                    className="w-full h-14 text-lg"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span>{isAvailable ? 'Online' : 'Offline'}</span>
                    </div>
                  </AccessibleButton>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              <AccessibleButton
                onClick={() => navigateToView('available-rides', 'Verificando corridas disponíveis')}
                variant="primary"
                size="lg"
                ariaLabel="Ver corridas disponíveis"
                className="h-20 text-lg"
                disabled={!isAvailable}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🚕</span>
                  <span>Corridas Disponíveis</span>
                </div>
              </AccessibleButton>

              {activeRide && (
                <AccessibleButton
                  onClick={() => navigateToView('active-ride', 'Abrindo detalhes da corrida ativa')}
                  variant="primary"
                  size="lg"
                  ariaLabel="Ver corrida ativa"
                  className="h-20 text-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🚗</span>
                    <span>Corrida Ativa</span>
                  </div>
                </AccessibleButton>
              )}

              <AccessibleButton
                onClick={() => navigateToView('earnings', 'Abrindo ganhos')}
                variant="outline"
                size="lg"
                ariaLabel="Ver ganhos"
                className="h-20 text-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💰</span>
                  <span>Ganhos</span>
                </div>
              </AccessibleButton>

              <AccessibleButton
                onClick={() => navigateToView('profile', 'Abrindo perfil')}
                variant="outline"
                size="lg"
                ariaLabel="Ver perfil"
                className="h-20 text-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">👤</span>
                  <span>Perfil</span>
                </div>
              </AccessibleButton>
              
              <AccessibleButton
                onClick={() => navigateToView('settings', 'Abrindo configurações')}
                variant="outline"
                size="lg"
                ariaLabel="Ver configurações"
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

  // Funções auxiliares para acessibilidade
  const getAccessibilityIcon = (need: string) => {
    const iconMap: { [key: string]: string } = {
      'wheelchair': '♿',
      'guide-dog': '🦮',
      'hearing-assistance': '🦻',
      'visual-assistance': '👁️',
      'mobility-assistance': '🦯'
    };
    
    return iconMap[need] || '🔧';
  };

  const getAccessibilityLabel = (need: string) => {
    const labelMap: { [key: string]: string } = {
      'wheelchair': 'Cadeira de rodas',
      'guide-dog': 'Cão guia',
      'hearing-assistance': 'Assistência auditiva',
      'visual-assistance': 'Assistência visual',
      'mobility-assistance': 'Assistência para mobilidade'
    };
    
    return labelMap[need] || need;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-md mx-auto">
        <header className="mb-6 pt-20">
          <h1 className="text-3xl font-bold text-center text-primary">
            Mobilidade Acessível
          </h1>
          {isAvailable && (
            <p className="text-center text-sm mt-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
              Motorista Online
            </p>
          )}
        </header>

        <main>
          {renderView()}
        </main>
      </div>
    </div>
  );
};