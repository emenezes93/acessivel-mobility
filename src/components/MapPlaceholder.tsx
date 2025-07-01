import React from 'react';
import { Map, MapPin, Navigation } from 'lucide-react';

interface MapPlaceholderProps {
  origin?: string;
  destination?: string;
}

export const MapPlaceholder: React.FC<MapPlaceholderProps> = ({ origin, destination }) => {
  const hasLocations = origin && destination;

  return (
    <div className="relative w-full h-full bg-muted/20 overflow-hidden rounded-lg">
      <div className="absolute inset-0 flex items-center justify-center">
        <Map className="w-24 h-24 text-muted-foreground opacity-20" />
      </div>
      
      {hasLocations ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="relative w-1/2 max-w-[200px]">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-3 h-3 rounded-full bg-primary z-10" />
            <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-3 h-3 rounded-full bg-accent z-10" />
            <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-gradient-to-b from-primary to-accent" />
          </div>
        </div>
      ) : (
        <div className="absolute bottom-8 left-0 right-0 text-center text-sm text-muted-foreground">
          Informe origem e destino para visualizar a rota
        </div>
      )}
      
      <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm p-2 rounded-md text-xs text-muted-foreground">
        Mapa ilustrativo
      </div>
    </div>
  );
};