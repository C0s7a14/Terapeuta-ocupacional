/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        rosewood: {
          50: "#fff8f8",
          100: "#fbecee",
          200: "#f3d5da",
          300: "#e8b4bd",
          400: "#d78e9c",
          500: "#be6f7e",
          600: "#a95364",
          700: "#8c4352",
          800: "#743a46",
          900: "#63353f"
        },
        cream: "#fcf9f7",
        nude: "#eadbd4"
      },
      boxShadow: {
        soft: "0 12px 35px rgba(112, 61, 73, 0.08)"
      }
    }
  },
  plugins: []
};

