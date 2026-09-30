/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        stone: {
          bg: '#F3F1EC',
          surface: '#FAF9F6',
          sunken: '#ECE9E2',
          line: '#D8D4CA',
          ink: '#1A1D1B',
          muted: '#5C635E',
        },
        ops: {
          bg: '#0F1211',
          surface: '#171B19',
          sunken: '#121514',
          line: '#2A302D',
          ink: '#ECEAE4',
          muted: '#8A928D',
        },
        sev: {
          safe: '#2E7D4F',
          advisory: '#A87A00',
          warning: '#D2620A',
          critical: '#C1271D',
          'safe-dark': '#389E65',
          'advisory-dark': '#C79200',
          'warning-dark': '#E87214',
          'critical-dark': '#D9382E',
        },
      },
      fontFamily: {
        sans: ["'IBM Plex Sans'", '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ["'IBM Plex Mono'", 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        md: '8px',
        lg: '8px',
        xl: '8px',
        '2xl': '8px',
        full: '999px',
      },
      boxShadow: {
        subtle: '0 4px 16px rgba(26, 29, 27, 0.08)',
        modal: '0 8px 32px rgba(26, 29, 27, 0.16)',
      },
    },
  },
  plugins: [],
}
