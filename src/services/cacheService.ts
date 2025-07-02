/**
 * Serviço de cache local avançado com persistência e limpeza automática
 */

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiration: number;
  accessCount: number;
  lastAccess: number;
  priority: number; // 1-10, onde 10 é mais importante
}

export interface CacheConfig {
  defaultTTL: number; // Time to live em ms
  maxSize: number; // Número máximo de entradas
  storagePrefix: string;
  enablePersistence: boolean;
  cleanupInterval: number; // Intervalo de limpeza em ms
}

class CacheService {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 60 * 60 * 1000, // 1 hora
      maxSize: 1000,
      storagePrefix: 'acessivel_cache_',
      enablePersistence: true,
      cleanupInterval: 5 * 60 * 1000, // 5 minutos
      ...config,
    };
  }

  /**
   * Inicializa o cache carregando dados persistidos
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (this.config.enablePersistence && typeof localStorage !== 'undefined') {
      this.loadFromStorage();
    }

    this.startCleanupTimer();
    this.isInitialized = true;
  }

  /**
   * Define um valor no cache
   */
  set<T>(
    key: string, 
    data: T, 
    options: {
      ttl?: number;
      priority?: number;
      persist?: boolean;
    } = {}
  ): void {
    if (!this.isInitialized) {
      this.initialize();
    }

    const {
      ttl = this.config.defaultTTL,
      priority = 5,
      persist = true,
    } = options;

    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiration: now + ttl,
      accessCount: 0,
      lastAccess: now,
      priority,
    };

    // Verificar se precisa fazer limpeza por tamanho
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastImportant();
    }

    this.cache.set(key, entry);

    // Persistir se habilitado
    if (persist && this.config.enablePersistence) {
      this.persistEntry(key, entry);
    }
  }

  /**
   * Obtém um valor do cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    
    // Verificar se expirou
    if (now > entry.expiration) {
      this.delete(key);
      return null;
    }

    // Atualizar estatísticas de acesso
    entry.accessCount++;
    entry.lastAccess = now;

    return entry.data as T;
  }

  /**
   * Verifica se uma chave existe no cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Verificar se expirou
    if (Date.now() > entry.expiration) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove uma entrada do cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    
    if (deleted && this.config.enablePersistence) {
      this.removeFromStorage(key);
    }
    
    return deleted;
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
    
    if (this.config.enablePersistence) {
      this.clearStorage();
    }
  }

  /**
   * Remove entradas expiradas
   */
  cleanExpired(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiration) {
        this.delete(key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Remove a entrada menos importante quando o cache está cheio
   */
  private evictLeastImportant(): void {
    let leastImportantKey: string | null = null;
    let lowestScore = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      // Score baseado em prioridade, frequência de acesso e recência
      const now = Date.now();
      const recency = now - entry.lastAccess;
      const frequency = entry.accessCount;
      const priority = entry.priority;
      
      // Menor score = menos importante
      const score = (priority * 100) + (frequency * 10) - (recency / 1000);
      
      if (score < lowestScore) {
        lowestScore = score;
        leastImportantKey = key;
      }
    }

    if (leastImportantKey) {
      this.delete(leastImportantKey);
    }
  }

  /**
   * Carrega dados do localStorage
   */
  private loadFromStorage(): void {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.config.storagePrefix)) {
          const cacheKey = key.replace(this.config.storagePrefix, '');
          const stored = localStorage.getItem(key);
          
          if (stored) {
            const entry: CacheEntry = JSON.parse(stored);
            
            // Verificar se ainda é válida
            if (Date.now() <= entry.expiration) {
              this.cache.set(cacheKey, entry);
            } else {
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar cache do localStorage:', error);
    }
  }

  /**
   * Persiste uma entrada no localStorage
   */
  private persistEntry(key: string, entry: CacheEntry): void {
    try {
      const storageKey = this.config.storagePrefix + key;
      localStorage.setItem(storageKey, JSON.stringify(entry));
    } catch (error) {
      console.warn('Erro ao persistir cache:', error);
      // Se localStorage está cheio, tentar limpar entradas antigas
      this.cleanupStorage();
    }
  }

  /**
   * Remove uma entrada do localStorage
   */
  private removeFromStorage(key: string): void {
    try {
      const storageKey = this.config.storagePrefix + key;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Erro ao remover do localStorage:', error);
    }
  }

  /**
   * Limpa todas as entradas do cache no localStorage
   */
  private clearStorage(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.config.storagePrefix)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Erro ao limpar localStorage:', error);
    }
  }

  /**
   * Limpa entradas antigas do localStorage
   */
  private cleanupStorage(): void {
    try {
      const now = Date.now();
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.config.storagePrefix)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const entry: CacheEntry = JSON.parse(stored);
            if (now > entry.expiration) {
              keysToRemove.push(key);
            }
          }
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Erro na limpeza do localStorage:', error);
    }
  }

  /**
   * Inicia o timer de limpeza automática
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanExpired();
      if (this.config.enablePersistence) {
        this.cleanupStorage();
      }
    }, this.config.cleanupInterval);
  }

  /**
   * Para o timer de limpeza
   */
  stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats() {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      expired: entries.filter(entry => now > entry.expiration).length,
      totalAccessCount: entries.reduce((sum, entry) => sum + entry.accessCount, 0),
      averageAge: entries.length > 0 
        ? entries.reduce((sum, entry) => sum + (now - entry.timestamp), 0) / entries.length
        : 0,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * Estima o uso de memória (aproximado)
   */
  private estimateMemoryUsage(): string {
    const jsonString = JSON.stringify(Array.from(this.cache.entries()));
    const bytes = new Blob([jsonString]).size;
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  /**
   * Destrói o cache e limpa recursos
   */
  destroy(): void {
    this.stopCleanupTimer();
    this.clear();
    this.isInitialized = false;
  }
}

// Instâncias padrão para diferentes tipos de cache
export const locationCache = new CacheService({
  defaultTTL: 24 * 60 * 60 * 1000, // 24 horas para localizações
  maxSize: 500,
  storagePrefix: 'location_cache_',
});

export const geocodingCache = new CacheService({
  defaultTTL: 60 * 60 * 1000, // 1 hora para geocodificação
  maxSize: 200,
  storagePrefix: 'geocoding_cache_',
});

export const generalCache = new CacheService({
  defaultTTL: 30 * 60 * 1000, // 30 minutos para cache geral
  maxSize: 300,
  storagePrefix: 'general_cache_',
});

// Inicializar caches automaticamente
if (typeof window !== 'undefined') {
  locationCache.initialize();
  geocodingCache.initialize();
  generalCache.initialize();
}

export { CacheService };