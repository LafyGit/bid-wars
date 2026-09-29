import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { topicLabel } from '../content/topics';
import { useGame } from '../store/GameContext';
import { colors, playerColor } from '../theme/tokens';
import { CTA } from '../ui/Btn';
import { Burst, Enter, Flash } from '../ui/Motion';
import { Row, Screen } from '../ui/Screen';
import { Body, Display, Mono, nameSize } from '../ui/Txt';

export function Winner() {
  const g = useGame();
  const { width } = useWindowDimensions();
  const w = g.state.roundWinner;
  const color = playerColor(w);
  const name = g.names[w];
  const se = g.state.session;
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
          <Display size={nameSize(name, 96, width - 60)} color={color} ls={-0.04} lh={1.1} align="center" numberOfLines={1} adjustsFontSizeToFit accessibilityLiveRegion="assertive">{name}</Display>
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
        <CTA label="SEE ROUND AWARDS" size={18} onPress={() => g.go('awards')} />
      </Enter>
    </Screen>
  );
}
