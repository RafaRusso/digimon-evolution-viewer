#!/bin/bash

# Script de deploy para Render - Digimon Evolution
set -e

echo "🚀 Preparando deploy para Render..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    error "Execute este script no diretório raiz do projeto"
fi

# Criar diretório de deploy se não existir
mkdir -p deploy

log "Preparando arquivos para deploy..."

# Copiar Dockerfiles para deploy
cp digimon-api/Dockerfile deploy/Dockerfile.api
cp digimon-frontend/Dockerfile deploy/Dockerfile.frontend

# Criar render.yaml para configuração do Render
cat > deploy/render.yaml << 'EOF'
# Configuração do Render para Digimon Evolution
services:
  # API Backend
  - type: web
    name: digimon-evolution-api
    env: docker
    dockerfilePath: ./deploy/Dockerfile.api
    dockerContext: ./digimon-api
    plan: starter
    region: oregon
    branch: main
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      - key: HOST
        value: 0.0.0.0
      - key: SUPABASE_URL
        fromDatabase:
          name: digimon-supabase
          property: connectionString
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: CORS_ORIGIN
        value: https://digimon-evolution-frontend.onrender.com
      - key: RATE_LIMIT_MAX
        value: 100
      - key: RATE_LIMIT_WINDOW
        value: 60000
      - key: LOG_LEVEL
        value: info

  # Frontend React
  - type: web
    name: digimon-evolution-frontend
    env: docker
    dockerfilePath: ./deploy/Dockerfile.frontend
    dockerContext: ./digimon-frontend
    plan: starter
    region: oregon
    branch: main
    buildCommand: |
      docker build \
        --build-arg VITE_API_URL=https://digimon-evolution-api.onrender.com \
        -t frontend .
    envVars:
      - key: VITE_API_URL
        value: https://digimon-evolution-api.onrender.com

databases:
  - name: digimon-supabase
    databaseName: postgres
    user: postgres
    plan: starter
    region: oregon
EOF

# Criar arquivo de instruções para deploy
cat > deploy/DEPLOY_INSTRUCTIONS.md << 'EOF'
# Instruções de Deploy no Render

## Pré-requisitos

1. **Conta no Render**: Crie uma conta em [render.com](https://render.com)
2. **Repositório Git**: Código deve estar em um repositório Git (GitHub, GitLab, etc.)
3. **Banco Supabase**: Configurado e com dados migrados

## Opção 1: Deploy Manual via Dashboard

### 1. Deploy da API

1. No dashboard do Render, clique em "New +"
2. Selecione "Web Service"
3. Conecte seu repositório
4. Configure:
   - **Name**: `digimon-evolution-api`
   - **Environment**: `Docker`
   - **Region**: `Oregon` (ou mais próximo)
   - **Branch**: `main`
   - **Root Directory**: `digimon-api`
   - **Dockerfile Path**: `./Dockerfile`
   - **Plan**: `Starter` ($7/mês)

5. Adicione variáveis de ambiente:
   ```
   NODE_ENV=production
   PORT=3001
   HOST=0.0.0.0
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   CORS_ORIGIN=https://your-frontend.onrender.com
   RATE_LIMIT_MAX=100
   RATE_LIMIT_WINDOW=60000
   LOG_LEVEL=info
   ```

6. Configure Health Check: `/health`
7. Clique em "Create Web Service"

### 2. Deploy do Frontend

1. Crie outro "Web Service"
2. Configure:
   - **Name**: `digimon-evolution-frontend`
   - **Environment**: `Docker`
   - **Region**: `Oregon`
   - **Branch**: `main`
   - **Root Directory**: `digimon-frontend`
   - **Dockerfile Path**: `./Dockerfile`
   - **Plan**: `Starter` ($7/mês)

3. Adicione Build Args:
   ```
   VITE_API_URL=https://your-api.onrender.com
   ```

4. Clique em "Create Web Service"

## Opção 2: Deploy via render.yaml

1. Copie o arquivo `render.yaml` para a raiz do seu repositório
2. Atualize as URLs nos arquivos conforme seus serviços
3. No Render, use "New + > Blueprint" e aponte para seu repositório

## Configurações Importantes

### Variáveis de Ambiente da API
- `SUPABASE_URL`: URL do seu projeto Supabase
- `SUPABASE_ANON_KEY`: Chave anônima do Supabase
- `CORS_ORIGIN`: URL do frontend (ex: https://app.onrender.com)

### Build Args do Frontend
- `VITE_API_URL`: URL da API (ex: https://api.onrender.com)

## Verificação do Deploy

1. **API**: Acesse `https://your-api.onrender.com/health`
2. **Frontend**: Acesse `https://your-frontend.onrender.com`
3. **Documentação**: Acesse `https://your-api.onrender.com/docs`

## Troubleshooting

### API não inicia
- Verifique logs no dashboard do Render
- Confirme variáveis de ambiente
- Teste conexão com Supabase

### Frontend não carrega dados
- Verifique se VITE_API_URL está correto
- Confirme CORS na API
- Verifique logs da API

### Problemas de CORS
- Atualize CORS_ORIGIN na API
- Verifique se URLs estão corretas

## Custos Estimados

- **API**: $7/mês (Starter Plan)
- **Frontend**: $7/mês (Starter Plan)
- **Total**: $14/mês

## Domínio Customizado (Opcional)

1. No dashboard do serviço, vá em "Settings"
2. Clique em "Custom Domains"
3. Adicione seu domínio
4. Configure DNS conforme instruções

## Monitoramento

- **Logs**: Disponíveis no dashboard
- **Métricas**: CPU, memória, requests
- **Alertas**: Configure via email/Slack
EOF

success "Arquivos de deploy preparados!"
echo ""
echo "📁 Arquivos criados em ./deploy/:"
echo "   📄 render.yaml - Configuração do Render"
echo "   📄 Dockerfile.api - Dockerfile da API"
echo "   📄 Dockerfile.frontend - Dockerfile do Frontend"
echo "   📄 DEPLOY_INSTRUCTIONS.md - Instruções detalhadas"
echo ""
echo "🚀 Próximos passos:"
echo "   1. Commit e push dos arquivos para seu repositório"
echo "   2. Siga as instruções em deploy/DEPLOY_INSTRUCTIONS.md"
echo "   3. Configure as variáveis de ambiente no Render"
echo ""
warning "⚠️  Lembre-se de configurar as variáveis de ambiente corretas!"
echo ""
