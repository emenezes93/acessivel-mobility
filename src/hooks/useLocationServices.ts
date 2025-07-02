import { useState, useCallback, useEffect } from 'react';
import { viaCepService, type AddressData } from '@/services/viaCep';
import { nominatimService, type LocationData } from '@/services/nominatim';

export interface UseLocationServicesReturn {
  // Estados
  isLoading: boolean;
  error: string | null;
  
  // Dados
  cepResults: AddressData | null;
  searchResults: LocationData[];
  reverseGeocodeResult: LocationData | null;
  
  // Funções ViaCEP
  searchByCep: (cep: string) => Promise<AddressData | null>;
  searchCepsByAddress: (state: string, city: string, street: string) => Promise<AddressData[]>;
  
  // Funções Nominatim
  searchLocations: (query: string, options?: SearchLocationOptions) => Promise<LocationData[]>;
  reverseGeocode: (lat: number, lng: number) => Promise<LocationData | null>;
  searchBrazilianAddress: (address: string, city?: string, state?: string) => Promise<LocationData[]>;
  searchNearbyPOI: (lat: number, lng: number, poiType: string, radius?: number) => Promise<LocationData[]>;
  
  // Funções utilitárias
  clearResults: () => void;
  clearError: () => void;
  getCacheStats: () => { viaCep: any; nominatim: any };
}

export interface SearchLocationOptions {
  limit?: number;
  countryCode?: string;
  language?: string;
  viewbox?: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  bounded?: boolean;
}

export const useLocationServices = (): UseLocationServicesReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [cepResults, setCepResults] = useState<AddressData | null>(null);
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [reverseGeocodeResult, setReverseGeocodeResult] = useState<LocationData | null>(null);

  // Limpar cache expirado periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      viaCepService.cleanExpiredCache();
      nominatimService.cleanExpiredCache();
    }, 5 * 60 * 1000); // A cada 5 minutos

    return () => clearInterval(interval);
  }, []);

  // Helper para lidar com erros
  const handleError = useCallback((error: any, defaultMessage: string) => {
    console.error(defaultMessage, error);
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    setError(errorMessage);
    return null;
  }, []);

  // ViaCEP - Buscar por CEP
  const searchByCep = useCallback(async (cep: string): Promise<AddressData | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await viaCepService.getAddressByCep(cep);
      setCepResults(result);
      return result;
    } catch (error) {
      return handleError(error, 'Erro ao buscar CEP');
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  // ViaCEP - Buscar CEPs por endereço
  const searchCepsByAddress = useCallback(async (
    state: string, 
    city: string, 
    street: string
  ): Promise<AddressData[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await viaCepService.searchCepsByAddress(state, city, street);
      return results;
    } catch (error) {
      handleError(error, 'Erro ao buscar endereços');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  // Nominatim - Buscar localizações
  const searchLocations = useCallback(async (
    query: string, 
    options: SearchLocationOptions = {}
  ): Promise<LocationData[]> => {
    if (!query || query.trim().length < 2) {
      setError('Consulta deve ter pelo menos 2 caracteres');
      return [];
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const results = await nominatimService.searchLocations({
        query: query.trim(),
        limit: options.limit || 10,
        countryCode: options.countryCode || 'br',
        language: options.language || 'pt-BR',
        viewbox: options.viewbox,
        bounded: options.bounded,
      });
      
      setSearchResults(results);
      return results;
    } catch (error) {
      handleError(error, 'Erro ao buscar localizações');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  // Nominatim - Geocodificação reversa
  const reverseGeocode = useCallback(async (
    lat: number, 
    lng: number
  ): Promise<LocationData | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await nominatimService.reverseGeocode({
        latitude: lat,
        longitude: lng,
        language: 'pt-BR',
      });
      
      setReverseGeocodeResult(result);
      return result;
    } catch (error) {
      return handleError(error, 'Erro na geocodificação reversa');
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  // Nominatim - Buscar endereços brasileiros
  const searchBrazilianAddress = useCallback(async (
    address: string, 
    city?: string, 
    state?: string
  ): Promise<LocationData[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await nominatimService.searchBrazilianAddress(address, city, state);
      setSearchResults(results);
      return results;
    } catch (error) {
      handleError(error, 'Erro ao buscar endereços brasileiros');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  // Nominatim - Buscar POIs próximos
  const searchNearbyPOI = useCallback(async (
    lat: number, 
    lng: number, 
    poiType: string, 
    radius = 1000
  ): Promise<LocationData[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await nominatimService.searchNearbyPOI(lat, lng, poiType, radius);
      return results;
    } catch (error) {
      handleError(error, 'Erro ao buscar pontos de interesse');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  // Limpar resultados
  const clearResults = useCallback(() => {
    setCepResults(null);
    setSearchResults([]);
    setReverseGeocodeResult(null);
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Obter estatísticas do cache
  const getCacheStats = useCallback(() => {
    return {
      viaCep: viaCepService.getCacheStats(),
      nominatim: nominatimService.getCacheStats(),
    };
  }, []);

  return {
    // Estados
    isLoading,
    error,
    
    // Dados
    cepResults,
    searchResults,
    reverseGeocodeResult,
    
    // Funções ViaCEP
    searchByCep,
    searchCepsByAddress,
    
    // Funções Nominatim
    searchLocations,
    reverseGeocode,
    searchBrazilianAddress,
    searchNearbyPOI,
    
    // Funções utilitárias
    clearResults,
    clearError,
    getCacheStats,
  };
};