# Guia Docker - Digimon Evolution

Este guia explica como usar Docker para desenvolvimento e produção do projeto Digimon Evolution.

## 📋 Pré-requisitos

- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM disponível
- 10GB espaço em disco

## 🚀 Início Rápido

### 1. Configurar Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.docker.example .env

# Editar variáveis (obrigatório)
nano .env
```

### 2. Build e Execução

```bash
# Desenvolvimento
./scripts/build.sh dev

# Produção
./scripts/build.sh prod
```

### 3. Acessar Aplicação

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3001
- **Documentação**: http://localhost:3001/docs

## 🏗️ Arquitetura Docker

### Estrutura de Containers

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │      API        │
│   (React/Vite)  │◄──►│   (Fastify)     │
│   Port: 5173    │    │   Port: 3001    │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
            ┌─────────────────┐
            │    Network      │
            │ digimon-network │
            └─────────────────┘
```

### Multi-stage Builds

#### API (Node.js)
- **base**: Configuração comum
- **deps**: Dependências de produção
- **dev**: Ambiente de desenvolvimento
- **build**: Build e lint
- **production**: Imagem final otimizada

#### Frontend (React)
- **base**: Configuração comum
- **deps**: Dependências
- **dev**: Servidor de desenvolvimento
- **build**: Build da aplicação
- **production**: Nginx com arquivos estáticos

## 🛠️ Comandos Docker

### Desenvolvimento

```bash
# Iniciar em modo desenvolvimento
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f

# Reiniciar serviço específico
docker-compose restart api
docker-compose restart frontend

# Parar todos os serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

### Produção

```bash
# Build para produção
docker-compose -f docker-compose.prod.yml build

# Iniciar em produção
docker-compose -f docker-compose.prod.yml up -d

# Ver status
docker-compose -f docker-compose.prod.yml ps

# Logs de produção
docker-compose -f docker-compose.prod.yml logs
```

### Manutenção

```bash
# Limpar containers parados
docker container prune

# Limpar imagens não utilizadas
docker image prune

# Limpar tudo (cuidado!)
docker system prune -a

# Ver uso de espaço
docker system df
```

## 🔧 Configuração Avançada

### Variáveis de Ambiente

#### Desenvolvimento (.env)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_MAX=1000
LOG_LEVEL=debug
```

#### Produção
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
API_URL=https://your-api.onrender.com
FRONTEND_URL=https://your-app.onrender.com
RATE_LIMIT_MAX=100
LOG_LEVEL=info
```

### Volumes

#### Desenvolvimento
- Código fonte montado como volume
- Hot reload habilitado
- node_modules preservados

#### Produção
- Sem volumes de código
- Dados persistentes em volumes nomeados
- Logs em volumes

### Networks

- **digimon-network**: Rede bridge personalizada
- Comunicação interna entre containers
- Isolamento de outros projetos

## 🔍 Debugging

### Logs Detalhados

```bash
# Logs específicos
docker-compose logs api
docker-compose logs frontend

# Logs com timestamp
docker-compose logs -t

# Últimas 100 linhas
docker-compose logs --tail=100

# Seguir logs em tempo real
docker-compose logs -f api
```

### Executar Comandos nos Containers

```bash
# Shell no container da API
docker-compose exec api sh

# Shell no container do frontend
docker-compose exec frontend sh

# Executar comando específico
docker-compose exec api npm run lint
```

### Health Checks

```bash
# Verificar status dos health checks
docker-compose ps

# Logs do health check
docker inspect digimon-api | grep -A 10 Health
```

## 🚀 Deploy com Docker

### Build para Produção

```bash
# Build das imagens
docker build -t digimon-api:latest ./digimon-api
docker build -t digimon-frontend:latest ./digimon-frontend

# Tag para registry
docker tag digimon-api:latest your-registry/digimon-api:latest
docker tag digimon-frontend:latest your-registry/digimon-frontend:latest

# Push para registry
docker push your-registry/digimon-api:latest
docker push your-registry/digimon-frontend:latest
```

### Docker Registry

```bash
# Login no registry
docker login your-registry.com

# Build e push automatizado
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml push
```

## 📊 Monitoramento

### Métricas dos Containers

```bash
# Uso de recursos
docker stats

# Informações detalhadas
docker inspect digimon-api
docker inspect digimon-frontend

# Processos rodando
docker-compose top
```

### Logs Estruturados

```bash
# Logs em JSON
docker-compose logs --json

# Filtrar por nível
docker-compose logs | grep ERROR
docker-compose logs | grep WARN
```

## 🔒 Segurança

### Boas Práticas Implementadas

1. **Usuário não-root** nos containers
2. **Multi-stage builds** para imagens menores
3. **Health checks** para monitoramento
4. **Secrets** via variáveis de ambiente
5. **Network isolation** entre containers
6. **Read-only filesystem** onde possível

### Scanning de Vulnerabilidades

```bash
# Scan da imagem da API
docker scan digimon-api:latest

# Scan da imagem do frontend
docker scan digimon-frontend:latest
```

## 🐛 Troubleshooting

### Problemas Comuns

#### Container não inicia
```bash
# Verificar logs
docker-compose logs api

# Verificar configuração
docker-compose config

# Verificar recursos
docker system df
```

#### Erro de conexão entre containers
```bash
# Verificar network
docker network ls
docker network inspect digimon-network

# Testar conectividade
docker-compose exec frontend ping api
```

#### Problemas de permissão
```bash
# Verificar usuário no container
docker-compose exec api whoami

# Verificar permissões de arquivos
docker-compose exec api ls -la
```

#### Porta já em uso
```bash
# Verificar portas em uso
netstat -tulpn | grep :3001
netstat -tulpn | grep :5173

# Parar containers conflitantes
docker ps
docker stop <container-id>
```

### Limpeza Completa

```bash
# Parar tudo
docker-compose down -v

# Remover imagens do projeto
docker rmi $(docker images | grep digimon | awk '{print $3}')

# Limpeza geral
docker system prune -a --volumes
```

## 📈 Otimização

### Performance

1. **Multi-stage builds** reduzem tamanho das imagens
2. **Layer caching** acelera builds subsequentes
3. **Health checks** garantem disponibilidade
4. **Resource limits** previnem overconsumption

### Tamanho das Imagens

```bash
# Ver tamanho das imagens
docker images | grep digimon

# Analisar layers
docker history digimon-api:latest
docker history digimon-frontend:latest
```

### Build Cache

```bash
# Build com cache
docker-compose build

# Build sem cache
docker-compose build --no-cache

# Limpar build cache
docker builder prune
```

## 📚 Recursos Adicionais

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Best Practices](https://docs.docker.com/develop/best-practices/)
- [Security Guidelines](https://docs.docker.com/engine/security/)

## 🆘 Suporte

Para problemas específicos:

1. Verifique os logs: `docker-compose logs`
2. Consulte este guia
3. Verifique a documentação oficial do Docker
4. Abra uma issue no repositório do projeto
