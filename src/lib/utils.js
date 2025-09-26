import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Constrói a URL para um asset de imagem localizado em 'src/assets/images'.
 * Esta é a maneira correta de se referenciar a assets no Vite a partir do JS.
 * @param {string} imagePath - O caminho da imagem vindo da API (ex: "/images/Kuramon.jpg").
 * @returns {string} - A URL processada pelo Vite que funcionará em dev e produção.
 */
export function getAssetImageUrl(imagePath) {
  if (!imagePath) {
    // Você pode ter uma imagem placeholder em src/assets/images
    return new URL('../assets/images/placeholder.png', import.meta.url).href;
  }
  // Constrói a URL usando o padrão do Vite
  return new URL(`../assets/images/${imagePath}`, import.meta.url).href;
}