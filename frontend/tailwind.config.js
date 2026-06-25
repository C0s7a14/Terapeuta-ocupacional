/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        rosewood: {
          50: "#fff7f8",
          100: "#ffebef",
          200: "#fbd5dd",
          300: "#f4b4c2",
          400: "#e98ba0",
          500: "#d96b84",
          600: "#bf4f6b",
          700: "#9f3e57",
          800: "#85374b",
          900: "#713343"
        },
        cream: "#fdf9f7",
        nude: "#efe0da"
      },
      boxShadow: {
        soft: "0 14px 40px rgba(108, 52, 69, 0.08)",
        lift: "0 20px 55px rgba(108, 52, 69, 0.12)"
      }
    }
  },
  plugins: []
};
