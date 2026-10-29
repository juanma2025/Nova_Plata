/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        headline: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Geist', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        body: ['Geist', 'sans-serif'],
        label: ['Geist', 'sans-serif'],
      },
      colors: {
        // Design System: Primary (#B83A43)
        primary: {
          DEFAULT: '#B83A43',
          dark: '#7D1C24',
          deep: '#3D0A10',
          light: '#D95863',
          soft: '#FFB8BE',
          tint: '#FFE8EA',
        },
        // Design System: Secondary (#171717)
        secondary: {
          DEFAULT: '#171717',
          elevated: '#1F2024',
          subtle: '#26282E',
        },
        // Design System: Tertiary (#FF334F)
        tertiary: {
          DEFAULT: '#FF334F',
          dark: '#C81E35',
          light: '#FF6B81',
          glow: 'rgba(255, 51, 79, 0.35)',
        },
        // Design System: Neutral (#0D0E11)
        neutral: {
          DEFAULT: '#0D0E11',
          void: '#0D0E11',
          surface: '#171717',
          card: '#1B1C20',
          border: '#282A2E',
          muted: '#8E929B',
        },
        bg: "var(--bg)",
        panel: "var(--panel)",
        panel2: "var(--panel2)",
        border: "var(--border)",
        text: "var(--text)",
        muted: "var(--muted)",
        brand: "var(--primary)",
        accent: "var(--tertiary)",
        green: "var(--green)",
        green2: "var(--green2)",
        red: "var(--red)",
        yellow: "var(--yellow)",
      }
    },
  },
  plugins: [],
}
