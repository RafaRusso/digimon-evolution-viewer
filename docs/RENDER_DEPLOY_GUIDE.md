# Guia Completo de Deploy no Render - Digimon Evolution

Este guia fornece instruções detalhadas para fazer deploy da aplicação Digimon Evolution no Render.

## 📋 Pré-requisitos

### 1. Contas Necessárias
- ✅ **Render**: Conta gratuita em [render.com](https://render.com)
- ✅ **Supabase**: Projeto configurado com dados migrados
- ✅ **Git**: Repositório com o código (GitHub, GitLab, Bitbucket)

### 2. Preparação Local
- ✅ Banco Supabase configurado (ver `supabase_setup.md`)
- ✅ Dados migrados para o Supabase
- ✅ Código testado localmente
- ✅ Arquivos Docker preparados

## 🚀 Processo de Deploy

### Etapa 1: Preparar Repositório

1. **Commit todos os arquivos**:
```bash
git add .
git commit -m "feat: prepare for Render deployment"
git push origin main
```

2. **Verificar estrutura**:
```
projeto/
├── digimon-api/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── digimon-frontend/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── deploy/
│   ├── render.yaml
│   └── DEPLOY_INSTRUCTIONS.md
└── docker-compose.yml
```

### Etapa 2: Deploy da API Backend

#### 2.1 Criar Web Service

1. Acesse [render.com](https://render.com) e faça login
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório Git
4. Configure o serviço:

**Configurações Básicas:**
- **Name**: `digimon-evolution-api`
- **Environment**: `Docker`
- **Region**: `Oregon` (recomendado)
- **Branch**: `main`
- **Root Directory**: `digimon-api`

**Docker Settings:**
- **Dockerfile Path**: `./Dockerfile`

**Instance Type:**
- **Plan**: `Starter` ($7/mês) ou `Free` (limitado)

#### 2.2 Configurar Variáveis de Ambiente

Adicione as seguintes variáveis em **Environment**:

```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
CORS_ORIGIN=https://digimon-evolution-frontend.onrender.com
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
LOG_LEVEL=info
```

> ⚠️ **Importante**: Substitua `your-project-id` e `your-anon-key` pelos valores reais do Supabase

#### 2.3 Configurar Health Check

- **Health Check Path**: `/health`

#### 2.4 Deploy

1. Clique em **"Create Web Service"**
2. Aguarde o build e deploy (5-10 minutos)
3. Verifique se está funcionando: `https://your-api.onrender.com/health`

### Etapa 3: Deploy do Frontend

#### 3.1 Criar Web Service

1. Clique em **"New +"** → **"Web Service"**
2. Conecte o mesmo repositório
3. Configure o serviço:

**Configurações Básicas:**
- **Name**: `digimon-evolution-frontend`
- **Environment**: `Docker`
- **Region**: `Oregon`
- **Branch**: `main`
- **Root Directory**: `digimon-frontend`

**Docker Settings:**
- **Dockerfile Path**: `./Dockerfile`

#### 3.2 Configurar Build Args

Em **Environment**, adicione:

```env
VITE_API_URL=https://digimon-evolution-api.onrender.com
```

> ⚠️ **Importante**: Use a URL real da sua API do passo anterior

#### 3.3 Deploy

1. Clique em **"Create Web Service"**
2. Aguarde o build e deploy (5-10 minutos)
3. Verifique se está funcionando: `https://your-frontend.onrender.com`

### Etapa 4: Configurar CORS

1. Volte para o serviço da API
2. Atualize a variável `CORS_ORIGIN` com a URL real do frontend:
```env
CORS_ORIGIN=https://digimon-evolution-frontend.onrender.com
```
3. Redeploy da API

## 🔧 Configurações Avançadas

### Custom Domains

#### Para a API:
1. No dashboard da API, vá em **Settings** → **Custom Domains**
2. Adicione: `api.seudominio.com`
3. Configure DNS: `CNAME api.seudominio.com digimon-evolution-api.onrender.com`

#### Para o Frontend:
1. No dashboard do frontend, vá em **Settings** → **Custom Domains**
2. Adicione: `seudominio.com`
3. Configure DNS: `CNAME seudominio.com digimon-evolution-frontend.onrender.com`

### SSL/HTTPS

- ✅ **Automático**: Render fornece SSL gratuito
- ✅ **Custom SSL**: Disponível para domínios customizados
- ✅ **HTTP/2**: Habilitado por padrão

### Environment Variables

#### Variáveis Sensíveis:
```env
# Não commitar no Git
SUPABASE_ANON_KEY=eyJ...
DATABASE_PASSWORD=secret123
JWT_SECRET=your-jwt-secret
```

#### Variáveis Públicas:
```env
# Podem ser commitadas
NODE_ENV=production
CORS_ORIGIN=https://app.com
RATE_LIMIT_MAX=100
```

## 📊 Monitoramento

### Logs

1. **API Logs**: Dashboard → Logs
2. **Frontend Logs**: Dashboard → Logs
3. **Real-time**: Logs em tempo real no dashboard

### Métricas

- **CPU Usage**: Monitoramento automático
- **Memory Usage**: Alertas configuráveis
- **Response Time**: Métricas de performance
- **Error Rate**: Tracking de erros

### Alertas

Configure em **Settings** → **Notifications**:
- Email para deploys
- Slack para erros
- Discord para status

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Build Falha

**Sintomas**: Deploy falha durante build
**Soluções**:
```bash
# Verificar Dockerfile localmente
docker build -t test ./digimon-api
docker build -t test ./digimon-frontend

# Verificar logs no Render
# Dashboard → Logs → Build Logs
```

#### 2. API não responde

**Sintomas**: Frontend não consegue conectar na API
**Soluções**:
1. Verificar variáveis de ambiente
2. Testar health check: `https://your-api.onrender.com/health`
3. Verificar logs da API
4. Confirmar CORS configurado

#### 3. Erro de CORS

**Sintomas**: Erro no console do browser
**Soluções**:
```env
# Atualizar CORS_ORIGIN na API
CORS_ORIGIN=https://your-frontend.onrender.com

# Ou permitir múltiplas origens
CORS_ORIGIN=["https://app.com", "https://www.app.com"]
```

#### 4. Banco de dados não conecta

**Sintomas**: API retorna erro 500
**Soluções**:
1. Verificar `SUPABASE_URL` e `SUPABASE_ANON_KEY`
2. Testar conexão no Supabase dashboard
3. Verificar políticas RLS
4. Confirmar dados migrados

#### 5. Frontend carrega mas sem dados

**Sintomas**: Interface carrega mas lista vazia
**Soluções**:
1. Verificar `VITE_API_URL` no frontend
2. Testar API diretamente
3. Verificar console do browser
4. Confirmar CORS

### Comandos de Debug

```bash
# Testar API localmente
curl https://your-api.onrender.com/health
curl https://your-api.onrender.com/api/digimons/stats

# Testar frontend
curl -I https://your-frontend.onrender.com

# Verificar DNS
nslookup your-api.onrender.com
nslookup your-frontend.onrender.com
```

## 💰 Custos

### Planos Render

#### Free Tier:
- ✅ **Custo**: $0/mês
- ⚠️ **Limitações**: 
  - 750 horas/mês
  - Sleep após 15min inatividade
  - Build time limitado

#### Starter Plan:
- 💰 **Custo**: $7/mês por serviço
- ✅ **Benefícios**:
  - Sem sleep
  - Builds mais rápidos
  - Mais recursos

#### Pro Plan:
- 💰 **Custo**: $25/mês por serviço
- ✅ **Benefícios**:
  - Autoscaling
  - Mais CPU/RAM
  - Priority support

### Estimativa Total:

**Configuração Recomendada**:
- API: Starter ($7/mês)
- Frontend: Starter ($7/mês)
- **Total**: $14/mês

**Configuração Econômica**:
- API: Free ($0/mês)
- Frontend: Free ($0/mês)
- **Total**: $0/mês (com limitações)

## 🔄 CI/CD

### Auto-Deploy

1. **Configurar Webhook**:
   - Settings → Auto-Deploy
   - Habilitar para branch `main`

2. **Deploy Automático**:
```bash
# Qualquer push para main faz deploy
git push origin main
```

### Deploy Manual

```bash
# Via dashboard
Dashboard → Manual Deploy → Deploy Latest Commit

# Via API
curl -X POST https://api.render.com/deploy/srv-xxx \
  -H "Authorization: Bearer your-api-key"
```

### Rollback

1. Dashboard → Deploys
2. Selecionar deploy anterior
3. Clicar em "Redeploy"

## 📚 Recursos Adicionais

### Documentação Oficial:
- [Render Docs](https://render.com/docs)
- [Docker on Render](https://render.com/docs/docker)
- [Environment Variables](https://render.com/docs/environment-variables)

### Comunidade:
- [Render Community](https://community.render.com/)
- [Discord](https://discord.gg/render)
- [Status Page](https://status.render.com/)

### Ferramentas:
- [Render CLI](https://github.com/render-oss/render-cli)
- [Terraform Provider](https://registry.terraform.io/providers/render-oss/render)

## ✅ Checklist Final

Antes de considerar o deploy completo:

### Pré-Deploy:
- [ ] Banco Supabase configurado
- [ ] Dados migrados
- [ ] Código testado localmente
- [ ] Variáveis de ambiente definidas
- [ ] Dockerfiles testados

### Deploy:
- [ ] API deployada no Render
- [ ] Frontend deployado no Render
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado
- [ ] Health checks funcionando

### Pós-Deploy:
- [ ] API responde: `/health`
- [ ] Frontend carrega
- [ ] Busca de Digimons funciona
- [ ] Navegação entre páginas funciona
- [ ] Imagens carregam (se configuradas)

### Opcional:
- [ ] Domínio customizado configurado
- [ ] SSL configurado
- [ ] Monitoramento configurado
- [ ] Alertas configurados

## 🆘 Suporte

Se encontrar problemas:

1. **Verificar logs** no dashboard do Render
2. **Consultar este guia** para soluções comuns
3. **Testar localmente** com Docker
4. **Verificar status** do Render: [status.render.com](https://status.render.com)
5. **Comunidade** Render: [community.render.com](https://community.render.com)

---

**🎉 Parabéns!** Sua aplicação Digimon Evolution está agora rodando em produção no Render!
