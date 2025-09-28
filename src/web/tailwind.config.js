import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Suas customizações de tema aqui
    },
  },
  plugins: [
    // Use a variável importada aqui
    tailwindcssAnimate,
  ],
}
