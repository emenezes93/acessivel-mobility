# 🔧 Configuração SonarCloud - Passo a Passo

## 1. 🔐 Configurar GitHub Secret

### Passo a passo:
1. Acesse seu repositório GitHub: https://github.com/emenezes93/acessivel-mobility
2. Vá em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Configure:
   - **Name**: `SONAR_TOKEN`
   - **Value**: `cce1c5993e684d82f54d7303f2125268f8fa50a9`
5. Clique **Add secret**

## 2. ✅ Arquivos Já Configurados

### ✅ `.github/workflows/ci.yml` 
- ✅ Workflow atualizado para SonarCloud v5
- ✅ Configuração conforme documentação oficial
- ✅ Jobs separados: test-and-build + sonarqube

### ✅ `sonar-project.properties`
- ✅ Project Key: `emenezes93_acessivel-mobility`
- ✅ Organization: `emenezes93`
- ✅ Configuração mínima conforme SonarCloud

## 3. 🚀 Próximos Passos

### Após configurar o GitHub Secret:

1. **Fazer commit das alterações:**
   ```bash
   git add .
   git commit -m "config: configure SonarCloud integration"
   git push origin main
   ```

2. **Verificar execução:**
   - Acesse **Actions** no GitHub
   - Verifique se ambos jobs executam:
     - ✅ Test and Build
     - ✅ SonarQube

3. **Acessar relatórios:**
   - Acesse: https://sonarcloud.io
   - Visualize análise do projeto `emenezes93_acessivel-mobility`

## 4. 📊 O que será analisado:

- **Qualidade de código**: Bugs, Code Smells, Vulnerabilidades
- **Cobertura**: Testes automatizados
- **Duplicação**: Código duplicado
- **Manutenibilidade**: Métricas de qualidade
- **Segurança**: Vulnerabilidades de segurança

## 5. 🎯 Resultado Esperado

Após a configuração:
- ✅ Pipeline completa executando
- ✅ Análise SonarCloud funcionando
- ✅ Quality Gate configurado
- ✅ Relatórios de qualidade disponíveis
- ✅ Integração GitHub + SonarCloud ativa

## ⚠️ Importante

- O token fornecido é específico para seu projeto
- Mantenha o token seguro (já está no GitHub Secrets)
- A análise executará automaticamente a cada push/PR
- Configuração atual usa defaults do SonarCloud (otimizada)