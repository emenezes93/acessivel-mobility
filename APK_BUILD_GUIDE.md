# 📱 Guia para Gerar APK - Acessível Mobility

## 🚀 Workflow GitHub Actions Criado!

Criei um workflow automatizado que gera o APK do seu app diretamente no GitHub Actions.

## 📋 Como Usar o Workflow

### 1. **Fazer Push do Workflow**
```bash
git add .github/workflows/build-apk.yml
git commit -m "feat: add Android APK build workflow"
git push origin main
```

### 2. **Executar o Build**
1. Acesse seu repositório: https://github.com/emenezes93/acessivel-mobility
2. Vá na aba **Actions**
3. Selecione **"Build Android APK"** na lista de workflows
4. Clique **"Run workflow"**
5. Escolha o tipo de build:
   - **debug**: Para testes (recomendado)
   - **release**: Para distribuição
6. Clique **"Run workflow"**

### 3. **Download do APK**
1. Aguarde o build terminar (~5-10 minutos)
2. Na página do workflow executado, vá em **Artifacts**
3. Baixe o arquivo:
   - `acessivel-mobility-debug.apk` (build debug)
   - `acessivel-mobility-release.apk` (build release)

## 🔧 O que o Workflow Faz

✅ **Configura ambiente**: Node.js 20 + Java 17 + Android SDK  
✅ **Instala dependências**: `npm ci`  
✅ **Build web**: `npm run build`  
✅ **Sincroniza Capacitor**: `npx cap sync android`  
✅ **Compila APK**: Gradle build  
✅ **Upload automático**: APK disponível para download  

## 📱 Instalação no Celular

### Método 1: Transfer direto
1. Baixe o APK no computador
2. Transfira para o celular (USB, email, cloud)
3. Abra o arquivo APK no celular
4. Autorize "Fontes desconhecidas" se solicitado
5. Instale o app

### Método 2: Link direto
1. Baixe o APK no celular
2. Abra diretamente do navegador
3. Instale conforme instruções

## 🎯 Recursos do App

- **♿ Acessibilidade Completa**: Suporte total para usuários com deficiência
- **🎙️ Interface de Voz**: Comandos e feedback em português brasileiro
- **📱 Feedback Háptico**: Vibração para confirmações
- **🌓 Temas**: Modo escuro/claro automático
- **🚗 Sistema de Caronas**: Requisição e oferecimento de caronas
- **📍 Localização**: GPS e mapas em tempo real
- **🔧 Configurações**: Personalização de acessibilidade

## 📊 Especificações Técnicas

- **Plataforma**: Android 7.0+ (API 24+)
- **Tamanho**: ~15-25 MB
- **Arquitetura**: Universal (ARM + x86)
- **Permissões**: Internet, Localização, Vibração, Áudio

## 🔄 Builds Automáticos

O workflow pode ser configurado para executar automaticamente:

```yaml
on:
  push:
    branches: [main]
    tags: ['v*']
```

## 🐛 Troubleshooting

### Se o build falhar:
1. Verifique os logs na aba Actions
2. Problemas comuns:
   - Erro de dependências: `npm ci` falhou
   - Erro Gradle: Problema no Android build
   - Timeout: Build muito longo (aumentar timeout)

### Se o APK não instalar:
1. Habilite "Fontes desconhecidas"
2. Verifique compatibilidade Android 7.0+
3. Espaço suficiente no dispositivo

## 🎉 Sucesso!

Após seguir estes passos, você terá o **Acessível Mobility** instalado em seu celular, totalmente funcional com todos os recursos de acessibilidade implementados!

**O app está pronto para transformar a mobilidade urbana acessível! 🚀♿**