import { db } from './firebase';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';

// Dados fictícios para usuários
const usuarios = [
  {
    id: 'user1',
    nome: 'Maria Silva',
    email: 'maria.silva@email.com',
    telefone: '+5511987654321',
    tipoDeficiencia: 'visual',
    configuracaoAcessibilidade: {
      tamanhoFonte: 24,
      altoContraste: true,
      vozSintetizada: true,
      vibracaoHaptica: true,
      reducaoMovimento: false
    },
    endereco: {
      rua: 'Rua das Flores, 123',
      bairro: 'Jardim Primavera',
      cidade: 'São Paulo',
      cep: '01234-567',
      coordenadas: { lat: -23.5505, lng: -46.6333 }
    },
    criadoEm: new Date('2024-01-15').toISOString(),
    ativo: true
  },
  {
    id: 'user2',
    nome: 'João Santos',
    email: 'joao.santos@email.com',
    telefone: '+5511876543210',
    tipoDeficiencia: 'motora',
    configuracaoAcessibilidade: {
      tamanhoFonte: 18,
      altoContraste: false,
      vozSintetizada: false,
      vibracaoHaptica: true,
      reducaoMovimento: true
    },
    endereco: {
      rua: 'Av. Paulista, 456',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      cep: '01310-100',
      coordenadas: { lat: -23.5618, lng: -46.6565 }
    },
    criadoEm: new Date('2024-02-10').toISOString(),
    ativo: true
  },
  {
    id: 'user3',
    nome: 'Ana Costa',
    email: 'ana.costa@email.com',
    telefone: '+5511765432109',
    tipoDeficiencia: 'auditiva',
    configuracaoAcessibilidade: {
      tamanhoFonte: 16,
      altoContraste: false,
      vozSintetizada: false,
      vibracaoHaptica: true,
      reducaoMovimento: false
    },
    endereco: {
      rua: 'Rua Augusta, 789',
      bairro: 'Consolação',
      cidade: 'São Paulo',
      cep: '01305-000',
      coordenadas: { lat: -23.5527, lng: -46.6634 }
    },
    criadoEm: new Date('2024-03-05').toISOString(),
    ativo: true
  }
];

// Dados fictícios para motoristas
const motoristas = [
  {
    id: 'driver1',
    nome: 'Carlos Oliveira',
    email: 'carlos.oliveira@email.com',
    telefone: '+5511654321098',
    cnh: 'SP123456789',
    veiculo: {
      marca: 'Toyota',
      modelo: 'Corolla',
      ano: 2020,
      placa: 'ABC-1234',
      cor: 'Branco',
      acessibilidade: ['rampa', 'espaco_cadeirante', 'cintos_especiais']
    },
    avaliacaoMedia: 4.8,
    totalCorridas: 245,
    disponivel: true,
    localizacaoAtual: { lat: -23.5505, lng: -46.6333 },
    criadoEm: new Date('2023-12-01').toISOString(),
    verificado: true
  },
  {
    id: 'driver2',
    nome: 'Fernanda Lima',
    email: 'fernanda.lima@email.com',
    telefone: '+5511543210987',
    cnh: 'SP987654321',
    veiculo: {
      marca: 'Volkswagen',
      modelo: 'Voyage',
      ano: 2019,
      placa: 'XYZ-5678',
      cor: 'Prata',
      acessibilidade: ['audio_descricao', 'controles_adaptados']
    },
    avaliacaoMedia: 4.9,
    totalCorridas: 189,
    disponivel: false,
    localizacaoAtual: { lat: -23.5618, lng: -46.6565 },
    criadoEm: new Date('2024-01-10').toISOString(),
    verificado: true
  },
  {
    id: 'driver3',
    nome: 'Roberto Alves',
    email: 'roberto.alves@email.com',
    telefone: '+5511432109876',
    cnh: 'SP456789123',
    veiculo: {
      marca: 'Chevrolet',
      modelo: 'Onix',
      ano: 2021,
      placa: 'DEF-9012',
      cor: 'Azul',
      acessibilidade: ['sinalizacao_visual', 'vibracao_haptica']
    },
    avaliacaoMedia: 4.7,
    totalCorridas: 156,
    disponivel: true,
    localizacaoAtual: { lat: -23.5527, lng: -46.6634 },
    criadoEm: new Date('2024-02-15').toISOString(),
    verificado: true
  }
];

