/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        card: 'var(--bg-card)',
        accent: {
          primary: 'var(--accent-primary)',
          secondary: 'var(--accent-secondary)',
          danger: 'var(--accent-danger)',
          success: 'var(--accent-success)',
          warning: 'var(--accent-warning)',
        },
        text: {
          primary: 'var(--text-primary)',
          muted: 'var(--text-muted)',
        },
        bordercolor: 'var(--border)',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
