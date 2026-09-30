/**
 * ZeroDay Civic Engine — Design Tokens
 * Topographic Survey / Air-Traffic Console aesthetic.
 * Neutrals do 90% of the work. Color = meaning.
 */

export const TOKENS = {
  colors: {
    light: {
      bg: '#F3F1EC',           // warm stone
      surface: '#FAF9F6',      // primary cards & panels
      surfaceSunken: '#ECE9E2',// inset bars, table headers
      ink: '#1A1D1B',          // primary text & ink buttons
      inkMuted: '#5C635E',     // secondary / unit text
      line: '#D8D4CA',         // 1px structural borders
      accent: '#1A1D1B',
      btnHover: '#2E3330',
    },
    dark: {
      bg: '#0F1211',
      surface: '#171B19',
      surfaceSunken: '#121514',
      ink: '#ECEAE4',
      inkMuted: '#8A928D',
      line: '#2A302D',
      accent: '#ECEAE4',
      btnHover: '#D4D0C7',
    },
    // Consistent 4-step severity scale (used across badges, maps, charts, and rows)
    severity: {
      safe: {
        light: '#2E7D4F',
        dark: '#389E65',
        tintLight: 'rgba(46, 125, 79, 0.10)',
        tintDark: 'rgba(56, 158, 101, 0.15)',
        label: 'Safe',
      },
      advisory: {
        light: '#A87A00',
        dark: '#C79200',
        tintLight: 'rgba(168, 122, 0, 0.10)',
        tintDark: 'rgba(199, 146, 0, 0.15)',
        label: 'Advisory',
      },
      warning: {
        light: '#D2620A',
        dark: '#E87214',
        tintLight: 'rgba(210, 98, 10, 0.10)',
        tintDark: 'rgba(232, 114, 20, 0.15)',
        label: 'Warning',
      },
      critical: {
        light: '#C1271D',
        dark: '#D9382E',
        tintLight: 'rgba(193, 39, 29, 0.10)',
        tintDark: 'rgba(217, 56, 46, 0.15)',
        label: 'Critical',
      },
    },
  },
  typography: {
    fontSans: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    fontMono: "'IBM Plex Mono', monospace",
  },
  radius: {
    container: '8px',
    pill: '999px',
  },
  transition: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
};

/**
 * Returns severity configuration object based on level and current ops/dark mode.
 * @param {'safe' | 'advisory' | 'warning' | 'critical'} level
 * @param {boolean} isDark
 */
export function getSeverityToken(level = 'safe', isDark = false) {
  const normLevel = level.toLowerCase();
  const sev = TOKENS.colors.severity[normLevel] || TOKENS.colors.severity.safe;
  return {
    color: isDark ? sev.dark : sev.light,
    tint: isDark ? sev.tintDark : sev.tintLight,
    label: sev.label,
  };
}