// Dados fictícios para corridas
const corridas = [
  {
    id: 'ride1',
    usuarioId: 'user1',
    motoristaId: 'driver1',
    origem: {
      endereco: 'Rua das Flores, 123 - São Paulo',
      coordenadas: { lat: -23.5505, lng: -46.6333 }
    },
    destino: {
      endereco: 'Shopping Ibirapuera - São Paulo',
      coordenadas: { lat: -23.5751, lng: -46.6569 }
    },
    status: 'concluida',
    valor: 15.50,
    distanciaKm: 8.2,
    duracaoMinutos: 25,
    tipoPagamento: 'cartao',
    avaliacaoUsuario: 5,
    avaliacaoMotorista: 5,
    observacoes: 'Usuário com deficiência visual, motorista muito atencioso',
    criadaEm: new Date('2024-06-15T14:30:00').toISOString(),
    iniciadaEm: new Date('2024-06-15T14:35:00').toISOString(),
    finalizadaEm: new Date('2024-06-15T15:00:00').toISOString()
  },
  {
    id: 'ride2',
    usuarioId: 'user2',
    motoristaId: 'driver2',
    origem: {
      endereco: 'Av. Paulista, 456 - São Paulo',
      coordenadas: { lat: -23.5618, lng: -46.6565 }
    },
    destino: {
      endereco: 'Hospital das Clínicas - São Paulo',
      coordenadas: { lat: -23.5566, lng: -46.6702 }
    },
    status: 'concluida',
    valor: 12.30,
    distanciaKm: 4.5,
    duracaoMinutos: 18,
    tipoPagamento: 'dinheiro',
    avaliacaoUsuario: 4,
    avaliacaoMotorista: 5,
    observacoes: 'Cadeirante, veículo com rampa funcionou perfeitamente',
    criadaEm: new Date('2024-06-20T09:15:00').toISOString(),
    iniciadaEm: new Date('2024-06-20T09:20:00').toISOString(),
    finalizadaEm: new Date('2024-06-20T09:38:00').toISOString()
  },
  {
    id: 'ride3',
    usuarioId: 'user3',
    motoristaId: 'driver3',
    origem: {
      endereco: 'Rua Augusta, 789 - São Paulo',
      coordenadas: { lat: -23.5527, lng: -46.6634 }
    },
    destino: {
      endereco: 'Aeroporto de Congonhas - São Paulo',
      coordenadas: { lat: -23.6265, lng: -46.6560 }
    },
    status: 'em_andamento',
    valor: 25.80,
    distanciaKm: 12.1,
    duracaoMinutos: 35,
    tipoPagamento: 'pix',
    observacoes: 'Usuário surdo, comunicação por texto funcionando bem',
    criadaEm: new Date().toISOString(),
    iniciadaEm: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  }
];

// Dados fictícios para configurações de emergência
const contatosEmergencia = [
  {
    usuarioId: 'user1',
    nome: 'Pedro Silva',
    telefone: '+5511999888777',
    relacao: 'irmão',
    principal: true
  },
  {
    usuarioId: 'user1',
    nome: 'SAMU',
    telefone: '192',
    relacao: 'emergencia_medica',
    principal: false
  },
  {
    usuarioId: 'user2',
    nome: 'Carmen Santos',
    telefone: '+5511888777666',
    relacao: 'mãe',
    principal: true
  },
  {
    usuarioId: 'user3',
    nome: 'Lucas Costa',
    telefone: '+5511777666555',
    relacao: 'cônjuge',
    principal: true
  }
];

// Função para popular o banco com dados fictícios
export const popularBancoComDados = async () => {
  const resultados = { sucesso: 0, erro: 0, detalhes: [] as string[] };

  try {
    console.log('🔧 Iniciando população com batch write...');
    
    // Verificar se o usuário está autenticado
    const { auth } = await import('./firebase');
    if (!auth.currentUser) {
      resultados.erro++;
      resultados.detalhes.push('❌ Usuário não autenticado. Execute os testes primeiro.');
      return resultados;
    }

    const batch = writeBatch(db);

    // Popular usuários
    for (const usuario of usuarios) {
      const { id, ...dadosUsuario } = usuario;
      const userRef = doc(db, 'usuarios', id);
      batch.set(userRef, dadosUsuario);
    }
    resultados.detalhes.push(`${usuarios.length} usuários preparados`);

    // Popular motoristas
    for (const motorista of motoristas) {
      const { id, ...dadosMotorista } = motorista;
      const driverRef = doc(db, 'motoristas', id);
      batch.set(driverRef, dadosMotorista);
    }
    resultados.detalhes.push(`${motoristas.length} motoristas preparados`);

    // Popular corridas
    for (const corrida of corridas) {
      const { id, ...dadosCorrida } = corrida;
      const rideRef = doc(db, 'corridas', id);
      batch.set(rideRef, dadosCorrida);
    }
    resultados.detalhes.push(`${corridas.length} corridas preparadas`);

    // Executar batch write
    console.log('🔧 Executando batch write...');
    await batch.commit();
    resultados.sucesso = usuarios.length + motoristas.length + corridas.length;
    resultados.detalhes.push('✅ Batch write executado com sucesso!');

    // Popular contatos de emergência (separadamente)
    console.log('🔧 Adicionando contatos de emergência...');
    for (const contato of contatosEmergencia) {
      try {
        await addDoc(collection(db, 'contatos_emergencia'), contato);
        resultados.sucesso++;
      } catch (error: any) {
        resultados.erro++;
        console.error('❌ Erro ao adicionar contato:', error);
        resultados.detalhes.push(`❌ Erro contato: ${error.code || error.message}`);
      }
    }
    resultados.detalhes.push(`${contatosEmergencia.length - resultados.erro} contatos adicionados`);

    console.log('✅ População concluída:', resultados);
    return resultados;
  } catch (error: any) {
    console.error('❌ Erro geral na população:', error);
    resultados.erro++;
    resultados.detalhes.push(`❌ Erro geral: ${error.code || error.message || error}`);
    return resultados;
  }
};

// Função para limpar dados de teste
export const limparDadosTeste = async () => {
  // Esta função pode ser implementada para limpar dados de teste se necessário
  // Por segurança, não implementamos automaticamente
  console.log('⚠️ Função de limpeza não implementada por segurança');
};