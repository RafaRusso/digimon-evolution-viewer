#!/bin/bash

# Script de build para Digimon Evolution
set -e

echo "🚀 Iniciando build do Digimon Evolution..."

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

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    error "Docker não está rodando. Inicie o Docker e tente novamente."
fi

# Verificar se docker-compose está disponível
if ! command -v docker-compose > /dev/null 2>&1; then
    error "docker-compose não está instalado."
fi

# Verificar se arquivo .env existe
if [ ! -f .env ]; then
    warning "Arquivo .env não encontrado. Copiando .env.docker.example..."
    cp .env.docker.example .env
    warning "Configure o arquivo .env com suas variáveis antes de continuar."
    exit 1
fi

# Carregar variáveis de ambiente
source .env

# Verificar variáveis obrigatórias
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    error "Variáveis SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórias no arquivo .env"
fi

# Escolher modo de build
MODE=${1:-dev}

case $MODE in
    "dev"|"development")
        log "Modo de desenvolvimento selecionado"
        COMPOSE_FILE="docker-compose.yml"
        ;;
    "prod"|"production")
        log "Modo de produção selecionado"
        COMPOSE_FILE="docker-compose.prod.yml"
        ;;
    *)
        error "Modo inválido. Use 'dev' ou 'prod'"
        ;;
esac

# Parar containers existentes
log "Parando containers existentes..."
docker-compose -f $COMPOSE_FILE down --remove-orphans

# Limpar imagens antigas (opcional)
if [ "$2" = "--clean" ]; then
    log "Limpando imagens antigas..."
    docker system prune -f
    docker image prune -f
fi

# Build das imagens
log "Construindo imagens Docker..."
docker-compose -f $COMPOSE_FILE build --no-cache

# Verificar se build foi bem-sucedido
if [ $? -eq 0 ]; then
    success "Build concluído com sucesso!"
else
    error "Falha no build"
fi

# Iniciar containers
log "Iniciando containers..."
docker-compose -f $COMPOSE_FILE up -d

# Aguardar serviços ficarem prontos
log "Aguardando serviços ficarem prontos..."
sleep 10

# Verificar health checks
log "Verificando status dos serviços..."

# Verificar API
API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health || echo "000")
if [ "$API_HEALTH" = "200" ]; then
    success "API está rodando (http://localhost:3001)"
else
    warning "API pode não estar pronta ainda (status: $API_HEALTH)"
fi

# Verificar Frontend
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 || echo "000")
if [ "$FRONTEND_HEALTH" = "200" ]; then
    success "Frontend está rodando (http://localhost:5173)"
else
    warning "Frontend pode não estar pronto ainda (status: $FRONTEND_HEALTH)"
fi

# Mostrar logs se houver problemas
if [ "$API_HEALTH" != "200" ] || [ "$FRONTEND_HEALTH" != "200" ]; then
    warning "Mostrando logs dos containers..."
    docker-compose -f $COMPOSE_FILE logs --tail=20
fi

echo ""
success "🎉 Deploy concluído!"
echo ""
echo "📋 Serviços disponíveis:"
echo "   🔗 Frontend: http://localhost:5173"
echo "   🔗 API: http://localhost:3001"
echo "   🔗 API Docs: http://localhost:3001/docs"
echo "   🔗 Health Check: http://localhost:3001/health"
echo ""
echo "📝 Comandos úteis:"
echo "   docker-compose -f $COMPOSE_FILE logs -f    # Ver logs em tempo real"
echo "   docker-compose -f $COMPOSE_FILE down       # Parar containers"
echo "   docker-compose -f $COMPOSE_FILE restart    # Reiniciar containers"
echo ""
