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
        zd: {
          // Dark palette ("Dawn over the valley")
          base: '#0A0F13',
          surface: '#10161B',
          raised: '#161E25',
          hover: '#1D2730',
          border: 'rgba(255, 255, 255, 0.07)',
          'border-focus': 'rgba(255, 255, 255, 0.18)',
          text: '#EAF0F3',
          muted: '#93A1AC',
          dim: '#5E6C77',

          // Light palette (warm paper)
          'light-base': '#F6F5F1',
          'light-surface': '#ECE9E2',
          'light-raised': '#E2DED6',
          'light-hover': '#DAD5CB',
          'light-border': 'rgba(0, 0, 0, 0.08)',
          'light-text': '#12181D',
          'light-muted': '#58656E',
          'light-dim': '#8B97A0',

          // Single accent: Glacier Teal
          accent: '#5CC8BE',
          'accent-dim': 'rgba(92, 200, 190, 0.12)',
        },
        sev: {
          normal: '#4CB782',
          advisory: '#D9B44A',
          warning: '#E8843A',
          critical: '#E5484D',
          'normal-dim': 'rgba(76, 183, 130, 0.12)',
          'advisory-dim': 'rgba(217, 180, 74, 0.12)',
          'warning-dim': 'rgba(232, 132, 58, 0.12)',
          'critical-dim': 'rgba(229, 72, 77, 0.14)',
        },
      },
      fontFamily: {
        sans: ["'Geist Sans'", "'IBM Plex Sans'", "'Inter'", '-apple-system', 'sans-serif'],
        mono: ["'Geist Mono'", "'JetBrains Mono'", "'IBM Plex Mono'", 'monospace'],
      },
      borderRadius: {
        panel: '8px',
        control: '6px',
        sm: '4px',
        full: '999px',
      },
      fontSize: {
        hero: ['48px', { lineHeight: '52px', fontWeight: '300', letterSpacing: '-0.03em' }],
        'hero-lg': ['56px', { lineHeight: '60px', fontWeight: '300', letterSpacing: '-0.03em' }],
        micro: ['11px', { lineHeight: '15px' }],
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['13px', { lineHeight: '18px' }],
        base: ['14px', { lineHeight: '20px' }],
        md: ['16px', { lineHeight: '22px' }],
        lg: ['20px', { lineHeight: '26px' }],
      },
      boxShadow: {
        popover: '0 8px 32px rgba(0, 0, 0, 0.45)',
        modal: '0 16px 48px rgba(0, 0, 0, 0.60)',
      },
    },
  },
  plugins: [],
}
