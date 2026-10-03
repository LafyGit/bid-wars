import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { Easing, interpolateColor, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { canBid, maxBid, minBid, MAX_ITEMS, atItemCap } from '../../game/round';
import type { Player } from '../../game/types';
import { useGame } from '../../store/GameContext';
import { colors, playerColor, withAlpha } from '../../theme/tokens';
import { CTA, Outline, Stepper } from '../../ui/Btn';
import { Enter, Pulse } from '../../ui/Motion';
import { PlayerMark } from '../../ui/PlayerMark';
import { Row } from '../../ui/Screen';
import { Body, Display, FitText, Mono } from '../../ui/Txt';

/** Big price that pops every time it changes. */
function PricePop({ price, color }: { price: number; color: string }) {
  const { rm } = useGame();
  const sc = useSharedValue(1);
  useEffect(() => {
    if (rm || price === 0) return;
    sc.value = withSequence(withTiming(1.22, { duration: 120, easing: Easing.out(Easing.cubic) }), withTiming(1, { duration: 260, easing: Easing.out(Easing.back(2)) }));
  }, [price, rm, sc]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));
  return (
    <Animated.View style={st}>
      <Display size={112} color={color} ls={-0.05} lh={1} tabular>{`$${price}`}</Display>
    </Animated.View>
  );
}

/** Going once / twice: a bar that drains over the second, plus the label. */
function Going({ stage, color }: { stage: 1 | 2; color: string }) {
  const { rm } = useGame();
  const w = useSharedValue(1);
  useEffect(() => {
    w.value = 1;
    if (!rm) w.value = withTiming(0, { duration: 1000, easing: Easing.linear });
  }, [stage, rm, w]);
  const st = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <Enter key={stage} kind="pop" duration={260} style={{ alignItems: 'center', gap: 8, marginTop: 8 }}>
      <Display size={22} color={color} ls={0.02} lh={1.1}>{stage === 1 ? 'GOING ONCE' : 'GOING TWICE'}</Display>
      <View style={{ width: 160, height: 5, borderRadius: 3, backgroundColor: colors.line12, overflow: 'hidden' }}>
        <Animated.View style={[{ height: '100%', backgroundColor: color }, st]} />
      </View>
    </Enter>
  );
}

function PlayerPanel({ p, active }: { p: Player; active: boolean }) {
  const g = useGame();
  const r = g.state.round!;
  const c = playerColor(p);
  const leader = r.leader === p;
  const passed = r.passed[p];
  const full = atItemCap(r, p);
  const glow = useSharedValue(active ? 1 : 0);
  useEffect(() => { glow.value = withTiming(active ? 1 : 0, { duration: 260 }); }, [active, glow]);
  // Colors are precomputed on the JS thread; only interpolateColor runs inside the worklet.
  const borderOff = withAlpha(c, 0.15), borderOn = withAlpha(c, 1), bgOff = withAlpha(c, 0.04), bgOn = withAlpha(c, 0.12);
  const st = useAnimatedStyle(() => ({
    borderColor: interpolateColor(glow.value, [0, 1], [borderOff, borderOn]),
    backgroundColor: interpolateColor(glow.value, [0, 1], [bgOff, bgOn]),
  }));
  return (
    <Animated.View style={[{ flex: 1, borderRadius: 20, borderWidth: 2, padding: 12, gap: 4, opacity: passed ? 0.5 : 1 }, st]}>
      <Row gap={6} justify={p === 0 ? 'flex-start' : 'flex-end'}>
        {p === 0 && <PlayerMark p={0} />}
        <Mono color={c} ls={0.1} numberOfLines={1} style={{ flexShrink: 1 }}>{g.names[p]}</Mono>
        {p === 1 && <PlayerMark p={1} />}
      </Row>
      <Display size={30} ls={-0.02} lh={1.05} tabular align={p === 0 ? 'left' : 'right'}>${r.budgets[p]}</Display>
      <Mono size={10} color={colors.ink4} align={p === 0 ? 'left' : 'right'}>LEFT · {r.collections[p].length}/{MAX_ITEMS} ITEMS</Mono>
      <View style={{ minHeight: 22, alignItems: p === 0 ? 'flex-start' : 'flex-end', marginTop: 2 }}>
        {leader && !passed && <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: c }}><Mono size={10} color={colors.bg} ls={0.12}>LEADING</Mono></View>}
        {passed && <Mono size={10} color={colors.ink4} ls={0.12}>PASSED</Mono>}
        {!passed && !leader && full && <Mono size={10} color={colors.ink4} ls={0.12}>SHELF FULL</Mono>}
      </View>
    </Animated.View>
  );
}

/**
 * Screens 10–13, reworked: open, back-and-forth bidding on one phone.
 * The player whose move it is sees the raise controls; the other watches. Pass concedes the item.
 */
