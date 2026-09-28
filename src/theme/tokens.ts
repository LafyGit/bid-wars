// Design tokens from the Bid Wars handoff. Values are final; do not tune by eye.

export const colors = {
  bg: '#0E0F12',
  bgDeep: '#060607',
  surface: '#16171B',
  surfaceAlt: '#17181C',
  surface2: '#1E1F24',
  surfacePress: '#2A2B31',
  surfaceHover: '#1A1B20',
  ink: '#F3F1EC',
  ink2: '#C9C8C3',
  ink3: '#A9A9B1',
  ink4: '#8C8D95',
  ink5: '#6B6C74',
  ink6: '#3A3B40',
  line07: 'rgba(243,241,236,0.07)',
  line10: 'rgba(243,241,236,0.10)',
  line12: 'rgba(243,241,236,0.12)',
  line14: 'rgba(243,241,236,0.14)',
  line16: 'rgba(243,241,236,0.16)',
  line20: 'rgba(243,241,236,0.20)',
  line25: 'rgba(243,241,236,0.25)',
  p1: '#8FA0F5',
  p2: '#EFC45A',
  danger: '#F0605A',
  scrim60: 'rgba(0,0,0,0.6)',
  scrim65: 'rgba(0,0,0,0.65)',
} as const;

/** Player identity color by index. Always pair with name, tag, marker and position. */
export const playerColor = (p: 0 | 1 | number) => (p === 1 ? colors.p2 : colors.p1);

export const radii = {
  card: 22,
  cardLg: 30,
  cta: 20,
  secondary: 18,
  chip: 14,
  pill: 22,
  sheet: 30,
} as const;

export const layout = {
  padX: 24,
  padBottom: 38,
  topExtra: 8,
} as const;

/**
 * Font family names as registered with expo-font.
 * Archivo static instances are cut from the variable font (see assets/fonts):
 *   Expanded = wdth 125, SemiExpanded = wdth 115, (default) = wdth 100,
 *   SemiCondensed = wdth 88, Condensed = wdth 75.
 */
export const fonts = {
  expandedBlack: 'Archivo-Expanded-Black',
  expandedExtraBold: 'Archivo-Expanded-ExtraBold',
  semiExpandedBlack: 'Archivo-SemiExpanded-Black',
  semiExpandedExtraBold: 'Archivo-SemiExpanded-ExtraBold',
  black: 'Archivo-Black',
  extraBold: 'Archivo-ExtraBold',
  bold: 'Archivo-Bold',
  semiBold: 'Archivo-SemiBold',
  medium: 'Archivo-Medium',
  semiCondensedBlack: 'Archivo-SemiCondensed-Black',
  condensedBlack: 'Archivo-Condensed-Black',
  monoMedium: 'IBMPlexMono-Medium',
  monoSemiBold: 'IBMPlexMono-SemiBold',
} as const;

export const fontAssets = {
  [fonts.expandedBlack]: require('../../assets/fonts/Archivo-Expanded-Black.ttf'),
  [fonts.expandedExtraBold]: require('../../assets/fonts/Archivo-Expanded-ExtraBold.ttf'),
  [fonts.semiExpandedBlack]: require('../../assets/fonts/Archivo-SemiExpanded-Black.ttf'),
  [fonts.semiExpandedExtraBold]: require('../../assets/fonts/Archivo-SemiExpanded-ExtraBold.ttf'),
  [fonts.black]: require('../../assets/fonts/Archivo-Black.ttf'),
  [fonts.extraBold]: require('../../assets/fonts/Archivo-ExtraBold.ttf'),
  [fonts.bold]: require('../../assets/fonts/Archivo-Bold.ttf'),
  [fonts.semiBold]: require('../../assets/fonts/Archivo-SemiBold.ttf'),
  [fonts.medium]: require('../../assets/fonts/Archivo-Medium.ttf'),
  [fonts.semiCondensedBlack]: require('../../assets/fonts/Archivo-SemiCondensed-Black.ttf'),
  [fonts.condensedBlack]: require('../../assets/fonts/Archivo-Condensed-Black.ttf'),
  [fonts.monoMedium]: require('../../assets/fonts/IBMPlexMono-Medium.ttf'),
  [fonts.monoSemiBold]: require('../../assets/fonts/IBMPlexMono-SemiBold.ttf'),
};

/** Mix an accent into the app background at `pct` (0–1). Approximates color-mix in sRGB. */
export function tint(accentHex: string, pct: number, base = colors.bg): string {
  const a = hexToRgb(accentHex), b = hexToRgb(base);
  const m = (i: number) => Math.round(b[i] + (a[i] - b[i]) * pct);
  return `rgb(${m(0)},${m(1)},${m(2)})`;
}

export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
