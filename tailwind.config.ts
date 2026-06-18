import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:         "var(--bg)",
        surface:    "var(--surface)",
        "surface-el": "var(--surface-el)",
        border:     "var(--border)",
        text:       "var(--text)",
        "text-sec": "var(--text-sec)",
        "text-muted": "var(--text-muted)",
        accent:     "var(--accent)",
        "accent-hover": "var(--accent-hover)",
      },
      fontFamily: {
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest: "0.2em",
      },
    },
  },
  plugins: [],
};
export default config;
