import React, { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '../../store/GameContext';
import { colors, playerColor, withAlpha } from '../../theme/tokens';
import { CTA, Stepper } from '../../ui/Btn';
import { Enter } from '../../ui/Motion';
import { Row } from '../../ui/Screen';
import { Display, Mono } from '../../ui/Txt';
import type { Player } from '../../game/types';

function Half({ p, flipped }: { p: Player; flipped: boolean }) {
  const g = useGame();
  const r = g.state.round!;
  const c = playerColor(p);
  const locked = r.locked[p];
  const [flash, setFlash] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bump = (d: number) => {
    g.adjust(p, d);
    setFlash(true);
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setFlash(false), 900);
  };
  useEffect(() => () => { if (t.current) clearTimeout(t.current); }, []);
  const show = r.peek[p] || flash;
  const text = locked ? 'LOCKED' : show ? `$${r.bids[p]}` : '$ ••';
  const insets = useSafeAreaInsets();
  // The flipped half is rotated 180°, so its "bottom" padding is at the physical top of the screen.
  const edge = flipped ? insets.top + 12 : Math.max(insets.bottom, 20) + 4;
  return (
    <View style={{ flex: 1, gap: 12, paddingHorizontal: 22, paddingTop: 70, paddingBottom: edge, backgroundColor: withAlpha(c, 0.07), transform: [{ rotate: flipped ? '180deg' : '0deg' }] }}>
      <Row justify="space-between">
        <Display size={22} color={c} ls={-0.02} lh={1.1} numberOfLines={1} style={{ flexShrink: 1 }}>{g.names[p]}</Display>
        <Mono ls={0.12}>${r.budgets[p]} LEFT</Mono>
      </Row>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Display size={84} color={locked ? c : colors.ink} ls={-0.02} lh={1} tabular accessibilityLabel={locked ? 'Bid locked' : show ? `Bid $${r.bids[p]}` : 'Bid hidden'}>{text}</Display>
      </View>
      {!locked && (
        <>
          <Row gap={10}>
            <Stepper glyph="−" size={64} label="Minus one dollar" disabled={r.bids[p] <= r.tieMin[p]} onPress={() => bump(-1)} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Hold to peek at your bid"
              onPressIn={() => g.peek(p, true)}
              onPressOut={() => g.peek(p, false)}
              style={({ pressed }) => ({ flex: 1, height: 64, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.line25, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}
            >
              <Mono color={colors.ink2} ls={0.12}>HOLD TO PEEK</Mono>
            </Pressable>
            <Stepper glyph="+" size={64} label="Plus one dollar" disabled={r.bids[p] >= r.budgets[p]} onPress={() => bump(1)} />
          </Row>
          <CTA label="LOCK BID" bg={c} height={60} size={18} style={{ borderRadius: 18 }} onPress={() => g.lock(p)} />
        </>
      )}
    </View>
  );
}

/** Screen 28: phone flat on the table. P2's half is rotated 180°, P1's half is at the bottom. */
export function TableMode() {
  const g = useGame();
  const r = g.state.round!;
  return (
    <Enter kind="fade" duration={200} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 30, backgroundColor: colors.bg }}>
      <Half p={1} flipped />
      <View style={{ height: 0, zIndex: 2 }}>
        <View style={{ position: 'absolute', left: 16, right: 16, top: -40, height: 80, borderRadius: 22, backgroundColor: g.topic.accent, alignItems: 'center', justifyContent: 'center' }}>
          <Mono size={10} color={colors.bg}>ITEM {r.idx + 1} / 10{r.tieRound > 0 ? ` · MIN $${r.tieMin[0]}` : ''}</Mono>
          <Display size={28} wdth={80} color={colors.bg} ls={0} lh={1} numberOfLines={1} adjustsFontSizeToFit>{r.items[r.idx]}</Display>
        </View>
      </View>
      <Half p={0} flipped={false} />
    </Enter>
  );
}
