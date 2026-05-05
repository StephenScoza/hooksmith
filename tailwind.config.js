/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forge: '#f97316',
        coal: '#111318',
        steel: '#2b2f3a'
      }
    }
  },
  plugins: []
};
