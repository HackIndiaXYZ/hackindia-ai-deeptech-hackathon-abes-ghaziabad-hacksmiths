/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0B0F1A",
        navyLight: "#111827",
        card: "#0F172A",
        gold: "#F5A623",
        goldLight: "#FFD700",
        purple: "#7C3AED",
        purplePink: "#C026D3"
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
