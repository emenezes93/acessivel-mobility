
import { useState } from 'react';

interface GeocodeResult {
  lat: number;
  lng: number;
  address: string;
  display_name?: string;
}

interface UseGeocodingResult {
  geocodeAddress: (address: string) => Promise<GeocodeResult | null>;
  reverseGeocode: (lat: number, lng: number) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

export const useGeocoding = (): UseGeocodingResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocodeAddress = async (address: string): Promise<GeocodeResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=br`
      );

      if (!response.ok) {
        throw new Error('Erro na requisição de geocoding');
      }

      const data = await response.json();
      
      if (data.length === 0) {
        setError('Endereço não encontrado');
        return null;
      }

      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        address: address,
        display_name: result.display_name
      };
    } catch (err) {
      setError('Erro ao buscar endereço');
      console.error('Geocoding error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error('Erro na requisição de reverse geocoding');
      }

      const data = await response.json();
      return data.display_name || 'Endereço não encontrado';
    } catch (err) {
      setError('Erro ao buscar endereço');
      console.error('Reverse geocoding error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    geocodeAddress,
    reverseGeocode,
    loading,
    error
  };
};
