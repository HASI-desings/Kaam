/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        trust: { DEFAULT: "#2563EB", deep: "#1E3A5F" },
        success: "#10B981",
        gold: "#B8860B",
        warmth: "#0F766E",
        warning: "#D98C3F",
        danger: "#C1473B",
        bg: { light: "#FAF7F2", dark: "#15171A" },
        surface: { light: "#FFFFFF", dark: "#1C1F22" },
        text: {
          light: "#2A2622",
          "light-secondary": "#6B655D",
          dark: "#EDE9E3",
          "dark-secondary": "#A19A90",
        },
        border: { light: "#E8E1D6", dark: "#2E3236" },
      },
      borderRadius: { DEFAULT: "14px" },
      boxShadow: {
        card: "0 1px 2px rgba(30,58,95,0.04), 0 4px 16px rgba(30,58,95,0.06), 0 12px 32px rgba(30,58,95,0.04)",
        "card-hover": "0 2px 4px rgba(30,58,95,0.06), 0 8px 24px rgba(30,58,95,0.10), 0 20px 48px rgba(30,58,95,0.08)",
      },
    },
  },
  plugins: [],
};
