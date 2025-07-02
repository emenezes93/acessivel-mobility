import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAccessibility } from '@/contexts/AccessibilityContext';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export interface MapLocation {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  type: 'origin' | 'destination' | 'driver' | 'poi';
  accessible?: boolean;
}

export interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  locations?: MapLocation[];
  onLocationClick?: (location: MapLocation) => void;
  onMapClick?: (latitude: number, longitude: number) => void;
  showUserLocation?: boolean;
  interactive?: boolean;
  className?: string;
}

// Componente para centralizar o mapa em uma localização
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  return null;
}

// Componente para capturar cliques no mapa
function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  
  return null;
}

// Ícones customizados para diferentes tipos de marcadores
const createCustomIcon = (type: MapLocation['type'], accessible?: boolean) => {
  const getColor = () => {
    switch (type) {
      case 'origin': return '#22c55e'; // verde
      case 'destination': return '#ef4444'; // vermelho
      case 'driver': return '#3b82f6'; // azul
      case 'poi': return '#8b5cf6'; // roxo
      default: return '#6b7280'; // cinza
    }
  };

  const color = getColor();
  const accessibilitySymbol = accessible ? '♿' : '';
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: white;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        ${accessibilitySymbol || '📍'}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

export const MapComponent: React.FC<MapComponentProps> = ({
  center = [-23.5505, -46.6333], // São Paulo como padrão
  zoom = 13,
  height = '400px',
  locations = [],
  onLocationClick,
  onMapClick,
  showUserLocation = true,
  interactive = true,
  className = '',
}) => {
  const { speak, hapticFeedback } = useAccessibility();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  // Obter localização do usuário
  useEffect(() => {
    if (showUserLocation && 'geolocation' in navigator) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos: [number, number] = [
            position.coords.latitude,
            position.coords.longitude
          ];
          setUserLocation(userPos);
          setIsLoading(false);
        },
        (error) => {
          console.warn('Erro ao obter localização:', error);
          setIsLoading(false);
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
        }
      );
    }
  }, [showUserLocation]);

  // Função para anunciar localização via voz
  const announceLocation = (location: MapLocation) => {
    const message = `${location.title}${location.description ? `. ${location.description}` : ''}${
      location.accessible ? '. Local acessível para cadeirantes' : ''
    }`;
    speak(message);
  };

  // Handler para clique em marcador
  const handleMarkerClick = (location: MapLocation) => {
    hapticFeedback();
    announceLocation(location);
    onLocationClick?.(location);
  };

  // Handler para clique no mapa
  const handleMapClick = (lat: number, lng: number) => {
    hapticFeedback();
    speak(`Localização selecionada: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    onMapClick?.(lat, lng);
  };

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {isLoading && (
        <div className="absolute top-2 left-2 z-[1000] bg-white px-3 py-1 rounded shadow">
          📍 Obtendo localização...
        </div>
      )}
      
      <MapContainer
        center={userLocation || center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={interactive}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        scrollWheelZoom={interactive}
        boxZoom={interactive}
        keyboard={interactive}
        ref={mapRef}
        className="rounded-lg overflow-hidden"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        
        <MapController center={userLocation || center} />
        
        {interactive && onMapClick && (
          <MapClickHandler onMapClick={handleMapClick} />
        )}
        
        {/* Marcador da localização do usuário */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={L.divIcon({
              html: `
                <div style="
                  background-color: #3b82f6;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
                  animation: pulse 2s infinite;
                "></div>
                <style>
                  @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                  }
                </style>
              `,
              className: 'user-location-marker',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          >
            <Popup>
              <div className="text-center">
                <strong>📍 Sua localização</strong>
                <br />
                <small>{userLocation[0].toFixed(6)}, {userLocation[1].toFixed(6)}</small>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Marcadores das localizações */}
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={createCustomIcon(location.type, location.accessible)}
            eventHandlers={{
              click: () => handleMarkerClick(location),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="font-semibold text-lg mb-2">{location.title}</div>
                {location.description && (
                  <div className="text-gray-600 mb-2">{location.description}</div>
                )}
                <div className="text-sm text-gray-500 mb-2">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </div>
                {location.accessible && (
                  <div className="flex items-center text-green-600 text-sm">
                    <span className="mr-1">♿</span>
                    Acessível para cadeirantes
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-400">
                  Tipo: {location.type === 'origin' ? 'Origem' : 
                          location.type === 'destination' ? 'Destino' :
                          location.type === 'driver' ? 'Motorista' : 'Ponto de Interesse'}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};