# 🔥 Visualizador de Linhas Evolutivas - Digimon

Uma aplicação web interativa para explorar as linhas evolutivas completas dos Digimons, desenvolvida a partir de dados reais com imagens incluídas.

![Digimon Evolution Viewer](https://img.shields.io/badge/React-18.3.1-blue) ![Vite](https://img.shields.io/badge/Vite-6.3.5-purple) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-cyan)

## ✨ Funcionalidades

- 🔍 **Busca Inteligente** - Encontre qualquer Digimon por nome
- 🖼️ **Imagens Incluídas** - 308 imagens de Digimons em alta qualidade
- 🌳 **Linha Evolutiva Completa** - Veja todos os predecessores e sucessores
- 🎯 **Navegação Interativa** - Clique para explorar a árvore evolutiva
- 📱 **Design Responsivo** - Funciona perfeitamente em qualquer dispositivo
- 🎨 **Interface Moderna** - Cores organizadas por Stage e Atributo

## 📊 Dados

- **451 Digimons** únicos catalogados
- **1.057 relações evolutivas** mapeadas
- **308 imagens** otimizadas incluídas
- Dados extraídos de planilha Excel oficial

## 🚀 Deploy Rápido

### Render (Recomendado)
```bash
# Build Command
pnpm install && pnpm run build

# Publish Directory
dist
```

### Netlify
```bash
# Build Command
pnpm install && pnpm run build

# Publish Directory
dist
```

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
pnpm install

# Executar em desenvolvimento
pnpm run dev

# Construir para produção
pnpm run build
```

## 🎯 Como Usar

1. **Buscar** - Digite o nome de qualquer Digimon
2. **Selecionar** - Clique no resultado desejado
3. **Explorar** - Veja evoluções diretas e linha completa
4. **Navegar** - Clique em qualquer Digimon para continuar explorando

## 🏗️ Tecnologias

- **React 18** - Framework JavaScript moderno
- **Vite** - Build tool rápido e eficiente
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes UI profissionais
- **Lucide Icons** - Ícones modernos e consistentes

## 📁 Estrutura

```
src/
├── assets/
│   ├── images/           # Imagens dos Digimons
│   └── digimon_data.json # Dados processados
├── components/ui/        # Componentes UI
├── App.jsx              # Componente principal
└── main.jsx             # Entry point
```

## 🎨 Exemplo de Uso

**Buscar "Coronamon":**
- Evolui de: Tokomon
- Evolui para: Firamon, Meramon, Growmon, Bao Hackmon, Birdramon, Agnimon
- Linha completa: 2 predecessores, 87 sucessores

## 📱 Compatibilidade

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Desktop, Tablet, Mobile
- ✅ Modo claro e escuro

## 🤝 Contribuição

Este projeto foi desenvolvido para fãs de Digimon. Sinta-se à vontade para contribuir com melhorias!

---

**Desenvolvido com ❤️ para a comunidade Digimon**
