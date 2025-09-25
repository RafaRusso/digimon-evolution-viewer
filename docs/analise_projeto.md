# Análise do Projeto Digimon Evolution

## Estrutura Atual

O projeto é uma aplicação React que funciona como uma enciclopédia de Digimons com funcionalidades de busca e visualização de linhas evolutivas.

### Componentes Principais

1. **App.jsx** - Componente principal com toda a lógica
2. **Dados** - JSON com informações dos Digimons
3. **Estilos** - CSS customizado

### Funcionalidades Implementadas

- **Busca de Digimons** por nome
- **Visualização de detalhes** de cada Digimon
- **Árvore evolutiva** mostrando predecessores e sucessores
- **Requisitos de evolução** com stats e outros critérios
- **Listagem completa** organizada por stages
- **Preview de imagens** dos Digimons
- **Interface responsiva** com tema dark/light

### Estrutura de Dados (JSON)

```json
{
  "digimons": {
    "NomeDigimon": {
      "number": 1,
      "name": "Nome",
      "stage": "I-VI+",
      "attribute": "Vaccine/Data/Virus/Variable",
      "image": "arquivo.jpg"
    }
  },
  "evolutions": {
    "DigimonOrigem": ["DigimonDestino1", "DigimonDestino2"]
  },
  "pre_evolutions": {
    "DigimonDestino": ["DigimonOrigem1", "DigimonOrigem2"]
  },
  "digimon_requirements": {
    "NomeDigimon": {
      "stats": [
        {
          "name": "stat",
          "value": "valor",
          "description": "descrição"
        }
      ],
      "other": [
        {
          "name": "tipo",
          "value": "valor",
          "description": "descrição"
        }
      ]
    }
  }
}
```

### Tecnologias Utilizadas

- **React** com hooks (useState, useEffect)
- **Lucide React** para ícones
- **Componentes UI** customizados (Button, Card, Input, etc.)
- **CSS** com classes utilitárias (Tailwind-like)
- **JSON** para dados estáticos

## Migração Proposta

### Arquitetura Alvo

**Backend (API)**
- **Fastify** como framework web
- **Supabase** como banco de dados PostgreSQL
- **Docker** para containerização
- **Render** para deploy

**Frontend**
- **React** (mantém a estrutura atual)
- **Axios/Fetch** para consumir API
- **Vite** para build

### Estrutura do Banco de Dados

**Tabelas necessárias:**

1. **digimons**
   - id (PK)
   - number (unique)
   - name (unique)
   - stage
   - attribute
   - image_url

2. **evolutions**
   - id (PK)
   - from_digimon_id (FK)
   - to_digimon_id (FK)

3. **evolution_requirements**
   - id (PK)
   - digimon_id (FK)
   - requirement_type (stats/other)
   - name
   - value
   - description

### Endpoints da API

- `GET /api/digimons` - Lista todos os Digimons
- `GET /api/digimons/:id` - Detalhes de um Digimon
- `GET /api/digimons/search?q=nome` - Busca por nome
- `GET /api/digimons/:id/evolutions` - Evoluções de um Digimon
- `GET /api/digimons/:id/evolution-line` - Linha evolutiva completa

### Vantagens da Migração

1. **Escalabilidade** - API pode ser consumida por múltiplos clientes
2. **Performance** - Queries otimizadas no banco
3. **Manutenibilidade** - Separação clara de responsabilidades
4. **Deploy independente** - Frontend e backend podem ser deployados separadamente
5. **Dados dinâmicos** - Possibilidade de adicionar/editar Digimons via admin

### Próximos Passos

1. Configurar banco Supabase
2. Desenvolver API Fastify
3. Migrar dados JSON para PostgreSQL
4. Adaptar frontend para consumir API
5. Configurar Docker
6. Deploy no Render
