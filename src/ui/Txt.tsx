import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { colors, fonts } from '../theme/tokens';

export type Wdth = 125 | 118 | 115 | 112 | 110 | 100 | 90 | 88 | 80 | 75;
export type Weight = 900 | 800 | 700 | 600 | 500;

/** Pick the closest static Archivo instance for a width/weight pair. */
export function archivo(wdth: Wdth, weight: Weight): string {
  if (wdth >= 120) return weight >= 900 ? fonts.expandedBlack : fonts.expandedExtraBold;
  if (wdth >= 105) return weight >= 900 ? fonts.semiExpandedBlack : fonts.semiExpandedExtraBold;
  if (wdth >= 95) {
    switch (weight) {
      case 900: return fonts.black;
      case 800: return fonts.extraBold;
      case 700: return fonts.bold;
      case 600: return fonts.semiBold;
      default: return fonts.medium;
    }
  }
  if (wdth >= 84) return fonts.semiCondensedBlack;
  return fonts.condensedBlack;
}

type Base = TextProps & {
  size?: number;
  color?: string;
  /** letter-spacing in em */
  ls?: number;
  /** line-height as a multiplier of size */
  lh?: number;
  align?: TextStyle['textAlign'];
  upper?: boolean;
  tabular?: boolean;
  style?: TextStyle | TextStyle[];
};

/** Archivo display text. Defaults to the expanded, black, uppercase wordmark style. */
/**
 * iOS clips glyphs that rise above the line box, and Archivo's caps reach ~0.75em above the
 * baseline, which iOS places about 0.2em above the bottom of the line. Anything under this
 * ratio shaves the top off the first line on a real device (fine on the simulator), so the
 * requested tightness is clamped here rather than at every call site.
 */
const MIN_DISPLAY_LH = 0.98;

export function Display({ size = 40, color = colors.ink, ls = -0.03, lh = 0.92, align, upper = true, tabular, wdth = 125, weight = 900, style, ...rest }: Base & { wdth?: Wdth; weight?: Weight }) {
  return (
    <Text
      {...rest}
      allowFontScaling={false}
      style={[
        {
          fontFamily: archivo(wdth, weight),
          fontSize: size,
          lineHeight: Math.round(size * Math.max(lh, MIN_DISPLAY_LH)),
          letterSpacing: size * ls,
          color,
          textAlign: align,
          textTransform: upper ? 'uppercase' : undefined,
          fontVariant: tabular ? ['tabular-nums'] : undefined,
          includeFontPadding: false,
        },
        style,
      ]}
    />
  );
}

/** IBM Plex Mono label. 10–12px, tracked, uppercase. */
export function Mono({ size = 11, color = colors.ink3, ls = 0.14, lh = 1.3, align, upper = true, weight = 600, style, ...rest }: Base & { weight?: 600 | 500 }) {
  return (
    <Text
      {...rest}
      maxFontSizeMultiplier={1.3}
      style={[
        {
          fontFamily: weight === 600 ? fonts.monoSemiBold : fonts.monoMedium,
          fontSize: size,
          lineHeight: Math.round(size * lh),
          letterSpacing: size * ls,
          color,
          textAlign: align,
          textTransform: upper ? 'uppercase' : undefined,
          includeFontPadding: false,
        },
        style,
      ]}
    />
  );
}

/** Archivo body copy, wdth 100, weight 500–800. */
export function Body({ size = 15, color = colors.ink2, ls = 0, lh = 1.4, align, upper = false, weight = 500, tabular, style, ...rest }: Base & { weight?: Weight }) {
  return (
    <Text
      {...rest}
      maxFontSizeMultiplier={1.4}
      style={[
        {
          fontFamily: archivo(100, weight),
          fontSize: size,
          lineHeight: Math.round(size * lh),
          letterSpacing: size * ls,
          color,
          textAlign: align,
          textTransform: upper ? 'uppercase' : undefined,
          fontVariant: tabular ? ['tabular-nums'] : undefined,
          includeFontPadding: false,
        },
        style,
      ]}
    />
  );
}

/**
 * Auto-fit for hero names: min(max, floor(fitWidth / (chars × k))).
 * Archivo Expanded Black caps average 0.93em advance minus 0.04em tracking, so k = 0.9
 * (the handoff's 0.86 runs slightly wide on device). Pair with adjustsFontSizeToFit as a guard.
 */
/** Archivo Expanded Black caps average ~1.0em advance; 0.9 let long names spill past the edge on device. */
export const nameSize = (name: string, max: number, fitWidth = 330) => Math.max(20, Math.min(max, Math.floor(fitWidth / (Math.max(name.length, 1) * 1.0))));

/**
 * Auto-fit for condensed item names: min(92, floor(fitWidth / (longestWord × k))).
 * Archivo Condensed Black caps average 0.59em advance, so k = 0.6 (the handoff's 0.5 breaks words on device).
 */
export const itemSize = (item: string, fitWidth = 290) => {
  const maxWord = Math.max(...item.split(/[\s-]/).map((w) => w.length), 1);
  return Math.max(28, Math.min(92, Math.floor(fitWidth / (maxWord * 0.6))));
};
