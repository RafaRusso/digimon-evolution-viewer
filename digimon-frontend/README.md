# Digimon Evolution Frontend

Interface web moderna para a enciclopédia de Digimons, desenvolvida com React, Vite e Tailwind CSS.

## 🚀 Funcionalidades

- **Busca inteligente** de Digimons com resultados em tempo real
- **Listagem completa** com filtros por stage
- **Visualização detalhada** de linhas evolutivas
- **Interface responsiva** com tema dark/light
- **Preview de imagens** em modal
- **Status da API** em tempo real
- **Cache inteligente** com React Query
- **Animações suaves** e transições

## 🛠️ Tecnologias

- **React 19** - Framework principal
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **React Query** - Gerenciamento de estado e cache
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones

## 📋 Pré-requisitos

- Node.js 18+
- pnpm (recomendado) ou npm
- API backend rodando (ver `../digimon-api`)

## 🛠️ Instalação

1. **Instale as dependências:**
```bash
cd digimon-frontend
pnpm install
```

2. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o arquivo .env se necessário
```

3. **Inicie o servidor de desenvolvimento:**
```bash
pnpm run dev
```

4. **Acesse a aplicação:**
```
http://localhost:5173
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── DigimonCard.jsx # Card de Digimon
│   ├── DigimonSearch.jsx # Busca de Digimons
│   ├── DigimonList.jsx # Lista completa
│   ├── EvolutionView.jsx # Visualização de evolução
│   ├── ApiStatus.jsx   # Status da API
│   ├── LoadingSpinner.jsx # Spinner de loading
│   └── ErrorMessage.jsx # Mensagens de erro
├── hooks/              # Hooks customizados
│   └── useDigimons.js  # Hooks para API
├── lib/                # Utilitários
│   └── api.js          # Cliente da API
├── App.jsx             # Componente principal
├── App.css             # Estilos customizados
├── main.jsx            # Entry point
└── index.css           # Estilos globais
```

## 🎨 Componentes Principais

### DigimonCard
Componente reutilizável para exibir informações de um Digimon:
- Imagem com preview
- Informações básicas (nome, número, stage, atributo)
- Requisitos de evolução (opcional)
- Hover effects e animações

### DigimonSearch
Interface de busca com:
- Campo de busca com debounce
- Resultados em tempo real
- Loading states
- Instruções de uso

### DigimonList
Listagem completa com:
- Agrupamento por stages
- Filtros dinâmicos
- Paginação automática
- Ordenação inteligente

### EvolutionView
Visualização detalhada com:
- Informações do Digimon atual
- Predecessores e sucessores
- Árvore evolutiva completa
- Tabs para diferentes visualizações

## 🔧 Configuração

### Variáveis de Ambiente

```env
# URL da API backend
VITE_API_URL=http://localhost:3001

# Modo de desenvolvimento
VITE_DEV_MODE=true
```

### Customização de Estilos

Os estilos estão organizados em:
- `App.css` - Estilos customizados e classes utilitárias
- `index.css` - Estilos globais e reset
- Classes CSS customizadas para stages e atributos

### React Query

Configuração otimizada para:
- Cache de 10 minutos
- Retry automático (3 tentativas)
- Stale time de 5 minutos
- Background refetch

## 📱 Responsividade

A aplicação é totalmente responsiva com breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎯 Performance

### Otimizações implementadas:
- **Lazy loading** de componentes
- **Debounce** na busca (300ms)
- **Cache inteligente** com React Query
- **Imagens otimizadas** com fallback
- **Bundle splitting** automático

### Métricas esperadas:
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3s

## 🧪 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm run dev

# Build para produção
pnpm run build

# Preview da build
pnpm run preview

# Lint
pnpm run lint

# Lint com correção automática
pnpm run lint:fix
```

## 🚀 Build e Deploy

### Build local:
```bash
pnpm run build
```

### Deploy no Render:
Ver `../render_deploy.md` para instruções completas.

### Variáveis de ambiente para produção:
```env
VITE_API_URL=https://your-api.render.com
```

## 🔍 Debugging

### Logs da API:
Em desenvolvimento, todas as requisições são logadas no console.

### React Query DevTools:
Adicione para debugging:
```bash
pnpm add @tanstack/react-query-devtools
```

### Error Boundaries:
Implementados para capturar erros de componentes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

### Padrões de código:
- Use TypeScript quando possível
- Siga as convenções do ESLint
- Componentes em PascalCase
- Hooks customizados com prefixo `use`
- Props com destructuring

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.
