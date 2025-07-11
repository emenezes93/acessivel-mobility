
import { useState } from "react";
import { AccessibleLogin } from "@/components/AccessibleLogin";
import { Dashboard } from "@/components/Dashboard";
import { DriverDashboard } from "@/components/DriverDashboard";
import { AccessibilitySettings } from "@/components/AccessibilitySettings";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useUser } from "@/contexts/UserContext";

const Index = () => {
  const [currentView, setCurrentView] = useState<'login' | 'dashboard' | 'driver-dashboard' | 'settings'>('login');
  const { user, setUser } = useUser();

  // Auto-redirect based on user state
  if (user && currentView === 'login') {
    if (user.userType === 'driver') {
      setCurrentView('driver-dashboard');
    } else {
      setCurrentView('dashboard');
    }
  }

  const handleLogin = (userType: 'passenger' | 'driver') => {
    if (userType === 'driver') {
      setCurrentView('driver-dashboard');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return <AccessibleLogin onLogin={handleLogin} />;
      case 'dashboard':
        return <Dashboard onLogout={handleLogout} />;
      case 'driver-dashboard':
        return <DriverDashboard onLogout={handleLogout} />;
      case 'settings':
        return <AccessibilitySettings onBack={() => {
          if (user?.userType === 'driver') {
            setCurrentView('driver-dashboard');
          } else {
            setCurrentView('dashboard');
          }
        }} />;
      default:
        return <AccessibleLogin onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="container mx-auto px-4 py-8">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default Index;
