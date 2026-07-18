/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        collegiate: {
          navy: '#0f172a',
          blue: '#1e3a8a',
          royal: '#2563eb',
          gold: '#f59e0b',
          light: '#f8fafc'
        }
      }
    },
  },
  plugins: [],
}
