/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#337a6c',
          light: '#68b3a3',
          dark: '#2c4842',
        },
        secondary: {
          DEFAULT: '#794d15'
        }
      },
      fontFamily: {
        'heading': ['"Roboto Slab"', 'serif'],
        'body': ['"Fira Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

