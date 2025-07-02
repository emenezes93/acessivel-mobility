# 🚗♿ Acessível Mobility

**Aplicativo de transporte inclusivo para pessoas com deficiência**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.5.3-blue.svg)
![Firebase](https://img.shields.io/badge/firebase-11.10.0-orange.svg)

## 📋 Sobre o Projeto

O **Acessível Mobility** é uma solução de transporte inovadora desenvolvida especificamente para atender pessoas com diferentes tipos de deficiências. Nosso aplicativo conecta usuários que necessitam de transporte acessível com motoristas treinados e veículos adaptados, garantindo uma experiência de mobilidade digna, segura e inclusiva.

### 🎯 Missão

Democratizar o acesso ao transporte urbano, eliminando barreiras e promovendo a independência de pessoas com deficiência através de tecnologia assistiva avançada e uma rede de transporte verdadeiramente inclusiva.

## 🌟 Proposta e Objetivos

### **Problema Identificado**
- Falta de opções de transporte acessível para pessoas com deficiência
- Dificuldade em encontrar veículos adaptados às necessidades específicas
- Ausência de comunicação adequada entre usuários e motoristas
- Interface inadequada para pessoas com diferentes tipos de deficiência

### **Solução Proposta**
Um ecossistema completo de mobilidade que oferece:

#### 🔹 **Para Usuários com Deficiência:**
- **Interface Totalmente Acessível**: Suporte completo a leitores de tela, navegação por teclado e comandos de voz
- **Personalização Avançada**: Ajustes de fonte, contraste, redução de movimento e feedback háptico
- **Comunicação Inclusiva**: Interface em texto, voz e símbolos visuais
- **Segurança Prioritária**: Sistema de contatos de emergência e monitoramento em tempo real
- **Agendamento Inteligente**: Possibilidade de agendar viagens com antecedência

#### 🔹 **Para Motoristas Parceiros:**
- **Treinamento Especializado**: Capacitação para atender diferentes tipos de deficiência
- **Veículos Adaptados**: Cadastro detalhado de equipamentos de acessibilidade
- **Comunicação Eficiente**: Ferramentas para comunicação clara com passageiros
- **Dashboard Dedicado**: Interface otimizada para gerenciar corridas e disponibilidade

#### 🔹 **Funcionalidades Únicas:**
- **Matching Inteligente**: Algoritmo que conecta usuários com motoristas mais adequados às suas necessidades
- **Avaliação Bidirecional**: Sistema de feedback para melhorar continuamente o serviço
- **Suporte Multilíngue**: Interface em português com síntese de voz nativa
- **Integração com Saúde**: Conexão com serviços médicos e terapêuticos

## 🛠️ Especificações Técnicas

### **Arquitetura da Aplicação**

#### **Frontend (React + TypeScript)**
```
src/
├── components/              # Componentes reutilizáveis
│   ├── ui/                 # Componentes base (shadcn/ui)
│   ├── AccessibleButton.tsx # Botão com recursos de acessibilidade
│   ├── VoiceInterface.tsx  # Interface de comando de voz
│   ├── DatabaseTest.tsx    # Componente de teste do Firebase
│   └── [outros componentes]
├── contexts/               # Gerenciamento de estado global
│   ├── AccessibilityContext.tsx # Configurações de acessibilidade
│   ├── ThemeContext.tsx    # Temas e aparência
│   └── UserContext.tsx     # Dados do usuário
├── hooks/                  # Hooks personalizados
│   ├── useGeoLocation.ts   # Geolocalização
│   ├── useGeocoding.ts     # Geocodificação
│   └── use-toast.ts        # Sistema de notificações
├── lib/                    # Configurações e utilitários
│   ├── firebase.ts         # Configuração do Firebase
│   ├── seedData.ts         # Dados fictícios para desenvolvimento
│   └── utils.ts            # Funções utilitárias
└── pages/                  # Páginas da aplicação
    ├── Index.tsx           # Página inicial
    └── NotFound.tsx        # Página 404
```

#### **Backend (Firebase)**
```
Firestore Collections:
├── usuarios/               # Perfis de usuários
│   ├── configuracaoAcessibilidade
│   ├── endereco
│   └── tipoDeficiencia
├── motoristas/             # Perfis de motoristas
│   ├── veiculo
│   ├── acessibilidade
│   └── avaliacaoMedia
├── corridas/               # Histórico de viagens
│   ├── origem/destino
│   ├── status
│   └── avaliacoes
└── contatos_emergencia/    # Contatos de emergência
    ├── usuarioId
    ├── telefone
    └── relacao
```

### **Tecnologias Utilizadas**

#### **Core Framework**
- **React 18.3.1**: Framework principal com Concurrent Features
- **TypeScript 5.5.3**: Tipagem estática para maior robustez
- **Vite 5.4.19**: Build tool rápido com HMR

#### **Interface e Acessibilidade**
- **Tailwind CSS 3.4.11**: Framework CSS utilitário
- **shadcn/ui**: Componentes acessíveis baseados em Radix UI
- **Radix UI**: Primitivos acessíveis por padrão
- **Lucide React**: Ícones otimizados e acessíveis

#### **Backend e Dados**
- **Firebase 11.10.0**: Plataforma backend completa
  - **Firestore**: Banco de dados NoSQL em tempo real
  - **Authentication**: Sistema de autenticação
  - **Hosting**: Hospedagem de aplicações web
- **TanStack React Query**: Gerenciamento de estado do servidor

#### **Mobile e Multiplataforma**
- **Capacitor 7.4.0**: Framework para aplicações híbridas
  - Suporte para iOS e Android
  - Acesso às APIs nativas do dispositivo
  - Integração com recursos de acessibilidade nativos

#### **Formulários e Validação**
- **React Hook Form 7.53.0**: Formulários performáticos
- **Zod 3.23.8**: Validação de schema TypeScript-first

#### **Desenvolvimento e Qualidade**
- **ESLint**: Análise estática de código
- **ESLint Security Plugin**: Verificação de vulnerabilidades
- **Vitest**: Framework de testes unitários
- **React Testing Library**: Testes focados em acessibilidade

### **Recursos de Acessibilidade Implementados**

#### **🎨 Personalização Visual**
- **Tamanhos de Fonte**: 16px, 18px, 24px
- **Modo Alto Contraste**: Esquemas de cores otimizados
- **Tema Claro/Escuro**: Suporte automático a preferências do sistema
- **Redução de Movimento**: Respeita `prefers-reduced-motion`

#### **🔊 Interface Sonora**
- **Síntese de Voz**: Web Speech API com voz em português (pt-BR)
- **Reconhecimento de Voz**: Comandos de voz para navegação
- **Feedback Sonoro**: Confirmações audíveis para ações importantes

#### **📱 Interação Háptica**
- **Vibração Customizada**: Padrões específicos para diferentes notificações
- **Feedback Tátil**: Confirmação de toques e gestos

#### **⌨️ Navegação por Teclado**
- **Tab Order**: Ordem lógica de navegação
- **Focus Visible**: Indicadores claros de foco
- **Atalhos de Teclado**: Navegação rápida por funcionalidades

#### **📱 Compatibilidade com Leitores de Tela**
- **ARIA Labels**: Rotulagem semântica completa
- **Live Regions**: Anúncios de mudanças dinâmicas
- **Landmarks**: Estrutura clara de navegação

## 🚀 Instalação e Configuração

### **Pré-requisitos**
- Node.js 18+ (recomendado: usar [nvm](https://github.com/nvm-sh/nvm))
- npm ou yarn
- Conta no Firebase
- Git

### **1. Clonagem do Projeto**
```bash
git clone https://github.com/emenezes93/acessivel-mobility.git
cd acessivel-mobility
```

### **2. Instalação de Dependências**
```bash
npm install
```

### **3. Configuração do Firebase**

#### **3.1. Criar Projeto no Firebase**
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Crie um novo projeto chamado `acessivel-mobility`
3. Habilite Authentication > Sign-in method > Anonymous
4. Crie Firestore Database em modo de teste

#### **3.2. Configurar Variáveis de Ambiente**
```bash
# Copie o arquivo de exemplo
cp .env.local.example .env.local

# Edite com suas credenciais do Firebase
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

#### **3.3. Configurar Regras do Firestore**
```bash
# Deploy das regras de segurança
firebase deploy --only firestore:rules
```

### **4. Execução do Projeto**

#### **Desenvolvimento**
```bash
npm run dev
# Acesse: http://localhost:8080
```

#### **Build de Produção**
```bash
npm run build
npm run preview
```

#### **Testes**
```bash
npm run test           # Executar testes
npm run test:watch     # Modo watch
npm run test:coverage  # Com cobertura
```

#### **Linting**
```bash
npm run lint           # Verificar código
npm run lint:fix       # Corrigir automaticamente
```

### **5. Deploy Mobile (Capacitor)**

#### **Android**
```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

#### **iOS**
```bash
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios
```

## 🧪 Testando a Aplicação

### **1. Teste de Conectividade**
1. Acesse a aplicação
2. Navegue até "Teste do Banco de Dados"
3. Execute "🧪 Executar Testes" para validar conexão
4. Execute "📊 Popular Dados" para carregar dados fictícios

### **2. Teste de Acessibilidade**
- Use leitores de tela (NVDA, JAWS, VoiceOver)
- Navegue apenas com teclado (Tab, Enter, Esc)
- Teste comandos de voz
- Verifique feedback háptico em dispositivos móveis

### **3. Teste de Funcionalidades**
- Configurações de acessibilidade
- Agendamento de corridas
- Sistema de emergência
- Chat e comunicação
- Avaliações

## 📊 Estrutura de Dados

### **Usuários (Collection: `usuarios`)**
```typescript
interface Usuario {
  nome: string;
  email: string;
  telefone: string;
  tipoDeficiencia: 'visual' | 'auditiva' | 'motora' | 'cognitiva' | 'multipla';
  configuracaoAcessibilidade: {
    tamanhoFonte: 16 | 18 | 24;
    altoContraste: boolean;
    vozSintetizada: boolean;
    vibracaoHaptica: boolean;
    reducaoMovimento: boolean;
  };
  endereco: {
    rua: string;
    bairro: string;
    cidade: string;
    cep: string;
    coordenadas: { lat: number; lng: number };
  };
  criadoEm: string;
  ativo: boolean;
}
```

### **Motoristas (Collection: `motoristas`)**
```typescript
interface Motorista {
  nome: string;
  email: string;
  telefone: string;
  cnh: string;
  veiculo: {
    marca: string;
    modelo: string;
    ano: number;
    placa: string;
    cor: string;
    acessibilidade: string[]; // ['rampa', 'espaco_cadeirante', 'audio_descricao']
  };
  avaliacaoMedia: number;
  totalCorridas: number;
  disponivel: boolean;
  localizacaoAtual: { lat: number; lng: number };
  verificado: boolean;
}
```

### **Corridas (Collection: `corridas`)**
```typescript
interface Corrida {
  usuarioId: string;
  motoristaId: string;
  origem: {
    endereco: string;
    coordenadas: { lat: number; lng: number };
  };
  destino: {
    endereco: string;
    coordenadas: { lat: number; lng: number };
  };
  status: 'pendente' | 'aceita' | 'em_andamento' | 'concluida' | 'cancelada';
  valor: number;
  distanciaKm: number;
  duracaoMinutos: number;
  tipoPagamento: 'dinheiro' | 'cartao' | 'pix';
  avaliacaoUsuario?: number;
  avaliacaoMotorista?: number;
  observacoes?: string;
  criadaEm: string;
  iniciadaEm?: string;
  finalizadaEm?: string;
}
```

## 🔒 Segurança e Privacidade

### **Proteção de Dados**
- Criptografia de dados sensíveis
- Regras de segurança do Firestore
- Autenticação obrigatória para todas as operações
- Logs de auditoria para alterações críticas

### **Privacidade**
- Dados de localização temporários
- Opção de exclusão completa de dados
- Conformidade com LGPD
- Minimização de coleta de dados

## 🤝 Contribuição

### **Como Contribuir**
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### **Padrões de Código**
- Siga as configurações do ESLint
- Mantenha 100% de cobertura de testes para funcionalidades críticas
- Documente APIs e componentes complexos
- Priorize acessibilidade em todas as implementações

## 📝 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Equipe

- **Desenvolvimento Frontend**: [Seu Nome]
- **Especialista em Acessibilidade**: [Nome]
- **Designer UX/UI**: [Nome]
- **Especialista Firebase**: [Nome]

## 📞 Suporte

- **Email**: suporte@acessivelmobility.com.br
- **Website**: https://acessivelmobility.com.br
- **Issues**: [GitHub Issues](https://github.com/emenezes93/acessivel-mobility/issues)

---

**🌟 Juntos construindo um futuro mais inclusivo e acessível! 🌟**