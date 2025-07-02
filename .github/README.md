# GitHub Actions CI/CD Pipeline

Este projeto utiliza GitHub Actions para automatizar testes e análise de qualidade de código com SonarQube Community.

## Configuração

### 1. Secrets necessários

Configure os seguintes secrets no seu repositório GitHub (`Settings > Secrets and variables > Actions`):

- **SONAR_TOKEN**: Token de acesso do SonarQube
- **SONAR_HOST_URL**: URL do servidor SonarQube (ex: `https://sonarcloud.io`)

### 2. SonarQube Community Setup

#### Opção A: SonarCloud (Recomendado para projetos open source)
1. Acesse [SonarCloud.io](https://sonarcloud.io)
2. Faça login com sua conta GitHub
3. Importe seu repositório
4. Copie o token gerado para o secret `SONAR_TOKEN`
5. Use `https://sonarcloud.io` como `SONAR_HOST_URL`

#### Opção B: SonarQube Community Edition (Self-hosted)
1. Instale o SonarQube Community Edition
2. Configure um projeto
3. Gere um token de acesso
4. Configure a URL do seu servidor no secret `SONAR_HOST_URL`

### 3. Pipeline Features

A pipeline executa automaticamente nos seguintes eventos:
- Push para branches `main` e `develop`
- Pull requests para `main`

#### Etapas da pipeline:
1. **Checkout do código** com histórico completo
2. **Setup do Node.js** v18 com cache npm
3. **Instalação de dependências** (`npm ci`)
4. **Análise de lint** com saída JSON para SonarQube
5. **Execução de testes** com cobertura
6. **Build da aplicação**
7. **Análise SonarQube** com verificação de Quality Gate
8. **Upload de artefatos** (relatórios de cobertura e lint)

### 4. Configuração do SonarQube

O arquivo `sonar-project.properties` já está configurado com:
- Análise de código TypeScript/React
- Cobertura de testes
- Exclusões apropriadas
- Relatórios de lint
- Quality Gate habilitado

### 5. Monitoramento

- Verifique os resultados da pipeline na aba "Actions" do GitHub
- Visualize a análise detalhada no dashboard do SonarQube
- Baixe os artefatos gerados para análise local se necessário

## Troubleshooting

### Pipeline falha na etapa SonarQube
- Verifique se os secrets estão configurados corretamente
- Confirme se o projeto existe no SonarQube
- Verifique se o token tem as permissões necessárias

### Quality Gate falha
- Revise os critérios do Quality Gate no SonarQube
- Corrija os issues de qualidade e segurança reportados
- Execute os testes localmente: `npm run test:coverage`