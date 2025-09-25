# 📁 Estrutura do Projeto Digimon Evolution

Este documento descreve a organização completa do projeto e a função de cada arquivo e diretório.

## 🗂️ Estrutura Geral

```
digimon-evolution-complete/
├── 📁 .github/                    # Configurações do GitHub
├── 📁 data/                       # Dados originais e assets
├── 📁 database/                   # Scripts e schemas do banco
├── 📁 deploy/                     # Configurações de deploy
├── 📁 digimon-api/               # Backend API (Fastify)
├── 📁 digimon-frontend/          # Frontend React
├── 📁 docs/                      # Documentação do projeto
├── 📁 scripts/                   # Scripts de automação
├── 📄 docker-compose.yml         # Desenvolvimento local
├── 📄 docker-compose.prod.yml    # Produção
├── 📄 render.yaml                # Deploy automático Render
├── 📄 Makefile                   # Comandos automatizados
└── 📄 README.md                  # Documentação principal
```

## 📋 Detalhamento por Diretório

### 🔧 `.github/workflows/`
Configurações de CI/CD para GitHub Actions.

```
.github/
└── workflows/
    └── deploy.yml              # Pipeline de deploy automático
```

### 📊 `data/`
Dados originais e assets do projeto.

```
data/
└── original/
    ├── App.css                 # CSS original do projeto
    ├── App.jsx                 # Componente React original
    ├── digimon_data.json       # Dados JSON dos Digimons
    ├── index.css               # Estilos globais originais
    └── main.jsx                # Entry point original
```

### 🗄️ `database/`
Scripts e configurações do banco de dados.

```
database/
├── migrations/
│   └── migrate_data.py         # Script de migração JSON → PostgreSQL
├── schemas/
│   └── supabase_schema.sql     # Schema completo do banco
└── seeds/                      # (Vazio) Para dados de teste futuros
```

### 🚀 `deploy/`
Configurações específicas para deploy em produção.

```
deploy/
├── DEPLOY_INSTRUCTIONS.md      # Instruções detalhadas de deploy
├── Dockerfile.api              # Dockerfile da API para deploy
├── Dockerfile.frontend         # Dockerfile do Frontend para deploy
└── render.yaml                 # Configuração Blueprint do Render
```

### 🔧 `digimon-api/` - Backend
API RESTful desenvolvida com Fastify.

```
digimon-api/
├── src/
│   ├── config/
│   │   └── supabase.js         # Configuração cliente Supabase
│   ├── middleware/
│   │   └── errorHandler.js     # Middleware de tratamento de erros
│   ├── routes/
│   │   ├── digimons.js         # Rotas dos endpoints de Digimons
│   │   └── health.js           # Health check e status
│   ├── services/
│   │   └── digimonService.js   # Lógica de negócio dos Digimons
│   ├── utils/
│   │   ├── response.js         # Utilitários de resposta HTTP
│   │   └── validation.js       # Validação de dados
│   └── server.js               # Servidor principal Fastify
├── tests/                      # (Vazio) Para testes futuros
├── Dockerfile                  # Container da API
├── README.md                   # Documentação da API
├── package.json                # Dependências e scripts
└── package-lock.json           # Lock das dependências
```

### 🎨 `digimon-frontend/` - Frontend
Interface React moderna e responsiva.

```
digimon-frontend/
├── public/
│   └── favicon.ico             # Ícone da aplicação
├── src/
│   ├── assets/
│   │   └── react.svg           # Logo do React
│   ├── components/
│   │   ├── ui/                 # Componentes base (shadcn/ui)
│   │   │   ├── accordion.jsx   # Componente acordeão
│   │   │   ├── alert.jsx       # Componente de alerta
│   │   │   ├── badge.jsx       # Badges e tags
│   │   │   ├── button.jsx      # Botões customizados
│   │   │   ├── card.jsx        # Cards de conteúdo
│   │   │   ├── input.jsx       # Campos de entrada
│   │   │   ├── tabs.jsx        # Componente de abas
│   │   │   └── ...             # Outros componentes UI
│   │   ├── ApiStatus.jsx       # Status da conexão com API
│   │   ├── DigimonCard.jsx     # Card individual de Digimon
│   │   ├── DigimonList.jsx     # Lista completa de Digimons
│   │   ├── DigimonSearch.jsx   # Interface de busca
│   │   ├── ErrorMessage.jsx    # Mensagens de erro
│   │   ├── EvolutionView.jsx   # Visualização de evoluções
│   │   └── LoadingSpinner.jsx  # Indicador de carregamento
│   ├── hooks/
│   │   ├── useDigimons.js      # Hooks para API de Digimons
│   │   └── use-mobile.js       # Hook para detecção mobile
│   ├── lib/
│   │   ├── api.js              # Cliente HTTP e configuração
│   │   └── utils.js            # Utilitários gerais
│   ├── App.css                 # Estilos customizados
│   ├── App.jsx                 # Componente principal
│   ├── index.css               # Estilos globais
│   └── main.jsx                # Entry point da aplicação
├── tests/                      # (Vazio) Para testes futuros
├── Dockerfile                  # Container do Frontend
├── README.md                   # Documentação do Frontend
├── components.json             # Configuração shadcn/ui
├── eslint.config.js            # Configuração ESLint
├── index.html                  # Template HTML
├── jsconfig.json               # Configuração JavaScript
├── package.json                # Dependências e scripts
├── pnpm-lock.yaml              # Lock das dependências (pnpm)
└── vite.config.js              # Configuração Vite
```

