/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
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