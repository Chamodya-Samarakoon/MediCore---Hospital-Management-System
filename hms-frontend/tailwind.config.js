/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medicore: {
          sidebar: "#101828",
          sidebarActive: "#1d2939",
          primary: "#0284c7",
          primaryHover: "#0369a1",
          background: "#f8fafc"
        }
      }
    },
  },
  plugins: [],
}