### 📚 `docs/`
Documentação completa do projeto.

```
docs/
├── DOCKER_GUIDE.md             # Guia completo do Docker
├── RENDER_DEPLOY_GUIDE.md      # Deploy detalhado no Render
├── analise_projeto.md          # Análise do projeto original
└── supabase_setup.md           # Configuração do Supabase
```

### ⚙️ `scripts/`
Scripts de automação para desenvolvimento e deploy.

```
scripts/
├── build.sh                    # Build e execução local
├── deploy-render.sh            # Preparação para deploy
└── verify-deploy.sh            # Verificação pós-deploy
```

## 📄 Arquivos Raiz

### Configuração Docker
- **`docker-compose.yml`** - Ambiente de desenvolvimento
- **`docker-compose.prod.yml`** - Ambiente de produção
- **`render.yaml`** - Deploy automático no Render

### Configuração do Projeto
- **`.env.example`** - Template de variáveis de ambiente
- **`.gitignore`** - Arquivos ignorados pelo Git
- **`Makefile`** - Comandos automatizados

### Documentação
- **`README.md`** - Documentação principal
- **`QUICK_START.md`** - Guia de início rápido
- **`PROJECT_SUMMARY.md`** - Resumo executivo
- **`CHANGELOG.md`** - Histórico de mudanças
- **`CONTRIBUTING.md`** - Guia de contribuição
- **`LICENSE`** - Licença MIT

## 🎯 Comandos Principais

### Desenvolvimento
```bash
make install        # Instalar dependências
make dev           # Executar em desenvolvimento
make logs          # Ver logs dos containers
make status        # Status dos containers
```

### Build e Deploy
```bash
make build         # Build para produção
make deploy-prep   # Preparar para deploy
make verify        # Verificar deploy
```

### Manutenção
```bash
make clean         # Limpar containers
make test          # Executar testes
make lint          # Executar linting
```

## 🔄 Fluxo de Desenvolvimento

### 1. Setup Inicial
```bash
cd digimon-evolution-complete
cp .env.example .env
# Editar .env com configurações do Supabase
make install
```

### 2. Desenvolvimento Local
```bash
make dev
# Acesse http://localhost:5173 (Frontend)
# Acesse http://localhost:3001 (API)
```

### 3. Deploy em Produção
```bash
make deploy-prep
# Seguir instruções em docs/RENDER_DEPLOY_GUIDE.md
```

## 🧩 Tecnologias por Componente

### Backend (`digimon-api/`)
- **Fastify** - Framework web
- **Supabase** - Cliente PostgreSQL
- **Docker** - Containerização

### Frontend (`digimon-frontend/`)
- **React 19** - Framework frontend
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **React Query** - Gerenciamento de estado
- **Axios** - Cliente HTTP

### Database (`database/`)
- **PostgreSQL** - Banco de dados (via Supabase)
- **Python** - Scripts de migração

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração local
- **GitHub Actions** - CI/CD
- **Render** - Plataforma de deploy

## 📊 Métricas do Projeto

### Tamanho do Código
- **Backend**: ~15 arquivos, ~2000 linhas
- **Frontend**: ~50 arquivos, ~5000 linhas
- **Documentação**: ~10 arquivos, ~3000 linhas
- **Total**: ~115 arquivos

### Performance Esperada
- **API Response Time**: < 200ms
- **Frontend Load Time**: < 2s
- **Build Time**: < 5 minutos
- **Deploy Time**: < 10 minutos

## 🔍 Próximos Passos

### Desenvolvimento
1. Configurar Supabase seguindo `docs/supabase_setup.md`
2. Executar `make dev` para desenvolvimento local
3. Testar todas as funcionalidades
4. Personalizar conforme necessário

### Deploy
1. Seguir `docs/RENDER_DEPLOY_GUIDE.md`
2. Configurar variáveis de ambiente
3. Executar deploy
4. Verificar com `make verify`

### Expansão
1. Adicionar testes automatizados
2. Implementar novas funcionalidades
3. Otimizar performance
4. Adicionar monitoramento

---

**📝 Nota**: Esta estrutura foi projetada para ser escalável e facilmente mantível. Cada componente tem responsabilidades bem definidas e pode ser desenvolvido independentemente.
