# Configuração SonarQube Local para Repositórios Privados

## Opção 1: SonarQube Local com Docker

### 1. Iniciar SonarQube
```bash
docker-compose -f docker-compose.sonar.yml up -d
```

### 2. Configurar SonarQube
1. Acesse: http://localhost:9000
2. Login: `admin` / `admin` (altere a senha)
3. Crie um novo projeto:
   - Project key: `acessivel-mobility`
   - Display name: `Acessivel Mobility`
4. Gere um token de acesso

### 3. Configurar GitHub Secrets
- `SONAR_TOKEN`: Token gerado no SonarQube local
- `SONAR_HOST_URL`: `http://localhost:9000`

### 4. Executar análise local
```bash
# Instalar SonarQube Scanner
npm install -g sonarqube-scanner

# Executar análise
sonar-scanner
```

## Opção 2: GitHub Actions com Self-hosted Runner

### 1. Configurar Self-hosted Runner
1. Repository Settings → Actions → Runners
2. Clique "New self-hosted runner"
3. Siga as instruções para seu OS

### 2. Modificar workflow para self-hosted
```yaml
jobs:
  quality-check:
    runs-on: self-hosted  # Em vez de ubuntu-latest
```

## Opção 3: Análise Local sem CI/CD

### 1. Instalar dependências
```bash
npm install -g sonarqube-scanner
```

### 2. Executar testes e análise local
```bash
# Executar testes com cobertura
npm run test:coverage

# Executar lint
npm run lint

# Executar SonarQube Scanner
sonar-scanner
```

## Opção 4: GitLab CI/CD (Alternativa)

Se preferir GitLab (oferece CI/CD gratuito para repos privados):

### 1. Criar conta no GitLab
### 2. Importar repositório do GitHub
### 3. Configurar `.gitlab-ci.yml`

```yaml
stages:
  - test
  - quality

variables:
  npm_config_cache: "$CI_PROJECT_DIR/.npm"

cache:
  paths:
    - .npm/

test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm run lint
    - npm run test:coverage
    - npm run build
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

sonarqube:
  stage: quality
  image: sonarsource/sonar-scanner-cli:latest
  script:
    - sonar-scanner
  only:
    - main
    - develop
```

## Opção 5: Netlify/Vercel Build Checks

Configure build checks em plataformas gratuitas:

### Netlify
1. Conecte repositório GitHub
2. Configure build command: `npm run build`
3. Adicione script de verificação no package.json

### Vercel
1. Importe projeto do GitHub
2. Configure verificações automáticas

## Recomendação

Para validação rápida sem expor o código:
1. **Use SonarQube local** (Opção 1)
2. **Configure self-hosted runner** (Opção 2) 
3. **Execute análise local** (Opção 3)

Qual opção prefere implementar?