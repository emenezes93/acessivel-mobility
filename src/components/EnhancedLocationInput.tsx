import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Navigation, Search, X, Clock, MapIcon } from 'lucide-react';
import { useLocationServices } from '@/hooks/useLocationServices';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import type { LocationData } from '@/services/nominatim';
import type { AddressData } from '@/services/viaCep';

interface EnhancedLocationInputProps {
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder: string;
  type: 'origin' | 'destination';
  ariaLabel: string;
  className?: string;
  showCurrentLocation?: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  coordinates?: { lat: number; lng: number };
  type: 'cep' | 'address' | 'current';
  accessible?: boolean;
}

export const EnhancedLocationInput: React.FC<EnhancedLocationInputProps> = ({
  value,
  onChange,
  placeholder,
  type,
  ariaLabel,
  className = '',
  showCurrentLocation = true,
}) => {
  const { speak, hapticFeedback } = useAccessibility();
  const {
    isLoading,
    error,
    searchByCep,
    searchBrazilianAddress,
    clearError,
  } = useLocationServices();

  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const Icon = type === 'origin' ? MapPin : Navigation;
  const iconColor = type === 'origin' ? 'text-green-600' : 'text-red-600';

  // Carregar buscas recentes do localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`recent-searches-${type}`);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.warn('Erro ao carregar buscas recentes:', e);
      }
    }
  }, [type]);

  // Salvar busca recente
  const saveRecentSearch = (result: SearchResult) => {
    const updated = [
      result,
      ...recentSearches.filter(r => r.id !== result.id)
    ].slice(0, 5); // Manter apenas 5 recentes
    
    setRecentSearches(updated);
    localStorage.setItem(`recent-searches-${type}`, JSON.stringify(updated));
  };

  // Detectar se é CEP
  const isCep = (query: string): boolean => {
    const cleanQuery = query.replace(/\D/g, '');
    return cleanQuery.length === 8 && /^\d{8}$/.test(cleanQuery);
  };

  // Buscar localizações
  const searchLocations = async (query: string) => {
    if (!query || query.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    const trimmedQuery = query.trim();
    const results: SearchResult[] = [];

    try {
      if (isCep(trimmedQuery)) {
        // Buscar por CEP
        const cepResult = await searchByCep(trimmedQuery);
        if (cepResult) {
          results.push({
            id: `cep-${cepResult.zipCode}`,
            title: `${cepResult.street}, ${cepResult.neighborhood}`,
            subtitle: `${cepResult.city} - ${cepResult.state}, CEP: ${cepResult.zipCode}`,
            type: 'cep',
          });
        }
      } else {
        // Buscar por endereço
        const addressResults = await searchBrazilianAddress(trimmedQuery);
        addressResults.forEach((location: LocationData, index: number) => {
          results.push({
            id: `address-${location.id}-${index}`,
            title: location.displayName.split(',')[0] || 'Endereço',
            subtitle: location.displayName,
            coordinates: {
              lat: location.latitude,
              lng: location.longitude,
            },
            type: 'address',
            accessible: location.type.includes('hospital') || 
                       location.type.includes('school') ||
                       location.displayName.toLowerCase().includes('acessível'),
          });
        });
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Erro na busca:', error);
      speak('Erro ao buscar localização. Tente novamente.');
    }
  };

  // Lidar com mudança no input
  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for search
    if (newValue.trim().length >= 3) {
      const timeout = setTimeout(() => {
        searchLocations(newValue);
      }, 500); // Delay de 500ms
      
      setSearchTimeout(timeout);
    } else {
      setSearchResults([]);
    }
  };

  // Selecionar resultado
  const selectResult = (result: SearchResult) => {
    hapticFeedback();
    onChange(result.title, result.coordinates);
    saveRecentSearch(result);
    setIsOpen(false);
    
    const message = `${result.title} selecionado${result.accessible ? '. Local acessível' : ''}`;
    speak(message);
  };

  // Obter localização atual
  const getCurrentLocation = () => {
    hapticFeedback();
    speak('Obtendo sua localização atual...');
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const result: SearchResult = {
            id: 'current-location',
            title: 'Localização atual',
            subtitle: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            coordinates: { lat: latitude, lng: longitude },
            type: 'current',
          };
          
          selectResult(result);
          speak('Localização atual obtida com sucesso');
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          speak('Não foi possível obter sua localização. Verifique as permissões.');
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
        }
      );
    } else {
      speak('Geolocalização não é suportada neste dispositivo.');
    }
  };

  // Limpar input
  const clearInput = () => {
    hapticFeedback();
    onChange('');
    setSearchResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
    speak('Campo limpo');
  };

  // Fechar resultados quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasResults = searchResults.length > 0 || recentSearches.length > 0;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${iconColor}`} />
        
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-20 bg-background/90 backdrop-blur-sm"
          aria-label={ariaLabel}
          aria-expanded={isOpen && hasResults}
          aria-haspopup="listbox"
          autoComplete="off"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearInput}
              className="h-6 w-6 p-0"
              aria-label="Limpar campo"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          {showCurrentLocation && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={getCurrentLocation}
              className="h-6 w-6 p-0"
              aria-label="Usar localização atual"
              disabled={isLoading}
            >
              <Navigation className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Resultados da busca */}
      {isOpen && hasResults && (
        <Card
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto shadow-lg"
        >
          {error && (
            <div className="p-3 text-red-600 text-sm border-b">
              {error}
              <Button
                variant="link"
                size="sm"
                onClick={clearError}
                className="ml-2 h-auto p-0"
              >
                Fechar
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="p-3 text-center text-gray-500">
              <Search className="h-4 w-4 animate-spin inline mr-2" />
              Buscando...
            </div>
          )}

          {searchResults.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b">
                Resultados da busca
              </div>
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => selectResult(result)}
                  className="w-full px-3 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b last:border-b-0"
                  role="option"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {result.type === 'cep' ? (
                        <MapPin className="h-4 w-4 text-blue-600" />
                      ) : result.type === 'current' ? (
                        <Navigation className="h-4 w-4 text-green-600" />
                      ) : (
                        <MapIcon className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate flex items-center gap-2">
                        {result.title}
                        {result.accessible && (
                          <span className="text-green-600" title="Acessível">♿</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {result.subtitle}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchResults.length === 0 && recentSearches.length > 0 && !isLoading && (
            <div>
              <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Buscas recentes
              </div>
              {recentSearches.map((result) => (
                <button
                  key={result.id}
                  onClick={() => selectResult(result)}
                  className="w-full px-3 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b last:border-b-0"
                  role="option"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {result.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {result.subtitle}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};