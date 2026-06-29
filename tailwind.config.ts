import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        foreground: "#ffffff",
        card: {
          DEFAULT: "#111111",
          border: "#1f1f1f",
        },
        accent: {
          blue: "#3b82f6",
          green: "#22c55e",
          amber: "#f59e0b",
          red: "#ef4444",
        },
        text: {
          primary: "#ffffff",
          secondary: "#71717a",
          muted: "#3f3f46",
        },
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-in-out",
      },
    },
  },
  plugins: [],
};
export default config;
