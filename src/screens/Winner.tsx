import React, { useEffect, useRef } from 'react';
import { useWindowDimensions, View } from 'react-native';
import * as StoreReview from 'expo-store-review';
import { topicLabel } from '../content/topics';
import { useGame } from '../store/GameContext';
import { colors, playerColor } from '../theme/tokens';
import { CTA } from '../ui/Btn';
import { Burst, Enter, Flash } from '../ui/Motion';
import { Row, Screen } from '../ui/Screen';
import { Body, Display, Mono, nameSize, FitText } from '../ui/Txt';

export function Winner() {
  const g = useGame();
  const { width } = useWindowDimensions();
  const w = g.state.roundWinner;
  const color = playerColor(w);
  const name = g.names[w];
  const se = g.state.session;
  const review = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Apple's rating sheet after a session's second round, once the win has landed. iOS limits how often it shows.
  useEffect(() => {
    if (g.state.lastRound !== 2) return;
    review.current = setTimeout(() => {
      StoreReview.isAvailableAsync().then((ok) => { if (ok) return StoreReview.requestReview(); }).catch(() => {});
    }, 1000);
    return () => clearTimeout(review.current);
  }, []);
  // The button may open an interstitial with this screen still mounted, so the sheet must not fire behind it.
  const next = () => { clearTimeout(review.current); g.finishRound(); };
  const stats: { label: string; a: string | number; b: string | number }[] = [
    { label: 'ITEMS WON', a: se.items[0], b: se.items[1] },
    { label: 'SPENT', a: `$${se.spent[0]}`, b: `$${se.spent[1]}` },
    { label: 'BIGGEST BID', a: `$${se.biggest[0]}`, b: `$${se.biggest[1]}` },
    { label: 'CHEAPEST STEAL', a: se.cheapest[0] === null ? '—' : `$${se.cheapest[0]}`, b: se.cheapest[1] === null ? '—' : `$${se.cheapest[1]}` },
  ];
  return (
    <Screen style={{ overflow: 'hidden' }}>
      <Flash key={g.state.winnerBurst} color={color} duration={900} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Burst color={color} seed={g.state.winnerBurst} />
        <Enter kind="fade"><Mono size={12} color={colors.ink2} ls={0.18}>ROUND {g.state.lastRound} · {topicLabel(g.topic)}</Mono></Enter>
        <Enter kind="pop" duration={520} style={{ marginTop: 12 }}>
          <FitText text={name} size={nameSize(name, 96, width - 56)} minSize={20} maxLines={2} fitWidth={width - 56} color={color} ls={-0.04} lh={1.1} align="center" accessibilityLiveRegion="assertive" />
        </Enter>
        <Enter kind="in" delay={200} duration={360}><Display size={26} ls={-0.01} lh={1.1} style={{ marginTop: 6 }}>WINS THE ROUND</Display></Enter>
      </View>
      <Enter kind="in" delay={360} duration={400} style={{ borderRadius: 24, backgroundColor: colors.surface, padding: 18 }}>
        <Row justify="space-between">
          <View>
            <Mono color={colors.p1} ls={0.12} numberOfLines={1}>{g.names[0]}</Mono>
            <Display size={64} ls={-0.02} lh={1} tabular>{g.state.score[0]}</Display>
          </View>
          <Mono color={colors.ink5} ls={0.12}>MATCH</Mono>
          <View style={{ alignItems: 'flex-end' }}>
            <Mono color={colors.p2} ls={0.12} numberOfLines={1}>{g.names[1]}</Mono>
            <Display size={64} ls={-0.02} lh={1} tabular>{g.state.score[1]}</Display>
          </View>
        </Row>
        <View style={{ marginTop: 12 }}>
          {stats.map((s) => (
            <Row key={s.label} justify="space-between" style={{ paddingVertical: 9, borderTopWidth: 1, borderTopColor: colors.line07 }}>
              <Body size={15} weight={700} color={colors.ink} tabular style={{ flex: 1 }}>{s.a}</Body>
              <Mono size={10} color={colors.ink4} ls={0.12}>{s.label}</Mono>
              <Body size={15} weight={700} color={colors.ink} tabular align="right" style={{ flex: 1 }}>{s.b}</Body>
            </Row>
          ))}
        </View>
      </Enter>
      <Enter kind="in" delay={460} duration={400} style={{ marginTop: 14 }}>
        <CTA label="SEE ROUND AWARDS" size={18} onPress={next} />
      </Enter>
    </Screen>
  );
}
