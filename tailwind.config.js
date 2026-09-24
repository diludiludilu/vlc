/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        vlc: {
          orange: '#FF8800',
          darkOrange: '#E65100',
          amber: '#FFA000',
          dark: '#121316',
          panel: '#1A1C22',
          border: '#272A34'
        }
      }
    },
  },
  plugins: [],
}
