import { useState, useEffect } from 'react';
import { 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  DocumentSnapshot,
  enableNetwork,
  disableNetwork,
  enableMultiTabIndexedDbPersistence,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * OTIMIZAÇÕES PARA PLANO GRATUITO DO FIRESTORE
 * 
 * Limites do Spark Plan (Gratuito):
 * - 50.000 leituras/dia
 * - 20.000 escritas/dia  
 * - 20.000 exclusões/dia
 * - 1GB de armazenamento
 * - 10GB/mês de largura de banda
 */

// Cache local para reduzir consultas
const localCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Configurações de cache
const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutos
  USER_PROFILE_TTL: 30 * 60 * 1000, // 30 minutos
  DRIVER_LIST_TTL: 2 * 60 * 1000, // 2 minutos
  RIDE_HISTORY_TTL: 15 * 60 * 1000, // 15 minutos
  EMERGENCY_CONTACTS_TTL: 60 * 60 * 1000, // 1 hora
};

/**
 * 1. SISTEMA DE CACHE LOCAL
 */
export class FirestoreCache {
  static set(key: string, data: any, ttl: number = CACHE_CONFIG.DEFAULT_TTL) {
    localCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  static get(key: string): any | null {
    const cached = localCache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      localCache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  static clear() {
    localCache.clear();
  }

  static invalidatePattern(pattern: string) {
    for (const key of localCache.keys()) {
      if (key.includes(pattern)) {
        localCache.delete(key);
      }
    }
  }
}

/**
 * 2. CONSULTAS OTIMIZADAS COM CACHE
 */
export class OptimizedQueries {
  // Buscar usuários próximos com cache e limite
  static async getNearbyUsers(lat: number, lng: number, radiusKm: number = 10) {
    const cacheKey = `nearby_users_${lat}_${lng}_${radiusKm}`;
    const cached = FirestoreCache.get(cacheKey);
    if (cached) return cached;

    // Consulta otimizada com limite
    const q = query(
      collection(db, 'usuarios'),
      where('ativo', '==', true),
      // Usar geohash para consultas geográficas mais eficientes
      orderBy('criadoEm', 'desc'),
      limit(20) // Limitar resultados
    );

    const snapshot = await getDocs(q);
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    FirestoreCache.set(cacheKey, users, CACHE_CONFIG.DEFAULT_TTL);
    return users;
  }

  // Buscar motoristas disponíveis com cache
  static async getAvailableDrivers(maxDistance: number = 5) {
    const cacheKey = `available_drivers_${maxDistance}`;
    const cached = FirestoreCache.get(cacheKey);
    if (cached) return cached;

    const q = query(
      collection(db, 'motoristas'),
      where('disponivel', '==', true),
      where('verificado', '==', true),
      orderBy('avaliacaoMedia', 'desc'),
      limit(15) // Limitar para economizar leituras
    );

    const snapshot = await getDocs(q);
    const drivers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    FirestoreCache.set(cacheKey, drivers, CACHE_CONFIG.DRIVER_LIST_TTL);
    return drivers;
  }

  // Histórico de corridas com paginação
  static async getUserRideHistory(userId: string, pageSize: number = 10, lastDoc?: QueryDocumentSnapshot) {
    const cacheKey = `ride_history_${userId}_${pageSize}`;
    
    if (!lastDoc) {
      const cached = FirestoreCache.get(cacheKey);
      if (cached) return cached;
    }

    let q = query(
      collection(db, 'corridas'),
      where('usuarioId', '==', userId),
      orderBy('criadaEm', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const rides = {
      data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === pageSize
    };

    if (!lastDoc) {
      FirestoreCache.set(cacheKey, rides, CACHE_CONFIG.RIDE_HISTORY_TTL);
    }

    return rides;
  }
}

/**
 * 3. SISTEMA DE PAGINAÇÃO EFICIENTE
 */
export class PaginationHelper {
  private static cursors = new Map<string, QueryDocumentSnapshot[]>();

  static async paginatedQuery(
    collectionName: string,
    constraints: any[],
    pageSize: number = 10,
    pageIndex: number = 0
  ) {
    const cacheKey = `${collectionName}_page_${pageIndex}_${pageSize}`;
    const cached = FirestoreCache.get(cacheKey);
    if (cached) return cached;

    const cursorsKey = `${collectionName}_cursors`;
    const cursors = this.cursors.get(cursorsKey) || [];

    let q = query(collection(db, collectionName), ...constraints, limit(pageSize));

    if (pageIndex > 0 && cursors[pageIndex - 1]) {
      q = query(q, startAfter(cursors[pageIndex - 1]));
    }

    const snapshot = await getDocs(q);
    const docs = snapshot.docs;

    // Salvar cursor para próxima página
    if (docs.length > 0) {
      cursors[pageIndex] = docs[docs.length - 1];
      this.cursors.set(cursorsKey, cursors);
    }

    const result = {
      data: docs.map(doc => ({ id: doc.id, ...doc.data() })),
      hasMore: docs.length === pageSize,
      currentPage: pageIndex,
      totalPages: Math.ceil(cursors.length + (docs.length === pageSize ? 1 : 0))
    };

    FirestoreCache.set(cacheKey, result, CACHE_CONFIG.DEFAULT_TTL);
    return result;
  }

  static clearCursors(collectionName: string) {
    this.cursors.delete(`${collectionName}_cursors`);
    FirestoreCache.invalidatePattern(collectionName);
  }
}

/**
 * 4. OTIMIZAÇÕES DE ESCRITA (BATCH E TRANSAÇÕES)
 */
export class WriteOptimizations {
  // Agrupar múltiplas escritas em batch
  static async batchWrite(operations: Array<{ type: 'set' | 'update' | 'delete', ref: any, data?: any }>) {
    const batch = writeBatch(db);
    
    operations.forEach(op => {
      switch (op.type) {
        case 'set':
          batch.set(op.ref, op.data);
          break;
        case 'update':
          batch.update(op.ref, op.data);
          break;
        case 'delete':
          batch.delete(op.ref);
          break;
      }
    });

    await batch.commit();
    
    // Invalidar cache relacionado
    operations.forEach(op => {
      const collectionName = op.ref.path.split('/')[0];
      FirestoreCache.invalidatePattern(collectionName);
    });
  }

  // Atualização condicional para evitar escritas desnecessárias
  static async conditionalUpdate(docRef: any, newData: any, currentData: any) {
    const changes: any = {};
    let hasChanges = false;

    Object.keys(newData).forEach(key => {
      if (JSON.stringify(newData[key]) !== JSON.stringify(currentData[key])) {
        changes[key] = newData[key];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      await updateDoc(docRef, {
        ...changes,
        atualizadoEm: new Date().toISOString()
      });
      
      // Invalidar cache
      const collectionName = docRef.path.split('/')[0];
      FirestoreCache.invalidatePattern(collectionName);
    }

    return hasChanges;
  }
}

/**
 * 5. CONFIGURAÇÃO DE PERSISTÊNCIA OFFLINE
 */
export async function enableOfflinePersistence() {
  try {
    await enableMultiTabIndexedDbPersistence(db);
    console.log('✅ Persistência offline habilitada');
  } catch (error: any) {
    if (error.code === 'failed-precondition') {
      console.warn('⚠️ Persistência offline falhou: múltiplas abas abertas');
    } else if (error.code === 'unimplemented') {
      console.warn('⚠️ Persistência offline não suportada neste navegador');
    } else {
      console.error('❌ Erro ao habilitar persistência offline:', error);
    }
  }
}

/**
 * 6. MONITORAMENTO DE USO DE QUOTAS
 */
export class QuotaMonitor {
  private static reads = 0;
  private static writes = 0;
  private static deletes = 0;
  private static lastReset = Date.now();

  static trackRead(count: number = 1) {
    this.reads += count;
    this.checkReset();
  }

  static trackWrite(count: number = 1) {
    this.writes += count;
    this.checkReset();
  }

  static trackDelete(count: number = 1) {
    this.deletes += count;
    this.checkReset();
  }

  private static checkReset() {
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    if (now - this.lastReset > dayInMs) {
      this.reads = 0;
      this.writes = 0;
      this.deletes = 0;
      this.lastReset = now;
    }
  }

  static getUsage() {
    return {
      reads: this.reads,
      writes: this.writes,
      deletes: this.deletes,
      readPercentage: (this.reads / 50000) * 100,
      writePercentage: (this.writes / 20000) * 100,
      deletePercentage: (this.deletes / 20000) * 100,
      isNearLimit: this.reads > 45000 || this.writes > 18000 || this.deletes > 18000
    };
  }

  static shouldThrottle() {
    return this.getUsage().isNearLimit;
  }
}

/**
 * 7. ESTRATÉGIAS DE REDUÇÃO DE CONSULTAS
 */
export class QueryReduction {
  // Combinar múltiplas consultas em uma
  static async getCompleteUserProfile(userId: string) {
    const cacheKey = `complete_profile_${userId}`;
    const cached = FirestoreCache.get(cacheKey);
    if (cached) return cached;

    // Uma única consulta para buscar dados relacionados
    const [userDoc, emergencyContacts, recentRides] = await Promise.all([
      getDoc(doc(db, 'usuarios', userId)),
      getDocs(query(
        collection(db, 'contatos_emergencia'),
        where('usuarioId', '==', userId),
        limit(5)
      )),
      getDocs(query(
        collection(db, 'corridas'),
        where('usuarioId', '==', userId),
        orderBy('criadaEm', 'desc'),
        limit(3)
      ))
    ]);

    const profile = {
      user: userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null,
      emergencyContacts: emergencyContacts.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      recentRides: recentRides.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };

    FirestoreCache.set(cacheKey, profile, CACHE_CONFIG.USER_PROFILE_TTL);
    QuotaMonitor.trackRead(3);

    return profile;
  }

  // Usar agregações quando possível (reduz leituras)
  static async getRideStatistics(userId: string) {
    const cacheKey = `ride_stats_${userId}`;
    const cached = FirestoreCache.get(cacheKey);
    if (cached) return cached;

    // Usar count() quando disponível para evitar ler todos os documentos
    const ridesRef = collection(db, 'corridas');
    const completedQuery = query(ridesRef, where('usuarioId', '==', userId), where('status', '==', 'concluida'));
    
    // Em vez de usar count(), fazemos uma consulta otimizada
    const snapshot = await getDocs(query(completedQuery, limit(1000)));
    
    const stats = {
      totalRides: snapshot.size,
      lastUpdate: Date.now()
    };

    FirestoreCache.set(cacheKey, stats, CACHE_CONFIG.RIDE_HISTORY_TTL);
    QuotaMonitor.trackRead(1);

    return stats;
  }
}

/**
 * 8. CONFIGURAÇÃO DE INDICES PARA MELHOR PERFORMANCE
 */
export const RECOMMENDED_INDEXES = `
// Adicione estes índices no Firebase Console > Firestore > Indexes

// Para consultas de usuários
usuarios: 
  - ativo (ascending), criadoEm (descending)
  - tipoDeficiencia (ascending), ativo (ascending)

// Para consultas de motoristas  
motoristas:
  - disponivel (ascending), verificado (ascending), avaliacaoMedia (descending)
  - localizacaoAtual.lat (ascending), localizacaoAtual.lng (ascending)

// Para consultas de corridas
corridas:
  - usuarioId (ascending), criadaEm (descending)
  - motoristaId (ascending), status (ascending)
  - status (ascending), criadaEm (descending)

// Para contatos de emergência
contatos_emergencia:
  - usuarioId (ascending), principal (descending)
`;

/**
 * 9. HOOK PARA USAR OTIMIZAÇÕES
 */
export function useOptimizedFirestore() {
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');

  useEffect(() => {
    enableOfflinePersistence();

    // Monitorar status da rede
    const handleOnline = () => {
      setNetworkStatus('online');
      enableNetwork(db);
    };

    const handleOffline = () => {
      setNetworkStatus('offline');
      disableNetwork(db);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    networkStatus,
    cache: FirestoreCache,
    queries: OptimizedQueries,
    pagination: PaginationHelper,
    writes: WriteOptimizations,
    quotaMonitor: QuotaMonitor,
    queryReduction: QueryReduction
  };
}