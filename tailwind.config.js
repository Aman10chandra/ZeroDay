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
          border: 'rgb(var(--border-color) / <alpha-value>)',
          'border-focus': 'rgb(var(--border-focus) / <alpha-value>)',
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
          'normal-dim': 'rgba(76, 183, 130, 0.14)',
          'advisory-dim': 'rgba(217, 180, 74, 0.14)',
          'warning-dim': 'rgba(232, 132, 58, 0.14)',
          'critical-dim': 'rgba(229, 72, 77, 0.16)',
        },
      },
      fontFamily: {
        sans: ["'Inter'", "'Geist'", '-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", 'Roboto', 'sans-serif'],
        mono: ["'JetBrains Mono'", "'Geist Mono'", "'IBM Plex Mono'", 'monospace'],
      },
      borderRadius: {
        panel: '8px',
        control: '6px',
        sm: '4px',
        full: '999px',
      },
      fontSize: {
        // Spec-aligned Typography Scale
        hero: ['40px', { lineHeight: '46px', fontWeight: '600', letterSpacing: '-0.025em' }],
        kpi: ['28px', { lineHeight: '34px', fontWeight: '600', letterSpacing: '-0.02em' }],
        title: ['20px', { lineHeight: '24px', fontWeight: '600', letterSpacing: '-0.015em' }],
        section: ['15px', { lineHeight: '20px', fontWeight: '600', letterSpacing: '-0.01em' }],
        body: ['14px', { lineHeight: '21px', fontWeight: '400' }],
        secondary: ['13px', { lineHeight: '18px', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '500', letterSpacing: '0.02em' }],
        badge: ['11px', { lineHeight: '14px', fontWeight: '600', letterSpacing: '0.01em' }],
        micro: ['10px', { lineHeight: '13px', fontWeight: '500' }],
      },
      boxShadow: {
        popover: '0 8px 32px rgba(0, 0, 0, 0.35)',
        modal: '0 16px 48px rgba(0, 0, 0, 0.50)',
        card: '0 2px 8px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
