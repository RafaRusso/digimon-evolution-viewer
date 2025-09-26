// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Importe os módulos 'path' e 'url' do Node.js
import path from 'path'
import { fileURLToPath } from 'url'

// Calcule o __dirname manualmente a partir do import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react( ), tailwindcss()],
  resolve: {
    alias: {
      // Agora o __dirname existe e pode ser usado aqui
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
