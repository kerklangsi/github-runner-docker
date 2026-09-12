/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0d1117",
        panelBg: "#161b22",
        borderDark: "#30363d",
        accentBlue: "#58a6ff",
        accentGreen: "#238636",
        accentRed: "#da3633",
        textBright: "#f0f6fc",
        textMuted: "#8b949e",
      }
    },
  },
  plugins: [],
}
