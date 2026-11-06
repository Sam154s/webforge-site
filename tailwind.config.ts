import type { Config } from "tailwindcss";

// Palette: printed-catalogue paper and ink, one accent. Iron oxide = the colour of worked metal at a forge.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F3EFE6",
        sheet: "#FBF9F4",
        ink: "#1C1A17",
        graphite: "#5C574F",
        rule: "#D9D2C3",
        oxide: "#B2471B",
        "oxide-deep": "#8F3612",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: { page: "72rem" },
    },
  },
  plugins: [],
};
export default config;
