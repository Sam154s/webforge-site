import type { Config } from "tailwindcss";

// One background (warm grey), one ink, one accent (chartreuse), one signal (electric blue, live data only).
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        stone: "#E8E6E1",
        ink: "#111111",
        dim: "#5E5B55",
        line: "#CFCBC3",
        lime: "#D9F24A",
        signal: "#2B59FF",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: { page: "86rem" },
      transitionTimingFunction: { apple: "cubic-bezier(.25,.1,.25,1)", out: "cubic-bezier(.16,1,.3,1)" },
    },
  },
  plugins: [],
};
export default config;
