/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    // Safelist dynamic admin sidebar colors used via template strings
    { pattern: /(bg|text)-(indigo|purple|emerald|rose|amber|sky|gray)-(50|100|800)/ }
  ],
  theme: {
    extend: {
      colors: {
        'vault-primary': '#3b82f6',
        'vault-secondary': '#10b981',
        'vault-warning': '#f59e0b',
        'vault-danger': '#ef4444',
      },
    },
  },
  plugins: [],
}