
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
import { Car, DollarSign, User, Settings, LogOut, MapPin } from "lucide-react";

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
          <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
            <div className="text-6xl mb-4">🚗</div>
            <p className="text-lg text-gray-700 mb-6">Nenhuma corrida ativa no momento.</p>
            <AccessibleButton
              onClick={() => navigateToView('home', 'Voltando ao menu principal')}
              variant="primary"
              className="px-8 h-12 rounded-lg"
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
          <div className="min-h-screen bg-white">
            {/* Header with status toggle */}
            <div className="bg-white shadow-sm border-b border-gray-100 px-4 py-6 safe-area-top">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Olá, {user?.name}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Motorista • {isAvailable ? 'Online' : 'Offline'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <AccessibleButton
                    onClick={() => navigateToView('settings', 'Abrindo configurações')}
                    variant="ghost"
                    ariaLabel="Configurações"
                    className="h-10 w-10 rounded-full"
                  >
                    <Settings className="h-5 w-5" />
                  </AccessibleButton>
                  <AccessibleButton
                    onClick={handleLogout}
                    variant="ghost"
                    ariaLabel="Sair"
                    className="h-10 w-10 rounded-full"
                  >
                    <LogOut className="h-5 w-5" />
                  </AccessibleButton>
                </div>
              </div>

              {/* Online/Offline Toggle */}
              <AccessibleButton
                onClick={toggleAvailability}
                variant={isAvailable ? 'primary' : 'secondary'}
                className="w-full h-14 rounded-lg font-medium"
                ariaLabel={isAvailable ? 'Você está online' : 'Você está offline'}
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-white' : 'bg-green-500'}`}></div>
                  <span>{isAvailable ? 'Você está online' : 'Ficar online'}</span>
                </div>
              </AccessibleButton>
            </div>

            {/* Active ride banner */}
            {activeRide && (
              <div className="px-4 py-3 bg-primary/10 border-b border-primary/20">
                <AccessibleButton
                  onClick={() => navigateToView('active-ride', 'Abrindo corrida ativa')}
                  variant="ghost"
                  className="w-full p-3 bg-white rounded-lg border border-primary/20"
                  ariaLabel="Ver corrida ativa"
                >
                  <div className="flex items-center space-x-3">
                    <Car className="h-5 w-5 text-primary" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900">Corrida ativa</p>
                      <p className="text-sm text-gray-600">Toque para ver detalhes</p>
                    </div>
                  </div>
                </AccessibleButton>
              </div>
            )}

            {/* Main Actions */}
            <div className="px-4 py-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Ações principais
              </h2>
              
              <div className="space-y-3">
                <AccessibleButton
                  onClick={() => navigateToView('available-rides', 'Verificando corridas disponíveis')}
                  variant="outline"
                  disabled={!isAvailable}
                  className="w-full h-16 justify-start bg-white border-gray-200 hover:bg-gray-50 rounded-xl"
                  ariaLabel="Ver corridas disponíveis"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Corridas disponíveis</p>
                      <p className="text-sm text-gray-500">Veja solicitações próximas</p>
                    </div>
                  </div>
                </AccessibleButton>

                <AccessibleButton
                  onClick={() => navigateToView('earnings', 'Abrindo ganhos')}
                  variant="outline"
                  className="w-full h-16 justify-start bg-white border-gray-200 hover:bg-gray-50 rounded-xl"
                  ariaLabel="Ver ganhos"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Ganhos</p>
                      <p className="text-sm text-gray-500">R$ 245,80 esta semana</p>
                    </div>
                  </div>
                </AccessibleButton>

                <AccessibleButton
                  onClick={() => navigateToView('profile', 'Abrindo perfil')}
                  variant="outline"
                  className="w-full h-16 justify-start bg-white border-gray-200 hover:bg-gray-50 rounded-xl"
                  ariaLabel="Ver perfil"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Perfil</p>
                      <p className="text-sm text-gray-500">Informações pessoais</p>
                    </div>
                  </div>
                </AccessibleButton>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="px-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Hoje
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900">12</p>
                  <p className="text-sm text-gray-600">Corridas</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-2xl font-bold text-green-600">R$ 89</p>
                  <p className="text-sm text-gray-600">Ganhos</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {renderView()}
    </div>
  );
};
