
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccessibleButton } from "@/components/AccessibleButton";
import { RealTimeMap } from "@/components/RealTimeMap";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { useGeocoding } from "@/hooks/useGeocoding";
import { useAccessibility } from "@/contexts/AccessibilityContext";

interface LiveTrackingProps {
  rideId: string;
  origin: { address: string; lat?: number; lng?: number; };
  destination: { address: string; lat?: number; lng?: number; };
  driverInfo?: any;
  onClose?: () => void;
}

export const LiveTracking: React.FC<LiveTrackingProps> = ({
  rideId,
  origin,
  destination,
  driverInfo,
  onClose
}) => {
  const { speak, vibrate } = useAccessibility();
  const { location: currentLocation, error: locationError, refreshLocation } = useGeoLocation();
  const { reverseGeocode } = useGeocoding();
  
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number; } | null>(null);
  const [estimatedArrival, setEstimatedArrival] = useState('Calculando...');
  const [tripStatus, setTripStatus] = useState<'picking-up' | 'in-progress' | 'arriving'>('picking-up');
  const [currentAddress, setCurrentAddress] = useState<string>('');

  // Coordenadas padrão para demonstração (São Paulo)
  const defaultOrigin = origin.lat && origin.lng ? 
    { lat: origin.lat, lng: origin.lng, address: origin.address } :
    { lat: -23.5505, lng: -46.6333, address: origin.address };
    
  const defaultDestination = destination.lat && destination.lng ? 
    { lat: destination.lat, lng: destination.lng, address: destination.address } :
    { lat: -23.5489, lng: -46.6388, address: destination.address };

  // Atualiza o endereço atual quando a localização muda
  useEffect(() => {
    if (currentLocation) {
      reverseGeocode(currentLocation.lat, currentLocation.lng)
        .then(address => {
          if (address) {
            setCurrentAddress(address);
          }
        });
    }
  }, [currentLocation, reverseGeocode]);

  // Simula atualizações de status da viagem
  useEffect(() => {
    const statusUpdates = [
      { time: 5000, status: 'in-progress' as const, message: 'Motorista chegou e iniciou a viagem' },
      { time: 15000, status: 'arriving' as const, message: 'Chegando ao destino' }
    ];

    const timeouts = statusUpdates.map(update => 
      setTimeout(() => {
        setTripStatus(update.status);
        speak(update.message);
        vibrate([200, 100, 200]);
      }, update.time)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [speak, vibrate]);

  // Atualiza tempo estimado baseado no status
  useEffect(() => {
    const updateEstimatedTime = () => {
      switch (tripStatus) {
        case 'picking-up':
          setEstimatedArrival('5 min');
          break;
        case 'in-progress':
          setEstimatedArrival('12 min');
          break;
        case 'arriving':
          setEstimatedArrival('2 min');
          break;
      }
    };

    updateEstimatedTime();
    const interval = setInterval(updateEstimatedTime, 30000); // Atualiza a cada 30s

    return () => clearInterval(interval);
  }, [tripStatus]);

  const handleDriverLocationUpdate = (location: { lat: number; lng: number; }) => {
    setDriverLocation(location);
  };

  const getStatusText = () => {
    switch (tripStatus) {
      case 'picking-up':
        return 'Motorista a caminho';
      case 'in-progress':
        return 'Em viagem';
      case 'arriving':
        return 'Chegando ao destino';
    }
  };

  const getStatusColor = () => {
    switch (tripStatus) {
      case 'picking-up':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'arriving':
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Rastreamento da Viagem</h2>
          <p className="text-sm text-gray-600">ID: {rideId}</p>
        </div>
        {onClose && (
          <AccessibleButton
            onClick={onClose}
            variant="ghost"
            ariaLabel="Fechar rastreamento"
          >
            ✕
          </AccessibleButton>
        )}
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
          <div className="text-right">
            <p className="text-sm text-gray-600">Chegada estimada</p>
            <p className="font-bold text-lg">{estimatedArrival}</p>
          </div>
        </div>

        {driverInfo && (
          <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              👤
            </div>
            <div className="flex-1">
              <p className="font-medium">{driverInfo.name}</p>
              <p className="text-sm text-gray-600">{driverInfo.vehicle} • {driverInfo.plate}</p>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-yellow-500">⭐</span>
              <span className="text-sm">{driverInfo.rating}</span>
            </div>
          </div>
        )}
      </Card>

      <RealTimeMap
        origin={defaultOrigin}
        destination={defaultDestination}
        driverLocation={driverLocation}
        onLocationUpdate={handleDriverLocationUpdate}
        showDriverLocation={true}
      />

      <Card className="p-4">
        <h3 className="font-medium mb-3">Sua localização atual</h3>
        
        {locationError ? (
          <div className="text-center py-4">
            <p className="text-red-600 mb-2">{locationError}</p>
            <AccessibleButton
              onClick={refreshLocation}
              variant="outline"
              ariaLabel="Tentar obter localização novamente"
            >
              🔄 Tentar novamente
            </AccessibleButton>
          </div>
        ) : currentLocation ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium">Localização atualizada</span>
            </div>
            <p className="text-sm text-gray-600">
              {currentAddress || `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`}
            </p>
            <p className="text-xs text-gray-500">
              Precisão: ±{currentLocation.accuracy?.toFixed(0) || 'N/A'}m
            </p>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm">Obtendo localização...</span>
          </div>
        )}

        <AccessibleButton
          onClick={refreshLocation}
          variant="outline"
          className="w-full mt-3"
          ariaLabel="Atualizar localização"
        >
          🔄 Atualizar localização
        </AccessibleButton>
      </Card>

      <div className="text-xs text-center text-gray-500">
        🛰️ Rastreamento em tempo real ativo • Última atualização: agora
      </div>
    </div>
  );
};