export function OpenAuction() {
  const g = useGame();
  const r = g.state.round!;
  const p = r.turn;
  const c = playerColor(p);
  const accent = g.topic.accent;
  const item = r.items[r.idx];
  const lo = minBid(r);
  const hi = maxBid(r, p);
  const able = canBid(r, p);
  const [amount, setAmount] = useState(lo);
  // Reset the proposed amount whenever the floor moves or the turn changes.
  useEffect(() => { setAmount(Math.min(Math.max(lo, 1), Math.max(hi, lo))); }, [lo, hi, p]);

  // A player who cannot bid at all is auto-passed after a beat so the game never stalls.
  useEffect(() => {
    if (r.phase !== 'auction' || able) return;
    const t = setTimeout(() => g.pass(p), 900);
    return () => clearTimeout(t);
  }, [r.phase, able, p, r.price, g]);

  const last = r.history.slice(-3).reverse();
  const leaderName = r.leader === -1 ? null : g.names[r.leader];
  const clamp = (v: number) => Math.max(lo, Math.min(hi, v));

  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 14 }}>
      {/* Item band */}
      <Enter kind="in" duration={320} style={{ borderRadius: 18, backgroundColor: accent, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center' }}>
        <Mono size={10} color={colors.bg}>ITEM {r.idx + 1} / 10 · UP FOR AUCTION</Mono>
        <FitText text={item} size={26} minSize={13} maxLines={2} wdth={80} color={colors.bg} ls={0} lh={1.05} align="center" />
      </Enter>

      {/* Current bid */}
      <View style={{ alignItems: 'center', marginTop: 12 }}>
        <Mono ls={0.16} color={colors.ink3}>{leaderName ? `${leaderName} LEADS AT` : 'NO BIDS YET · OPENS AT $1'}</Mono>
        <PricePop price={r.price} color={r.leader === -1 ? colors.ink5 : playerColor(r.leader)} />
        {r.going === 1 || r.going === 2 ? <Going stage={r.going} color={accent} /> : (
          <Row gap={6} style={{ marginTop: 6, minHeight: 26 }}>
            {last.map((b, i) => (
              <Enter key={`${r.history.length}-${i}`} kind="pop" duration={240} delay={i * 40}>
                <View style={{ paddingHorizontal: 9, paddingVertical: 4, borderRadius: 9, borderWidth: 1, borderColor: withAlpha(playerColor(b.p), 0.6), opacity: 1 - i * 0.3 }}>
                  <Mono size={10} color={playerColor(b.p)} ls={0.08} upper={false}>{g.names[b.p]} ${b.amount}</Mono>
                </View>
              </Enter>
            ))}
          </Row>
        )}
      </View>

      {/* Players */}
      <Row gap={10} align="stretch" style={{ marginTop: 12 }}>
        <PlayerPanel p={0} active={p === 0} />
        <PlayerPanel p={1} active={p === 1} />
      </Row>

      {/* Turn + controls */}
      <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 6 }}>
        <Enter key={`turn-${p}-${r.history.length}`} kind={p === 0 ? 'left' : 'right'} duration={320} style={{ alignItems: 'center', marginBottom: 10 }}>
          <Pulse period={1400} min={0.55}>
            <Display size={20} color={c} ls={0} lh={1.1}>{g.names[p]}{able ? "'S MOVE" : ' CAN\'T RAISE'}</Display>
          </Pulse>
        </Enter>
        {able ? (
          <>
            <Row justify="space-between" gap={10}>
              <Stepper glyph="−" size={64} label="Lower your bid by one dollar" disabled={amount <= lo} onPress={() => setAmount(clamp(amount - 1))} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Bid $${amount}`}
                onPress={() => g.bid(p, amount)}
                style={({ pressed }) => ({ flex: 1, height: 64, borderRadius: 20, backgroundColor: c, alignItems: 'center', justifyContent: 'center', transform: [{ scale: pressed ? 0.97 : 1 }] })}
              >
                <Display size={22} color={colors.bg} ls={0} lh={1.1} tabular>BID ${amount}</Display>
              </Pressable>
              <Stepper glyph="+" size={64} label="Raise your bid by one dollar" disabled={amount >= hi} onPress={() => setAmount(clamp(amount + 1))} />
            </Row>
            <Row gap={8} style={{ marginTop: 8 }}>
              {[lo, lo + 1, lo + 3].filter((v, i, a) => v <= hi && a.indexOf(v) === i).map((v) => (
                <Pressable key={v} accessibilityRole="button" onPress={() => g.bid(p, v)} style={({ pressed }) => ({ flex: 1, height: 42, borderRadius: 13, borderWidth: 1, borderColor: withAlpha(c, 0.5), alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}>
                  <Mono size={11} color={c} ls={0.1}>{v === lo ? `MIN $${v}` : `$${v}`}</Mono>
                </Pressable>
              ))}
              <Pressable accessibilityRole="button" onPress={() => g.bid(p, hi)} style={({ pressed }) => ({ flex: 1, height: 42, borderRadius: 13, borderWidth: 1, borderColor: colors.line14, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}>
                <Mono size={11} color={colors.ink2} ls={0.1}>ALL IN ${hi}</Mono>
              </Pressable>
            </Row>
            <Outline label={r.leader === -1 ? 'PASS · NOT INTERESTED' : `PASS · ${leaderName} GETS IT`} height={54} size={13} style={{ marginTop: 8 }} onPress={() => g.pass(p)} />
          </>
        ) : (
          <Body size={14} color={colors.ink4} align="center">
            {atItemCap(r, p) ? `${g.names[p]} already has ${MAX_ITEMS} items.` : r.passed[p] ? `${g.names[p]} passed on this one.` : `${g.names[p]} can't afford $${lo}.`}
          </Body>
        )}
      </View>
    </View>
  );
}
