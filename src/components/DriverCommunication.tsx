
import React, { useState } from 'react';
import { AccessibleButton } from "@/components/AccessibleButton";
import { Card } from "@/components/ui/card";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Phone, MessageCircle, MapPin } from "lucide-react";

interface DriverCommunicationProps {
  driverInfo: {
    name: string;
    phone: string;
    vehicle: string;
    plate: string;
    photo?: string;
    rating: number;
  };
  onCall: () => void;
  onMessage: () => void;
  onLocateDriver: () => void;
}

export const DriverCommunication: React.FC<DriverCommunicationProps> = ({
  driverInfo,
  onCall,
  onMessage,
  onLocateDriver
}) => {
  const { speak, vibrate } = useAccessibility();

  const handleCall = () => {
    speak(`Ligando para o motorista ${driverInfo.name}`);
    vibrate(300);
    onCall();
  };

  const handleMessage = () => {
    speak('Abrindo chat com o motorista');
    onMessage();
  };

  const handleLocate = () => {
    speak('Localizando motorista no mapa');
    onLocateDriver();
  };

  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-4">
          {driverInfo.photo ? (
            <img
              src={driverInfo.photo}
              alt={`Foto do motorista ${driverInfo.name}`}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
              👤
            </div>
          )}
          
          <div className="text-left">
            <h3 className="text-xl font-bold">{driverInfo.name}</h3>
            <p className="text-muted-foreground">
              {driverInfo.vehicle} • {driverInfo.plate}
            </p>
            <div className="flex items-center space-x-1">
              <span>⭐</span>
              <span>{driverInfo.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <AccessibleButton
            onClick={handleCall}
            variant="primary"
            ariaLabel={`Ligar para motorista ${driverInfo.name}`}
            className="h-16"
          >
            <div className="flex flex-col items-center space-y-1">
              <Phone className="h-6 w-6" />
              <span className="text-sm">Ligar</span>
            </div>
          </AccessibleButton>

          <AccessibleButton
            onClick={handleMessage}
            variant="outline"
            ariaLabel="Enviar mensagem para motorista"
            className="h-16"
          >
            <div className="flex flex-col items-center space-y-1">
              <MessageCircle className="h-6 w-6" />
              <span className="text-sm">Chat</span>
            </div>
          </AccessibleButton>

          <AccessibleButton
            onClick={handleLocate}
            variant="outline"
            ariaLabel="Localizar motorista no mapa"
            className="h-16"
          >
            <div className="flex flex-col items-center space-y-1">
              <MapPin className="h-6 w-6" />
              <span className="text-sm">Localizar</span>
            </div>
          </AccessibleButton>
        </div>

        <div className="bg-muted p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💬 Mensagens pré-definidas disponíveis por voz
          </p>
        </div>
      </div>
    </Card>
  );
};
