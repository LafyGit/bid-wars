import React from 'react';
import { Text, View, type TextProps, type TextStyle } from 'react-native';
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
      selectable={false}
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
          userSelect: 'none',
          // iOS applies negative letter-spacing after the last glyph as well, which pushes the final
          // letter past the text box (and iOS clips text to its box). Give that overhang room.
          paddingRight: ls < 0 ? Math.ceil(-ls * size) + 1 : undefined,
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
      selectable={false}
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
          userSelect: 'none',
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
      selectable={false}
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
          userSelect: 'none',
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
/** Approximate advance of an Archivo Expanded Black capital, in em. Wide letters cost more, narrow ones less. */
const capEm = (ch: string) => ('WM'.includes(ch) ? 1.3 : 'I1J'.includes(ch) ? 0.55 : ' '.includes(ch) ? 0.45 : 'QOGDHUNBCRSPAKXYZ'.includes(ch) ? 1.08 : 0.98);

/**
 * Font size that fits `name` on one line in `fitWidth` points. Player names are sized from this alone:
 * the platform's adjustsFontSizeToFit is unreliable on iOS 27 (it shrank one name to a speck), so text
 * that must fit uses a deterministic size instead and never relies on auto-shrinking.
 */
export const nameSize = (name: string, max: number, fitWidth = 330) => {
  const text = (name || ' ').toUpperCase();
  const em = Array.from(text).reduce((sum, ch) => sum + capEm(ch), 0) * 0.96; // tracking is negative
  return Math.max(18, Math.min(max, Math.floor(fitWidth / Math.max(em, 1))));
};

/**
 * Auto-fit for condensed item names: min(92, floor(fitWidth / (longestWord × k))).
 * Archivo Condensed Black caps average 0.59em advance, so k = 0.6 (the handoff's 0.5 breaks words on device).
 */
export const itemSize = (item: string, fitWidth = 290) => {
  const maxWord = Math.max(...item.split(/[\s-]/).map((w) => w.length), 1);
  return Math.max(28, Math.min(92, Math.floor(fitWidth / (maxWord * 0.6))));
};

type FitProps = Omit<TextProps, 'children' | 'numberOfLines'> & Omit<Base, 'size'> & { kind?: 'display' | 'body' | 'mono'; text: string; size: number; minSize?: number; maxLines?: number; maxHeight?: number; wdth?: Wdth; weight?: any };

/** Break points a wrapping Text may use: whitespace, and just after a hyphen. */
const pieces = (text: string) => text.split(/\s+/).filter(Boolean).flatMap((w) => w.match(/[^-]+-?|-/g) ?? [w]);

/**
 * Text that always shows in full and never breaks inside a word. It measures the widest unbreakable
 * piece (or the whole string when maxLines is 1) with an invisible copy, scales the font so that piece
 * fits the available width, then checks the real height and steps down again if it needs too many
 * lines. It does not rely on adjustsFontSizeToFit (unreliable on iOS 27) or on text-layout events, and
 * it only ellipsizes if it has already reached `minSize`.
 */
function FitInner({ kind = 'display', text, size, minSize = 11, maxLines = 1, maxHeight, ...rest }: FitProps) {
  const Comp: any = kind === 'display' ? Display : kind === 'mono' ? Mono : Body;
  const parts = React.useMemo(() => (maxLines === 1 ? [text] : pieces(text)), [text, maxLines]);
  const [w, setW] = React.useState(0);
  const widths = React.useRef<number[]>([]);
  const [measured, setMeasured] = React.useState(0);
  const [s, setS] = React.useState(size);
  const [ok, setOk] = React.useState(false);
  const base = React.useRef(size);
  const lhMul = rest.lh ?? (kind === 'display' ? 1 : kind === 'mono' ? 1.3 : 1.4);

  // Step 1: width fit, from the widest piece measured at the base size.
  React.useEffect(() => {
    if (!w || measured < parts.length) return;
    const widest = Math.max(...widths.current.slice(0, parts.length), 1);
    const fit = Math.floor(base.current * (w / widest) * 0.98);
    setS(Math.max(minSize, Math.min(size, fit)));
  }, [w, measured, parts.length, size, minSize]);

  React.useEffect(() => {
    const t = setTimeout(() => setOk(true), 500); // never leave text hidden
    return () => clearTimeout(t);
  }, []);

  const lineH = Math.max(1, Math.round(s * (kind === 'display' ? Math.max(lhMul, MIN_DISPLAY_LH) : lhMul)));
  // Step 2: height fit, from the visible text's real height.
  const onTextBox = (h: number) => {
    if (!w || measured < parts.length) return;
    const tooTall = h > lineH * maxLines + 2 || (maxHeight != null && h > maxHeight);
    if (tooTall && s > minSize) setS(Math.max(minSize, Math.floor(s * 0.92)));
    else setOk(true);
  };

  return (
    <View onLayout={(e) => setW(Math.floor(e.nativeEvent.layout.width))} style={{ alignSelf: 'stretch' }}>
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', left: 0, top: 0, width: 4000, flexDirection: 'row', opacity: 0 }}>
        {parts.map((part, i) => (
          <Comp key={i} {...rest} size={base.current} style={undefined} onLayout={(e: any) => { widths.current[i] = e.nativeEvent.layout.width; setMeasured((m) => Math.max(m, widths.current.filter((x) => x != null).length)); }}>{part}</Comp>
        ))}
      </View>
      <Comp {...rest} size={s} numberOfLines={s <= minSize ? maxLines : undefined} onLayout={(e: any) => onTextBox(e.nativeEvent.layout.height)} style={[rest.style as any, { opacity: ok ? 1 : 0 }]}>{text}</Comp>
    </View>
  );
}

export function FitText(props: FitProps) {
  return <FitInner key={`${props.text}|${props.size}|${props.maxLines ?? 1}|${props.maxHeight ?? ''}`} {...props} />;
}
