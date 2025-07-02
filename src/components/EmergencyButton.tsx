
import React, { useState } from 'react';
import { AccessibleButton } from "@/components/AccessibleButton";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useUser } from "@/contexts/UserContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const EmergencyButton: React.FC = () => {
  const [isPressed, setIsPressed] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [countdown, setCountdown] = useState(5);
  
  const { speak, vibrate } = useAccessibility();
  const { user } = useUser();

  const handleEmergencyPress = () => {
    setShowDialog(true);
    speak('Botão de emergência ativado. Pressione novamente para confirmar ou aguarde 5 segundos.');
    vibrate([500, 200, 500, 200, 500]);
    
    // Start countdown
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          activateEmergency();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const activateEmergency = async () => {
    setIsPressed(true);
    speak('Emergência ativada! Enviando localização para contatos de emergência.');
    vibrate([1000, 200, 1000]);
    
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(currentLocation);
          sendEmergencyAlert(currentLocation);
        },
        (error) => {
          console.error('Error getting location:', error);
          sendEmergencyAlert(null);
        }
      );
    } else {
      sendEmergencyAlert(null);
    }
  };

  const sendEmergencyAlert = (userLocation: {lat: number, lng: number} | null) => {
    // Simulate sending emergency alert
    const alertData = {
      userId: user?.id,
      userName: user?.name,
      userPhone: user?.phone,
      location: userLocation,
      timestamp: new Date().toISOString(),
      emergencyContacts: user?.emergencyContacts || []
    };
    
    console.log('Emergency alert sent:', alertData);
    
    // In a real app, this would send to emergency services and contacts
    speak('Alerta de emergência enviado com sucesso!');
    
    setTimeout(() => {
      setIsPressed(false);
      setShowDialog(false);
      setCountdown(5);
    }, 5000);
  };

  const cancelEmergency = () => {
    setShowDialog(false);
    setCountdown(5);
    speak('Emergência cancelada');
  };

  return (
    <>
      <AccessibleButton
        onClick={handleEmergencyPress}
        variant="destructive"
        ariaLabel="Botão de emergência - Pressione para pedir ajuda"
        voiceAnnouncement="Botão de emergência ativado"
        className={`
          fixed top-4 right-4 z-50 h-16 w-16 rounded-full shadow-lg
          ${isPressed ? 'animate-pulse bg-red-700' : 'bg-red-600 hover:bg-red-700'}
        `}
      >
        <span className="text-2xl" role="img" aria-label="SOS">
          🆘
        </span>
      </AccessibleButton>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              🚨 Emergência Ativada
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <p className="text-lg">
              Confirmando emergência em:
            </p>
            
            <div className="text-6xl font-bold text-red-600">
              {countdown}
            </div>
            
            <p className="text-sm text-muted-foreground">
              Pressione cancelar se foi um engano
            </p>
            
            <div className="flex space-x-2">
              <AccessibleButton
                onClick={activateEmergency}
                variant="destructive"
                ariaLabel="Confirmar emergência"
                className="flex-1"
              >
                Confirmar
              </AccessibleButton>
              
              <AccessibleButton
                onClick={cancelEmergency}
                variant="outline"
                ariaLabel="Cancelar emergência"
                className="flex-1"
              >
                Cancelar
              </AccessibleButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
