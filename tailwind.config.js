/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./*.js"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#a855f7',
          light: '#c084fc',
          dark: '#9333ea',
        },
        background: {
          DEFAULT: '#0f172a',
          dark: '#020617',
        }
      },
    },
  },
  plugins: [],
}
