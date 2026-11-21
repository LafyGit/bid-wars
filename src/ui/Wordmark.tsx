import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';
import { Display } from './Txt';

/**
 * Archivo Expanded Black metrics (fontTools, em): ink widths at -0.045em tracking, and the left
 * side bearings of O and B. Both lines share one size; OUT, the wider word, sets the block width.
 */
const LS = -0.045;
const OUT_INK = 2.806 + 2 * LS;
const O_LSB = 0.045;
const B_LSB = 0.074;

/** Sizes for the lockup at a given OUT size, so the splash can animate the same lines. */
export function wordmark(size: number) {
  return {
    width: Math.round(size * OUT_INK),
    // Each line's box is wider than its ink (advance, trailing tracking pad), so give it room past the block edge.
    out: { size, ls: LS, lh: 0.84, style: { marginLeft: -Math.round(size * O_LSB), width: Math.ceil(size * 3.2) } },
    // Pull BID up into OUT's empty descender space; each line keeps its own unclipped box.
    bid: { size, ls: LS, lh: 0.84, style: { marginLeft: -Math.round(size * B_LSB), marginTop: -Math.round(size * 0.2), width: Math.ceil(size * 2.6) } },
    bar: { height: Math.max(5, Math.round(size * 0.08)), marginTop: Math.round(size * 0.12) },
  };
}

/** OUT over BID at the same size, optionally with the two-player bar under it. `size` is the OUT line. */
export function Wordmark({ size, bar = false, style }: { size: number; bar?: boolean; style?: StyleProp<ViewStyle> }) {
  const w = wordmark(size);
  return (
    <View accessible accessibilityRole="header" accessibilityLabel="Outbid" style={[{ width: w.width }, style]}>
      <Display {...w.out}>OUT</Display>
      <Display {...w.bid}>BID</Display>
      {bar && (
        <View style={{ flexDirection: 'row', ...w.bar, gap: 6 }}>
          <View style={{ flex: 1, backgroundColor: colors.p1, borderRadius: 2 }} />
          <View style={{ flex: 1, backgroundColor: colors.p2, borderRadius: 2 }} />
        </View>
      )}
    </View>
  );
}
