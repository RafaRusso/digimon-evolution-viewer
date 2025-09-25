# ⚡ Guia de Início Rápido - Digimon Evolution

Este guia te ajudará a ter a aplicação rodando em **menos de 10 minutos**.

## 🎯 O que você vai conseguir

Ao final deste guia, você terá:
- ✅ Aplicação rodando localmente
- ✅ Banco de dados configurado
- ✅ API funcionando
- ✅ Frontend carregando dados
- ✅ Pronto para desenvolvimento

## 📋 Checklist Rápido

### ⚡ Pré-requisitos (2 minutos)
- [ ] Docker instalado e rodando
- [ ] Node.js 18+ instalado
- [ ] Git configurado
- [ ] Conta no Supabase (gratuita)

### 🗂️ Setup do Projeto (3 minutos)
- [ ] Clonar repositório
- [ ] Configurar Supabase
- [ ] Configurar variáveis de ambiente
- [ ] Executar migração de dados

### 🚀 Execução (2 minutos)
- [ ] Build com Docker
- [ ] Verificar serviços
- [ ] Testar aplicação

### ✅ Verificação (1 minuto)
- [ ] Frontend carregando
- [ ] API respondendo
- [ ] Dados aparecendo

---

## 🚀 Passo a Passo

### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/digimon-evolution.git
cd digimon-evolution
```

### 2. Configure o Supabase

#### 2.1 Criar Projeto
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Configure:
   - **Name**: `digimon-evolution`
   - **Password**: Gere uma senha forte
   - **Region**: Escolha a mais próxima

#### 2.2 Executar Schema
1. Vá para **SQL Editor** no dashboard
2. Copie e cole o conteúdo de `supabase_schema.sql`
3. Clique em **Run**

#### 2.3 Migrar Dados
```bash
# Instalar dependência Python
pip install supabase python-dotenv

# Configurar variáveis
export SUPABASE_URL='https://seu-projeto.supabase.co'
export SUPABASE_ANON_KEY='sua-chave-aqui'

# Executar migração
python3 migrate_data.py upload/digimon_data.json
```

### 3. Configure Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.docker.example .env

# Editar com suas configurações
nano .env
```

**Conteúdo do .env:**
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon-aqui
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173
```

### 4. Execute a Aplicação
```bash
# Build e execução automática
./scripts/build.sh dev
```

### 5. Verifique se Está Funcionando

**Aguarde 1-2 minutos** para os containers iniciarem, então acesse:

- 🎨 **Frontend**: http://localhost:5173
- 🔧 **API**: http://localhost:3001
- 📚 **Docs**: http://localhost:3001/docs
- ❤️ **Health**: http://localhost:3001/health

---

## 🐛 Problemas Comuns

### ❌ Docker não está rodando
```bash
# Verificar se Docker está ativo
docker --version
docker info

# Iniciar Docker (Linux)
sudo systemctl start docker

# Iniciar Docker (macOS/Windows)
# Abrir Docker Desktop
```

### ❌ Erro de permissão no script
```bash
chmod +x scripts/build.sh
./scripts/build.sh dev
```

### ❌ Porta já em uso
```bash
# Verificar o que está usando a porta
netstat -tulpn | grep :3001
netstat -tulpn | grep :5173

# Parar containers existentes
docker-compose down
```

### ❌ Erro na migração de dados
```bash
# Verificar conexão com Supabase
curl -H "apikey: sua-chave" https://seu-projeto.supabase.co/rest/v1/

# Verificar se tabelas foram criadas
# No Supabase: Table Editor → verificar se existem as tabelas
```

### ❌ API não conecta no banco
```bash
# Verificar logs da API
docker-compose logs api

# Verificar variáveis de ambiente
docker-compose exec api env | grep SUPABASE
```

### ❌ Frontend não carrega dados
```bash
# Verificar se API está respondendo
curl http://localhost:3001/health

# Verificar logs do frontend
docker-compose logs frontend

# Verificar CORS
curl -H "Origin: http://localhost:5173" http://localhost:3001/api/digimons
```

---

## 🎯 Próximos Passos

### Para Desenvolvimento
1. **Explorar a API**: http://localhost:3001/docs
2. **Modificar componentes**: `digimon-frontend/src/components/`
3. **Adicionar endpoints**: `digimon-api/src/routes/`
4. **Ver logs em tempo real**: `docker-compose logs -f`

### Para Deploy
1. **Seguir guia completo**: [RENDER_DEPLOY_GUIDE.md](RENDER_DEPLOY_GUIDE.md)
2. **Preparar para produção**: `./scripts/deploy-render.sh`
3. **Configurar CI/CD**: Usar `.github/workflows/deploy.yml`

### Para Customização
1. **Modificar estilos**: `digimon-frontend/src/App.css`
2. **Adicionar funcionalidades**: Criar novos componentes
3. **Otimizar performance**: Configurar cache e lazy loading

---

## 📞 Precisa de Ajuda?

### 📚 Documentação Completa
- [README Principal](README.md)
- [Guia Docker](DOCKER_GUIDE.md)
- [Deploy no Render](RENDER_DEPLOY_GUIDE.md)

### 🔧 Comandos Úteis
```bash
# Ver status dos containers
docker-compose ps

# Reiniciar tudo
docker-compose restart

# Parar tudo
docker-compose down

# Rebuild completo
docker-compose down && docker-compose up --build -d

# Logs em tempo real
docker-compose logs -f

# Entrar no container da API
docker-compose exec api sh

# Entrar no container do frontend
docker-compose exec frontend sh
```

### 🆘 Suporte
- 🐛 [Abrir Issue](https://github.com/seu-usuario/digimon-evolution/issues)
- 💬 [Discussões](https://github.com/seu-usuario/digimon-evolution/discussions)

---

## ✅ Checklist Final

Antes de considerar o setup completo:

- [ ] ✅ Containers rodando: `docker-compose ps`
- [ ] ✅ API respondendo: `curl http://localhost:3001/health`
- [ ] ✅ Frontend carregando: Abrir http://localhost:5173
- [ ] ✅ Busca funcionando: Pesquisar por "Agumon"
- [ ] ✅ Dados carregando: Ver lista de Digimons
- [ ] ✅ Navegação funcionando: Clicar em um Digimon

**🎉 Parabéns! Sua aplicação Digimon Evolution está rodando!**

---

<div align="center">

**⚡ Setup completo em menos de 10 minutos!**

[🔙 Voltar ao README](README.md) • [🚀 Deploy em Produção](RENDER_DEPLOY_GUIDE.md) • [🐳 Guia Docker](DOCKER_GUIDE.md)

</div>
