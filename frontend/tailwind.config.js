/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#e8f5e9',
          DEFAULT: '#2e7d32',
          dark: '#1b5e20',
        },
        earth: {
          light: '#d7ccc8',
          DEFAULT: '#8d6e63',
          dark: '#4e342e',
        },
        harvest: {
          light: '#ffe082',
          DEFAULT: '#f57c00',
          dark: '#e65100',
        }
      }
    },
  },
  plugins: [],
}
