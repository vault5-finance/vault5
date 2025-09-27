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
        // EMI Brand Colors
        'emi-blue': {
          DEFAULT: 'rgb(15 76 140)', // --emi-blue
          light: 'rgb(59 130 246)', // --emi-blue-light
          dark: 'rgb(30 58 138)', // --emi-blue-dark
        },
        'emi-teal': {
          DEFAULT: 'rgb(8 145 178)', // --emi-teal
          light: 'rgb(6 182 212)', // --emi-teal-light
        },
        'emi-green': {
          DEFAULT: 'rgb(5 150 105)', // --emi-green
          light: 'rgb(16 185 129)', // --emi-green-light
        },
        'primary': 'rgb(26 75 140)', // --primary EMI deep blue
        'secondary': 'rgb(37 99 235)', // --secondary modern blue
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, rgb(26 75 140), rgb(37 99 235))',
        'gradient-secondary': 'linear-gradient(135deg, rgb(15 76 140), rgb(59 130 246))',
        'gradient-success': 'linear-gradient(135deg, rgb(5 150 105), rgb(16 185 129))',
        'gradient-warning': 'linear-gradient(135deg, rgb(217 119 6), rgb(245 158 11))',
        'gradient-danger': 'linear-gradient(135deg, rgb(220 38 38), rgb(239 68 68))',
        'gradient-info': 'linear-gradient(135deg, rgb(8 145 178), rgb(6 182 212))',
      },
    },
  },
  plugins: [],
}