
import { useState, useEffect } from 'react';

interface GeoLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

interface UseGeoLocationResult {
  location: GeoLocation | null;
  error: string | null;
  loading: boolean;
  refreshLocation: () => void;
}

export const useGeoLocation = (enableHighAccuracy = true): UseGeoLocationResult => {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada por este navegador');
      setLoading(false);
      return;
    }

    const options = {
      enableHighAccuracy,
      timeout: 10000,
      maximumAge: 60000 // Cache por 1 minuto
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
        setLoading(false);
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível';
            break;
          case error.TIMEOUT:
            errorMessage = 'Timeout ao obter localização';
            break;
        }
        
        setError(errorMessage);
        setLoading(false);
        console.error('Error getting location:', error);
      },
      options
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  return {
    location,
    error,
    loading,
    refreshLocation: getLocation
  };
};
