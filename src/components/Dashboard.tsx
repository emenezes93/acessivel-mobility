
import React, { useState } from 'react';
import { AccessibleButton } from "@/components/AccessibleButton";
import { RideRequestForm } from "@/components/RideRequestForm";
import { AccessibilitySettings } from "@/components/AccessibilitySettings";
import { RideHistory } from "@/components/RideHistory";
import { useUser } from "@/contexts/UserContext";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Card } from "@/components/ui/card";
import { MapPin, Clock, Settings, LogOut } from "lucide-react";

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
          <div className="min-h-screen bg-white">
            {/* Header similar to Uber */}
            <div className="bg-white shadow-sm border-b border-gray-100 px-4 py-6 safe-area-top">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Olá, {user?.name}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Para onde você quer ir?
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
            </div>

            {/* Main Action Button - Similar to Uber's "Where to?" */}
            <div className="px-4 py-6">
              <AccessibleButton
                onClick={() => navigateToView('request-ride', 'Abrindo solicitação de corrida')}
                variant="outline"
                className="w-full h-14 justify-start bg-gray-50 border-gray-200 hover:bg-gray-100 rounded-lg"
                ariaLabel="Para onde você quer ir?"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">Para onde?</span>
                </div>
              </AccessibleButton>
            </div>

            {/* Quick Actions */}
            <div className="px-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Ações rápidas
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <AccessibleButton
                  onClick={() => navigateToView('history', 'Abrindo histórico')}
                  variant="outline"
                  className="h-24 flex-col space-y-2 bg-white border-gray-200 hover:bg-gray-50 rounded-xl"
                  ariaLabel="Ver histórico de corridas"
                >
                  <Clock className="h-6 w-6 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Histórico</span>
                </AccessibleButton>

                <AccessibleButton
                  onClick={() => navigateToView('settings', 'Abrindo configurações de acessibilidade')}
                  variant="outline"
                  className="h-24 flex-col space-y-2 bg-white border-gray-200 hover:bg-gray-50 rounded-xl"
                  ariaLabel="Configurações de acessibilidade"
                >
                  <div className="text-xl">♿</div>
                  <span className="text-sm font-medium text-gray-700">Acessibilidade</span>
                </AccessibleButton>
              </div>
            </div>

            {/* Recent trips section placeholder */}
            <div className="px-4 mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Destinos recentes
              </h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Shopping Center</p>
                    <p className="text-xs text-gray-500">Av. Paulista, 1000</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Hospital São Paulo</p>
                    <p className="text-xs text-gray-500">R. das Flores, 123</p>
                  </div>
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
