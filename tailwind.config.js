/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        teal: { DEFAULT: "#0F6659", light: "#1B8A76" },
        amber: { DEFAULT: "#E8A33D", light: "#F2C572" },
        success: "#3E8C5A",
        warning: "#D98C3F",
        danger: "#C1473B",
        bg: { light: "#FAFAF8", dark: "#121412" },
        text: {
          light: "#1C1F1E",
          "light-secondary": "#6B6F6C",
          dark: "#F2F2EF",
          "dark-secondary": "#A3A7A3",
        },
        border: { light: "#E3E3DF", dark: "#2A2D2A" },
      },
      borderRadius: { DEFAULT: "12px" },
    },
  },
  plugins: [],
};
