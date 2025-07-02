/**
 * Serviço para consulta de CEPs brasileiros usando a API ViaCEP
 */

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export interface AddressData {
  zipCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
  ibgeCode?: string;
  areaCode?: string;
}

class ViaCepService {
  private readonly baseUrl = 'https://viacep.com.br/ws';
  private cache = new Map<string, { data: AddressData; timestamp: number }>();
  private readonly cacheTimeout = 24 * 60 * 60 * 1000; // 24 horas

  /**
   * Formata CEP removendo caracteres especiais
   */
  private formatCep(cep: string): string {
    return cep.replace(/\D/g, '');
  }

  /**
   * Valida formato do CEP brasileiro
   */
  private isValidCep(cep: string): boolean {
    const cleanCep = this.formatCep(cep);
    return cleanCep.length === 8 && /^\d{8}$/.test(cleanCep);
  }

  /**
   * Converte resposta da ViaCEP para formato padronizado
   */
  private mapViaCepToAddressData(viaCepData: ViaCepResponse): AddressData {
    return {
      zipCode: viaCepData.cep,
      street: viaCepData.logradouro,
      neighborhood: viaCepData.bairro,
      city: viaCepData.localidade,
      state: viaCepData.uf,
      complement: viaCepData.complemento,
      ibgeCode: viaCepData.ibge,
      areaCode: viaCepData.ddd,
    };
  }

  /**
   * Busca endereço por CEP
   */
  async getAddressByCep(cep: string): Promise<AddressData | null> {
    const cleanCep = this.formatCep(cep);
    
    if (!this.isValidCep(cleanCep)) {
      throw new Error('CEP inválido. Deve conter 8 dígitos.');
    }

    // Verificar cache
    const cached = this.cache.get(cleanCep);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await fetch(`${this.baseUrl}/${cleanCep}/json/`);
      
      if (!response.ok) {
        throw new Error(`Erro na consulta: ${response.status}`);
      }

      const data: ViaCepResponse = await response.json();
      
      if (data.erro) {
        return null; // CEP não encontrado
      }

      const addressData = this.mapViaCepToAddressData(data);
      
      // Salvar no cache
      this.cache.set(cleanCep, {
        data: addressData,
        timestamp: Date.now()
      });

      return addressData;
    } catch (error) {
      console.error('Erro ao consultar ViaCEP:', error);
      throw new Error('Erro ao consultar CEP. Verifique sua conexão.');
    }
  }

  /**
   * Busca CEPs por endereço (máximo 50 resultados)
   */
  async searchCepsByAddress(
    state: string,
    city: string,
    street: string
  ): Promise<AddressData[]> {
    if (!state || !city || !street) {
      throw new Error('Estado, cidade e logradouro são obrigatórios.');
    }

    if (street.length < 3) {
      throw new Error('Logradouro deve ter pelo menos 3 caracteres.');
    }

    const cacheKey = `${state}-${city}-${street}`.toLowerCase();
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return [cached.data];
    }

    try {
      const url = `${this.baseUrl}/${encodeURIComponent(state)}/${encodeURIComponent(city)}/${encodeURIComponent(street)}/json/`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erro na consulta: ${response.status}`);
      }

      const data: ViaCepResponse[] = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        return [];
      }

      const addresses = data.map(item => this.mapViaCepToAddressData(item));
      
      // Cache apenas o primeiro resultado para pesquisas por endereço
      if (addresses.length > 0) {
        this.cache.set(cacheKey, {
          data: addresses[0],
          timestamp: Date.now()
        });
      }

      return addresses;
    } catch (error) {
      console.error('Erro ao buscar endereços:', error);
      throw new Error('Erro ao buscar endereços. Verifique sua conexão.');
    }
  }

  /**
   * Limpa cache de CEPs
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
      entries: Array.from(this.cache.keys()),
    };
  }
}

export const viaCepService = new ViaCepService();