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
          base: 'rgb(var(--bg-base) / <alpha-value>)',
          surface: 'rgb(var(--bg-surface) / <alpha-value>)',
          raised: 'rgb(var(--bg-raised) / <alpha-value>)',
          hover: 'rgb(var(--bg-hover) / <alpha-value>)',
          border: 'rgb(var(--border-color) / 0.08)',
          'border-focus': 'rgb(var(--border-focus) / 0.20)',
          text: 'rgb(var(--text-ink) / <alpha-value>)',
          muted: 'rgb(var(--text-muted) / <alpha-value>)',
          dim: 'rgb(var(--text-dim) / <alpha-value>)',
          accent: 'rgb(var(--accent) / <alpha-value>)',
          'accent-dim': 'rgb(var(--accent) / 0.14)',
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
