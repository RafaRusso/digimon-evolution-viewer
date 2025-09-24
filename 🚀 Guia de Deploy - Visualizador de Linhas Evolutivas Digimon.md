# 🚀 Guia de Deploy - Visualizador de Linhas Evolutivas Digimon

## 📦 Arquivos Incluídos

- **Projeto React completo** com todas as dependências
- **308 imagens de Digimons** já baixadas e otimizadas
- **Dados processados** da planilha Excel (451 Digimons, 1.057 relações evolutivas)
- **Interface moderna** com busca inteligente e navegação interativa

## 🌐 Deploy no Render (Recomendado)

### Passo 1: Preparar o Repositório
1. Extraia o arquivo `digimon-evolution-viewer-complete.zip`
2. Suba o projeto para um repositório GitHub
3. Certifique-se de que todos os arquivos estão incluídos

### Passo 2: Configurar no Render
1. Acesse [render.com](https://render.com) e faça login
2. Clique em "New +" → "Static Site"
3. Conecte seu repositório GitHub
4. Configure as seguintes opções:

**Build Settings:**
- **Build Command:** `pnpm install && pnpm run build`
- **Publish Directory:** `dist`
- **Node Version:** `18` ou superior

### Passo 3: Deploy Automático
- O Render fará o build e deploy automaticamente
- Aguarde alguns minutos para o processo completar
- Sua aplicação estará disponível em uma URL pública

## 🔧 Deploy Alternativo (Netlify)

### Opção 1: Drag & Drop
1. Execute `pnpm install && pnpm run build` localmente
2. Acesse [netlify.com](https://netlify.com)
3. Arraste a pasta `dist` para a área de deploy

### Opção 2: Git Integration
1. Conecte seu repositório GitHub
2. **Build Command:** `pnpm install && pnpm run build`
3. **Publish Directory:** `dist`

## 🏠 Deploy Local para Testes

```bash
# Instalar dependências
pnpm install

# Executar em modo desenvolvimento
pnpm run dev

# Construir para produção
pnpm run build

# Servir build local (opcional)
pnpm run preview
```

## 📁 Estrutura do Projeto

```
digimon-evolution-viewer/
├── src/
│   ├── assets/
│   │   ├── images/           # 308 imagens de Digimons
│   │   └── digimon_data.json # Dados processados
│   ├── components/ui/        # Componentes shadcn/ui
│   ├── App.jsx              # Componente principal
│   ├── App.css              # Estilos Tailwind
│   └── main.jsx             # Entry point
├── package.json             # Dependências
├── vite.config.js          # Configuração Vite
└── index.html              # HTML base
```

## ⚙️ Configurações Importantes

### package.json
```json
{
  "name": "digimon-evolution-viewer",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.468.0"
  }
}
```

### vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

## 🎯 Funcionalidades Implementadas

### ✨ Busca Inteligente
- Busca em tempo real por nome de Digimon
- Sugestões instantâneas com imagens
- Informações completas (número, stage, atributo)

### 🖼️ Visualização com Imagens
- **308 imagens** de Digimons incluídas
- Fallback elegante para Digimons sem imagem
- Otimização automática de carregamento

### 🔍 Linha Evolutiva Completa
- **Evoluções diretas:** quem evolui para quem
- **Linha completa:** todos os predecessores e sucessores
- **Navegação interativa:** clique para explorar

### 🎨 Interface Moderna
- Design responsivo (desktop + mobile)
- Tema claro/escuro automático
- Cores organizadas por Stage e Atributo
- Animações suaves e micro-interações

## 📊 Dados Processados

- **451 Digimons** únicos catalogados
- **1.057 relações evolutivas** mapeadas
- **308 imagens** baixadas e otimizadas
- **Algoritmo recursivo** para linha evolutiva completa

## 🔧 Troubleshooting

### Problema: Build falha
**Solução:** Certifique-se de usar Node.js 18+ e pnpm

### Problema: Imagens não carregam
**Solução:** Verifique se a pasta `src/assets/images/` foi incluída

### Problema: Dados não aparecem
**Solução:** Confirme que `digimon_data.json` está em `src/assets/`

## 🚀 URLs de Exemplo

Após o deploy, você poderá:
- Buscar "Coronamon" e ver suas 6 evoluções diretas
- Explorar a linha completa com 87 sucessores
- Navegar interativamente pela árvore evolutiva
- Ver imagens de alta qualidade dos Digimons

## 📱 Compatibilidade

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Dispositivos móveis (iOS/Android)
- ✅ Tablets e desktops
- ✅ Modo claro e escuro

---

**🎉 Sua ferramenta está pronta para uso!**

Qualquer dúvida sobre o deploy, consulte a documentação da plataforma escolhida ou me avise!
