/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        bebas: ["'Bebas Neue'", "cursive"],
        syne: ["'Syne'", "sans-serif"],
      },
      colors: {
        brand: {
          red: "#e8210a",
          orange: "#f56a00",
        },
      },
    },
  },
  plugins: [],
}
