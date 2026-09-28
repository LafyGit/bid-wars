import React, { useEffect, useState } from 'react';
import { AppState, View } from 'react-native';
import { useGame } from '../../store/GameContext';
import { colors, playerColor } from '../../theme/tokens';
import { CTA, Chip, Stepper } from '../../ui/Btn';
import { Enter } from '../../ui/Motion';
import { Row, Screen } from '../../ui/Screen';
import { Body, Display, Mono } from '../../ui/Txt';

/** Screens 10 / 12 / 16: full-screen private bid for the current bidder. Blanks itself when the app is backgrounded. */
export function PrivateBid() {
  const g = useGame();
  const r = g.state.round!;
  const p = r.bidder;
  const c = playerColor(p);
  const accent = g.topic.accent;
  const item = r.items[r.idx];
  const amount = r.bids[p];
  const leaves = r.budgets[p] - amount;
  const after = 9 - r.idx;
  const min = r.tieMin[p];
  const locked = r.locked[p];
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const sub = AppState.addEventListener('change', (st) => setActive(st === 'active'));
    return () => sub.remove();
  }, []);

  return (
    <Enter kind="fade" duration={200} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 30 }}>
      <Screen>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, backgroundColor: c }} />
        <Row justify="space-between">
          <View style={{ height: 30, paddingHorizontal: 12, borderRadius: 15, backgroundColor: c, justifyContent: 'center' }}>
            <Mono color={colors.bg} ls={0.12}>P{p + 1} · PRIVATE</Mono>
          </View>
          <Mono ls={0.12}>ITEM {r.idx + 1} / 10</Mono>
        </Row>
        <Enter kind="left" duration={320} style={{ marginTop: 18 }}>
          <Display size={38} color={c} ls={-0.03} lh={0.95} numberOfLines={1} adjustsFontSizeToFit>{g.names[p]}’S BID</Display>
        </Enter>
        <Body size={17} style={{ marginTop: 6 }}>for <Body size={17} weight={800} color={colors.ink}>{item}</Body></Body>
        {r.tieRound > 0 && (
          <Enter kind="pop" duration={300} style={{ marginTop: 12, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: accent }}>
            <Mono color={accent} ls={0.12}>TIE-BREAK · MATCH OR BEAT ${min}</Mono>
          </Enter>
        )}

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {!locked && (
            <>
              <Row align="flex-start" accessibilityLiveRegion="polite" accessibilityLabel={`Bid $${amount}`}>
                <Display size={48} color={colors.ink4} ls={0} lh={1.2} upper={false}>$</Display>
                <Display size={150} ls={-0.05} lh={1} tabular>{amount}</Display>
              </Row>
              <Body size={15} color={colors.ink3} align="center" style={{ marginTop: 8 }}>
                Leaves you <Body size={15} weight={800} color={colors.ink}>${leaves}</Body> · {after === 0 ? 'last item' : `${after} more to come`}
              </Body>
            </>
          )}
          {locked && (
            <>
              <Enter kind="stamp">
                <View style={{ paddingHorizontal: 30, paddingVertical: 18, borderRadius: 18, borderWidth: 5, borderColor: c, transform: [{ rotate: '-8deg' }] }}>
                  <Display size={54} color={c} ls={0.02} lh={1.1} accessibilityLiveRegion="assertive" accessibilityLabel="Bid locked">LOCKED</Display>
                </View>
              </Enter>
              <Mono size={12} color={colors.ink4} style={{ marginTop: 22 }}>BID HIDDEN</Mono>
            </>
          )}
        </View>

        {!locked && (
          <>
            <Row justify="space-between" gap={12}>
              <Stepper glyph="−" label="Minus one dollar" disabled={amount <= min} onPress={() => g.adjust(p, -1)} />
              <Row gap={6} style={{ flex: 1 }}>
                <Chip label={min ? `MIN $${min}` : '$0'} height={48} radius={14} style={{ flex: 1, paddingHorizontal: 8 }} onPress={() => g.setBid(p, min)} />
                <Chip label="ALL IN" height={48} radius={14} style={{ flex: 1, paddingHorizontal: 8 }} onPress={() => g.setBid(p, r.budgets[p])} />
              </Row>
              <Stepper glyph="+" label="Plus one dollar" disabled={amount >= r.budgets[p]} onPress={() => g.adjust(p, 1)} />
            </Row>
            <CTA label={`LOCK BID · $${amount}`} bg={c} height={68} size={20} style={{ marginTop: 18 }} onPress={() => g.lock(p)} />
          </>
        )}
      </Screen>
      {!active && <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.bg }} />}
    </Enter>
  );
}
