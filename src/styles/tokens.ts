/**
 * ZeroDay Emergency Operations Dashboard - Design Tokens System
 * Spec-compliant design token definitions for SCADA / Telemetry Console
 */

export const typography = {
  fonts: {
    ui: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    data: "'JetBrains Mono', 'Geist Mono', monospace",
  },
  scale: {
    hero: { size: '40px', weight: 600, lineHeight: 1.15, letterSpacing: '-0.025em' },
    kpi: { size: '28px', weight: 600, lineHeight: 1.2, letterSpacing: '-0.02em' },
    pageTitle: { size: '20px', weight: 600, lineHeight: 1.2, letterSpacing: '-0.015em' },
    sectionTitle: { size: '15px', weight: 600, lineHeight: 1.3, letterSpacing: '-0.01em' },
    body: { size: '14px', weight: 400, lineHeight: 1.45, letterSpacing: '-0.005em' },
    secondary: { size: '13px', weight: 400, lineHeight: 1.4, letterSpacing: '0em' },
    caption: { size: '12px', weight: 500, lineHeight: 1.35, letterSpacing: '0.02em' },
    badge: { size: '11px', weight: 600, lineHeight: 1.25, letterSpacing: '0.01em' },
    micro: { size: '10px', weight: 500, lineHeight: 1.3, letterSpacing: '0.02em' },
  },
} as const;

export const spacing = {
  grid: 4, // 4px baseline grid
  cardPadding: 16,
  cardGap: 12,
  sectionGap: 24,
  touchTargetMin: 32,
} as const;

export const radii = {
  control: '6px',
  panel: '8px',
  modal: '10px',
  pill: '9999px',
} as const;

export const severityColors = {
  critical: {
    solid: '#E5484D',
    dim: 'rgba(229, 72, 77, 0.16)',
    border: 'rgba(229, 72, 77, 0.35)',
    label: 'Critical',
  },
  warning: {
    solid: '#E8843A',
    dim: 'rgba(232, 132, 58, 0.14)',
    border: 'rgba(232, 132, 58, 0.35)',
    label: 'Warning',
  },
  advisory: {
    solid: '#D9B44A',
    dim: 'rgba(217, 180, 74, 0.14)',
    border: 'rgba(217, 180, 74, 0.35)',
    label: 'Advisory',
  },
  safe: {
    solid: '#4CB782',
    dim: 'rgba(76, 183, 130, 0.14)',
    border: 'rgba(76, 183, 130, 0.35)',
    label: 'Normal',
  },
} as const;
