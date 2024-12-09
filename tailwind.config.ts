import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        dark: "var(--dark)",
        lightDark: "var(--lightDark)",
        light: "var(--light)",
        primary: "var(--primary)",
        primaryLight: "var(--primaryLight)",
        secondary: "var(--secondary)",
        secondaryLight: "var(--secondaryLight)",
        transparent: "var(--transparent)",
        transparentLight: "var(--transparentLight)",
      },
    },
  },
  plugins: [],
} satisfies Config;
