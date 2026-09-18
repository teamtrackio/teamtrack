/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7fa', 100: '#e4e9f0', 500: '#3b5bfd', 600: '#2f47cc', 700: '#243890'
        },
        ok: '#16a34a',
        warn: '#d97706',
        danger: '#dc2626'
      }
    }
  },
  plugins: []
}
