/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#FF4F21",

        adx: {
          bg: "var(--adx-bg)",
          surface: "var(--adx-surface)",
          "surface-elevated": "var(--adx-surface-elevated)",
          "surface-muted": "var(--adx-surface-muted)",
          border: "var(--adx-border)",
          "border-strong": "var(--adx-border-strong)",
          "text-primary": "var(--adx-text-primary)",
          "text-secondary": "var(--adx-text-secondary)",
          "text-muted": "var(--adx-text-muted)",
          "text-disabled": "var(--adx-text-disabled)",
          accent: "var(--adx-accent)",
          "accent-hover": "var(--adx-accent-hover)",
          "accent-soft": "var(--adx-accent-soft)",
          success: "var(--adx-success)",
          warning: "var(--adx-warning)",
          danger: "var(--adx-danger)",
          info: "var(--adx-info)",
        },
      },
      fontFamily: {
        sans: ["'Mazzard'", "sans-serif"],
        poppins: ["'Mazzard'", "sans-serif"],
        agale: ["'Agale DEMO'", "'Mazzard'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
