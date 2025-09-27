import { defineConfig } from 'vite';
import path from "path";
import react from '@vitejs/plugin-react';
import packageJson from './package.json';

// --- Início da Correção para __dirname ---
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- Fim da Correção ---

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react( )],
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version)
  },
  resolve: {
    alias: {
      // Agora o __dirname existe e o alias funcionará corretamente
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
