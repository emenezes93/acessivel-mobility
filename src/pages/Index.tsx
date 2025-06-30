
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { AccessibleLogin } from "@/components/AccessibleLogin";
import { Dashboard } from "@/components/Dashboard";
import { EmergencyButton } from "@/components/EmergencyButton";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { UserProvider } from "@/contexts/UserContext";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg" aria-live="polite">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <AccessibilityProvider>
      <UserProvider>
        <div className="min-h-screen bg-background relative">
          <EmergencyButton />
          
          {!isLoggedIn ? (
            <AccessibleLogin onLogin={() => setIsLoggedIn(true)} />
          ) : (
            <Dashboard onLogout={() => setIsLoggedIn(false)} />
          )}
        </div>
      </UserProvider>
    </AccessibilityProvider>
  );
};

export default Index;
