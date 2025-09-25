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
