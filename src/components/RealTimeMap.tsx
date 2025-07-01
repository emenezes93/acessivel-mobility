
import React, { useEffect, useState, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { AccessibleButton } from "@/components/AccessibleButton";
import { useAccessibility } from "@/contexts/AccessibilityContext";

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface RealTimeMapProps {
  origin: Location;
  destination: Location;
  driverLocation?: Location;
  onLocationUpdate?: (location: Location) => void;
  showDriverLocation?: boolean;
}

export const RealTimeMap: React.FC<RealTimeMapProps> = ({
  origin,
  destination,
  driverLocation,
  onLocationUpdate,
  showDriverLocation = false
}) => {
  const { speak } = useAccessibility();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [route, setRoute] = useState<Location[]>([]);
  const [currentDriverPosition, setCurrentDriverPosition] = useState<Location | null>(driverLocation || null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Simula o movimento do motorista em tempo real
  useEffect(() => {
    if (!showDriverLocation || !route.length) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < route.length) {
        const newPosition = route[currentIndex];
        setCurrentDriverPosition(newPosition);
        
        if (onLocationUpdate) {
          onLocationUpdate(newPosition);
        }

        // Anuncia marcos importantes da viagem
        if (currentIndex === 0) {
          speak('Motorista iniciou a viagem');
        } else if (currentIndex === Math.floor(route.length / 2)) {
          speak('Motorista está na metade do caminho');
        } else if (currentIndex === route.length - 1) {
          speak('Motorista chegou ao destino');
        }

        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 2000); // Atualiza a cada 2 segundos

    return () => clearInterval(interval);
  }, [route, showDriverLocation, onLocationUpdate, speak]);

  // Gera uma rota simulada entre origem e destino
  useEffect(() => {
    const generateRoute = () => {
      const steps = 20;
      const latStep = (destination.lat - origin.lat) / steps;
      const lngStep = (destination.lng - origin.lng) / steps;
      
      const routePoints: Location[] = [];
      for (let i = 0; i <= steps; i++) {
        routePoints.push({
          lat: origin.lat + (latStep * i),
          lng: origin.lng + (lngStep * i)
        });
      }
      
      setRoute(routePoints);
      setCurrentDriverPosition(origin);
    };

    generateRoute();
    setMapLoaded(true);
  }, [origin, destination]);

  const formatCoordinate = (coord: number) => coord.toFixed(6);

  const getDistanceToDestination = () => {
    if (!currentDriverPosition) return 0;
    
    // Fórmula simplificada de distância (Haversine seria mais precisa)
    const latDiff = destination.lat - currentDriverPosition.lat;
    const lngDiff = destination.lng - currentDriverPosition.lng;
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // Aproximação em km
    
    return Math.max(0, distance);
  };

  const refreshLocation = () => {
    speak('Atualizando localização');
    // Simula uma pequena variação na posição atual
    if (currentDriverPosition) {
      const variation = 0.0001;
      const newPosition = {
        lat: currentDriverPosition.lat + (Math.random() - 0.5) * variation,
        lng: currentDriverPosition.lng + (Math.random() - 0.5) * variation
      };
      setCurrentDriverPosition(newPosition);
      if (onLocationUpdate) {
        onLocationUpdate(newPosition);
      }
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Rastreamento em Tempo Real</h3>
          <AccessibleButton
            onClick={refreshLocation}
            variant="outline"
            size="sm"
            ariaLabel="Atualizar localização"
          >
            🔄
          </AccessibleButton>
        </div>

        {/* Mapa visual simplificado */}
        <div 
          ref={mapRef}
          className="relative w-full h-64 bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden"
          role="img"
          aria-label="Mapa de rastreamento da viagem"
        >
          {mapLoaded ? (
            <div className="absolute inset-0 p-4">
              {/* Simulação visual do mapa */}
              <div className="relative w-full h-full">
                {/* Origem (ponto A) */}
                <div 
                  className="absolute w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"
                  style={{
                    left: '10%',
                    top: '20%'
                  }}
                  title="Origem"
                >
                  <span className="absolute -top-6 -left-1 text-xs font-bold">A</span>
                </div>

                {/* Destino (ponto B) */}
                <div 
                  className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"
                  style={{
                    right: '10%',
                    bottom: '20%'
                  }}
                  title="Destino"
                >
                  <span className="absolute -top-6 -left-1 text-xs font-bold">B</span>
                </div>

                {/* Rota (linha pontilhada) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line
                    x1="10%"
                    y1="20%"
                    x2="90%"
                    y2="80%"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                    opacity="0.7"
                  />
                </svg>

                {/* Motorista (ponto móvel) */}
                {showDriverLocation && currentDriverPosition && (
                  <div 
                    className="absolute w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse transition-all duration-1000"
                    style={{
                      left: `${10 + (route.findIndex(r => r === currentDriverPosition) || 0) * 4}%`,
                      top: `${20 + (route.findIndex(r => r === currentDriverPosition) || 0) * 3}%`
                    }}
                    title="Motorista"
                  >
                    <span className="absolute -top-8 -left-2 text-xs font-bold bg-blue-500 text-white px-1 rounded">🚗</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Carregando mapa...</p>
              </div>
            </div>
          )}
        </div>

        {/* Informações de localização */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="font-medium">Origem:</span>
            </div>
            <p className="text-gray-600 ml-5">
              {origin.address || `${formatCoordinate(origin.lat)}, ${formatCoordinate(origin.lng)}`}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="font-medium">Destino:</span>
            </div>
            <p className="text-gray-600 ml-5">
              {destination.address || `${formatCoordinate(destination.lat)}, ${formatCoordinate(destination.lng)}`}
            </p>
          </div>

          {showDriverLocation && currentDriverPosition && (
            <>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                  <span className="font-medium">Motorista:</span>
                </div>
                <p className="text-gray-600 ml-5">
                  {formatCoordinate(currentDriverPosition.lat)}, {formatCoordinate(currentDriverPosition.lng)}
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-medium">Distância restante:</span>
                <p className="text-blue-600 font-bold">
                  {getDistanceToDestination().toFixed(1)} km
                </p>
              </div>
            </>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center">
          🌍 Rastreamento simulado em tempo real • Atualizações a cada 2 segundos
        </div>
      </div>
    </Card>
  );
};
