import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        primary: "hsl(var(--primary) / <alpha-value>)",
        "primary-dark": "hsl(var(--color-primary-dark) / <alpha-value>)",
        "bg-alt": "hsl(var(--color-bg-alt) / <alpha-value>)",
      },
    },
  },
  plugins: [],
} satisfies Config;
