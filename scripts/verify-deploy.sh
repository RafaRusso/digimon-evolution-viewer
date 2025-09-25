#!/bin/bash

# Script de verificação pós-deploy - Digimon Evolution
set -e

echo "🔍 Verificando deploy do Digimon Evolution..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URLs dos serviços (configure conforme seu deploy)
API_URL=${1:-"https://digimon-evolution-api.onrender.com"}
FRONTEND_URL=${2:-"https://digimon-evolution-frontend.onrender.com"}

# Função para log
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Função para testar endpoint
test_endpoint() {
    local url=$1
    local expected_status=${2:-200}
    local description=$3
    
    log "Testando: $description"
    log "URL: $url"
    
    local response=$(curl -s -w "%{http_code}" -o /tmp/response.txt "$url" || echo "000")
    local body=$(cat /tmp/response.txt 2>/dev/null || echo "")
    
    if [ "$response" = "$expected_status" ]; then
        success "$description - Status: $response ✅"
        return 0
    else
        error "$description - Status: $response ❌"
        if [ ! -z "$body" ]; then
            echo "Response: $body"
        fi
        return 1
    fi
}

# Função para testar JSON endpoint
test_json_endpoint() {
    local url=$1
    local description=$2
    
    log "Testando JSON: $description"
    log "URL: $url"
    
    local response=$(curl -s -w "%{http_code}" -H "Accept: application/json" -o /tmp/response.json "$url" || echo "000")
    
    if [ "$response" = "200" ]; then
        # Verificar se é JSON válido
        if jq empty /tmp/response.json 2>/dev/null; then
            local success_field=$(jq -r '.success // empty' /tmp/response.json 2>/dev/null)
            if [ "$success_field" = "true" ]; then
                success "$description - JSON válido com success=true ✅"
                return 0
            else
                warning "$description - JSON válido mas success≠true ⚠️"
                return 1
            fi
        else
            error "$description - Resposta não é JSON válido ❌"
            return 1
        fi
    else
        error "$description - Status: $response ❌"
        return 1
    fi
}

# Contador de testes
TOTAL_TESTS=0
PASSED_TESTS=0

run_test() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if "$@"; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
    fi
}

echo ""
echo "🚀 Iniciando verificação dos serviços..."
echo "📍 API: $API_URL"
echo "📍 Frontend: $FRONTEND_URL"
echo ""

# Testes da API
echo "🔧 Testando API Backend..."
echo "================================"

run_test test_json_endpoint "$API_URL/health" "Health Check da API"
run_test test_json_endpoint "$API_URL/api/digimons/stats" "Estatísticas dos Digimons"
run_test test_json_endpoint "$API_URL/api/digimons?limit=5" "Listagem de Digimons"
run_test test_json_endpoint "$API_URL/api/digimons/search?q=Agumon&limit=3" "Busca de Digimons"

# Teste específico para documentação
run_test test_endpoint "$API_URL/docs" "200" "Documentação Swagger"

echo ""

# Testes do Frontend
echo "🎨 Testando Frontend..."
echo "========================"

run_test test_endpoint "$FRONTEND_URL" "200" "Página Principal"
run_test test_endpoint "$FRONTEND_URL/favicon.ico" "200" "Favicon"

# Verificar se o frontend consegue carregar recursos estáticos
run_test test_endpoint "$FRONTEND_URL/assets/" "404" "Diretório de Assets (404 esperado)"

echo ""

# Testes de integração
echo "🔗 Testando Integração API + Frontend..."
echo "========================================="

# Verificar se o frontend consegue acessar a API (teste de CORS)
log "Verificando CORS..."
CORS_TEST=$(curl -s -H "Origin: $FRONTEND_URL" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS "$API_URL/api/digimons" -w "%{http_code}" -o /dev/null || echo "000")

if [ "$CORS_TEST" = "200" ] || [ "$CORS_TEST" = "204" ]; then
    success "CORS configurado corretamente ✅"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    error "CORS pode estar mal configurado - Status: $CORS_TEST ❌"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""

# Testes de performance
echo "⚡ Testando Performance..."
echo "=========================="

# Teste de tempo de resposta da API
log "Medindo tempo de resposta da API..."
API_TIME=$(curl -s -w "%{time_total}" -o /dev/null "$API_URL/health" || echo "999")
if (( $(echo "$API_TIME < 2.0" | bc -l) )); then
    success "Tempo de resposta da API: ${API_TIME}s ✅"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    warning "Tempo de resposta da API lento: ${API_TIME}s ⚠️"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Teste de tempo de resposta do Frontend
log "Medindo tempo de resposta do Frontend..."
FRONTEND_TIME=$(curl -s -w "%{time_total}" -o /dev/null "$FRONTEND_URL" || echo "999")
if (( $(echo "$FRONTEND_TIME < 3.0" | bc -l) )); then
    success "Tempo de resposta do Frontend: ${FRONTEND_TIME}s ✅"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    warning "Tempo de resposta do Frontend lento: ${FRONTEND_TIME}s ⚠️"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""

# Testes de segurança básicos
echo "🔒 Testando Segurança..."
echo "========================"

# Verificar headers de segurança
log "Verificando headers de segurança..."
SECURITY_HEADERS=$(curl -s -I "$FRONTEND_URL" | grep -i "x-frame-options\|x-content-type-options\|x-xss-protection" | wc -l)
if [ "$SECURITY_HEADERS" -gt 0 ]; then
    success "Headers de segurança encontrados ✅"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    warning "Headers de segurança não encontrados ⚠️"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Verificar HTTPS
log "Verificando HTTPS..."
if [[ $API_URL == https://* ]] && [[ $FRONTEND_URL == https://* ]]; then
    success "HTTPS habilitado em ambos os serviços ✅"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    error "HTTPS não habilitado em todos os serviços ❌"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""

# Resumo final
echo "📊 Resumo da Verificação"
echo "========================"
echo "Total de testes: $TOTAL_TESTS"
echo "Testes passaram: $PASSED_TESTS"
echo "Testes falharam: $((TOTAL_TESTS - PASSED_TESTS))"

PERCENTAGE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
echo "Taxa de sucesso: $PERCENTAGE%"

echo ""

if [ $PERCENTAGE -ge 90 ]; then
    success "🎉 Deploy verificado com sucesso! Aplicação está funcionando corretamente."
    echo ""
    echo "🔗 Links úteis:"
    echo "   📱 Aplicação: $FRONTEND_URL"
    echo "   🔧 API: $API_URL"
    echo "   📚 Documentação: $API_URL/docs"
    echo "   ❤️ Health Check: $API_URL/health"
    exit 0
elif [ $PERCENTAGE -ge 70 ]; then
    warning "⚠️ Deploy parcialmente funcional. Alguns problemas detectados."
    echo ""
    echo "🔧 Recomendações:"
    echo "   1. Verificar logs dos serviços no Render"
    echo "   2. Confirmar variáveis de ambiente"
    echo "   3. Testar funcionalidades manualmente"
    exit 1
else
    error "❌ Deploy com problemas significativos. Intervenção necessária."
    echo ""
    echo "🆘 Ações recomendadas:"
    echo "   1. Verificar logs detalhados no Render"
    echo "   2. Confirmar configuração do Supabase"
    echo "   3. Verificar variáveis de ambiente"
    echo "   4. Testar build local com Docker"
    exit 2
fi
