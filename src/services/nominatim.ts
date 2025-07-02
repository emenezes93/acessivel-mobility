/**
 * Serviço para geocodificação usando Nominatim OpenStreetMap
 */

export interface NominatimResponse {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: string;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
  address: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
}

export interface LocationData {
  id: string;
  displayName: string;
  latitude: number;
  longitude: number;
  address: {
    houseNumber?: string;
    street?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    countryCode?: string;
  };
  type: string;
  category: string;
  importance: number;
  boundingBox: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
}

export interface ReverseGeocodeOptions {
  latitude: number;
  longitude: number;
  zoom?: number; // 1-18, default 18
  language?: string; // default 'pt-BR'
}

export interface SearchOptions {
  query: string;
  limit?: number; // max 50, default 10
  countryCode?: string; // 'br' for Brazil
  viewbox?: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  bounded?: boolean; // restrict to viewbox
  language?: string; // default 'pt-BR'
}

class NominatimService {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org';
  private cache = new Map<string, { data: LocationData | LocationData[]; timestamp: number }>();
  private readonly cacheTimeout = 60 * 60 * 1000; // 1 hora
  private readonly requestDelay = 1000; // 1 segundo entre requests (política Nominatim)
  private lastRequestTime = 0;

  /**
   * Aplica delay entre requests conforme política do Nominatim
   */
  private async applyRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.requestDelay) {
      await new Promise(resolve => 
        setTimeout(resolve, this.requestDelay - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Converte resposta Nominatim para formato padronizado
   */
  private mapNominatimToLocationData(nominatimData: NominatimResponse): LocationData {
    const bbox = nominatimData.boundingbox.map(coord => parseFloat(coord));
    
    return {
      id: nominatimData.place_id,
      displayName: nominatimData.display_name,
      latitude: parseFloat(nominatimData.lat),
      longitude: parseFloat(nominatimData.lon),
      address: {
        houseNumber: nominatimData.address.house_number,
        street: nominatimData.address.road,
        neighborhood: nominatimData.address.suburb,
        city: nominatimData.address.city,
        state: nominatimData.address.state,
        zipCode: nominatimData.address.postcode,
        country: nominatimData.address.country,
        countryCode: nominatimData.address.country_code,
      },
      type: nominatimData.type,
      category: nominatimData.class,
      importance: nominatimData.importance,
      boundingBox: {
        minLat: bbox[0],
        maxLat: bbox[1],
        minLon: bbox[2],
        maxLon: bbox[3],
      },
    };
  }

  /**
   * Busca localizações por texto
   */
  async searchLocations(options: SearchOptions): Promise<LocationData[]> {
    const {
      query,
      limit = 10,
      countryCode = 'br',
      viewbox,
      bounded = false,
      language = 'pt-BR'
    } = options;

    if (!query || query.trim().length < 2) {
      throw new Error('Consulta deve ter pelo menos 2 caracteres.');
    }

    const cacheKey = JSON.stringify({ type: 'search', ...options });
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as LocationData[];
    }

    await this.applyRateLimit();

    try {
      const params = new URLSearchParams({
        q: query.trim(),
        format: 'json',
        addressdetails: '1',
        limit: Math.min(limit, 50).toString(),
        countrycodes: countryCode,
        'accept-language': language,
      });

      if (viewbox) {
        params.append('viewbox', `${viewbox.minLon},${viewbox.maxLat},${viewbox.maxLon},${viewbox.minLat}`);
        if (bounded) {
          params.append('bounded', '1');
        }
      }

      const url = `${this.baseUrl}/search?${params.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AcessivelMobility/1.0 (accessibility-focused ride-sharing app)',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na consulta: ${response.status}`);
      }

      const data: NominatimResponse[] = await response.json();
      
      if (!Array.isArray(data)) {
        return [];
      }

      const locations = data.map(item => this.mapNominatimToLocationData(item));
      
      // Cache resultado
      this.cache.set(cacheKey, {
        data: locations,
        timestamp: Date.now()
      });

      return locations;
    } catch (error) {
      console.error('Erro ao buscar localizações:', error);
      throw new Error('Erro ao buscar localizações. Verifique sua conexão.');
    }
  }

  /**
   * Geocodificação reversa - converte coordenadas em endereço
   */
  async reverseGeocode(options: ReverseGeocodeOptions): Promise<LocationData | null> {
    const {
      latitude,
      longitude,
      zoom = 18,
      language = 'pt-BR'
    } = options;

    if (!latitude || !longitude) {
      throw new Error('Latitude e longitude são obrigatórios.');
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new Error('Coordenadas inválidas.');
    }

    const cacheKey = JSON.stringify({ type: 'reverse', ...options });
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as LocationData;
    }

    await this.applyRateLimit();

    try {
      const params = new URLSearchParams({
        lat: latitude.toString(),
        lon: longitude.toString(),
        format: 'json',
        addressdetails: '1',
        zoom: Math.min(Math.max(zoom, 1), 18).toString(),
        'accept-language': language,
      });

      const url = `${this.baseUrl}/reverse?${params.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AcessivelMobility/1.0 (accessibility-focused ride-sharing app)',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na consulta: ${response.status}`);
      }

      const data: NominatimResponse = await response.json();
      
      if (!data || !data.lat || !data.lon) {
        return null;
      }

      const location = this.mapNominatimToLocationData(data);
      
      // Cache resultado
      this.cache.set(cacheKey, {
        data: location,
        timestamp: Date.now()
      });

      return location;
    } catch (error) {
      console.error('Erro na geocodificação reversa:', error);
      throw new Error('Erro ao buscar endereço. Verifique sua conexão.');
    }
  }

  /**
   * Busca específica para endereços brasileiros
   */
  async searchBrazilianAddress(address: string, city?: string, state?: string): Promise<LocationData[]> {
    let query = address.trim();
    
    if (city) {
      query += `, ${city.trim()}`;
    }
    
    if (state) {
      query += `, ${state.trim()}`;
    }
    
    // Adicionar Brasil se não especificado
    if (!query.toLowerCase().includes('brasil') && !query.toLowerCase().includes('brazil')) {
      query += ', Brasil';
    }

    return this.searchLocations({
      query,
      countryCode: 'br',
      limit: 15,
      language: 'pt-BR'
    });
  }

  /**
   * Busca pontos de interesse próximos
   */
  async searchNearbyPOI(
    latitude: number,
    longitude: number,
    poiType: string,
    radius = 1000
  ): Promise<LocationData[]> {
    const radiusInDegrees = radius / 111000; // Aproximadamente 111km por grau
    
    return this.searchLocations({
      query: poiType,
      countryCode: 'br',
      viewbox: {
        minLat: latitude - radiusInDegrees,
        maxLat: latitude + radiusInDegrees,
        minLon: longitude - radiusInDegrees,
        maxLon: longitude + radiusInDegrees,
      },
      bounded: true,
      limit: 20,
    });
  }

  /**
   * Limpa cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Remove itens expirados do cache
   */
  cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()).slice(0, 10), // Primeiras 10 entradas
    };
  }
}

export const nominatimService = new NominatimService();