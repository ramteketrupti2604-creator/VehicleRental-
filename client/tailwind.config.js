/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // Blue
        accent: '#f59e0b'   // Orange for CTA
      },
      borderRadius: {
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
}