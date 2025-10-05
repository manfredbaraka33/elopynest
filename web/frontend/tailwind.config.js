
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary-light': '#f0f0f0',
        'primary-dark': '#1a1a1a',
      },
    },
  },
  plugins: [],
}
