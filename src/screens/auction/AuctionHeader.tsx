import React from 'react';
import { Pressable, View } from 'react-native';
import { topicLabel } from '../../content/topics';
import { useGame } from '../../store/GameContext';
import { colors, playerColor } from '../../theme/tokens';
import { CountingNumber } from '../../ui/CountingNumber';
import { Pulse } from '../../ui/Motion';
import { PlayerMark } from '../../ui/PlayerMark';
import { Row } from '../../ui/Screen';
import { Display, Mono } from '../../ui/Txt';

/** Topic label + menu, budgets row, item counter, 10-segment progress. Segments show position only. */
export function AuctionHeader() {
  const g = useGame();
  const r = g.state.round!;
  const accent = g.topic.accent;
  const verdictShown = r.phase === 'result' && r.resultStage >= 1;
  const budget = (p: 0 | 1) => (verdictShown ? r.budgets[p] : r.prev[p]);
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <Row justify="space-between" style={{ height: 40 }}>
        <Mono color={accent}>{topicLabel(g.topic)}</Mono>
        <Pressable accessibilityRole="button" accessibilityLabel="Menu" onPress={g.toggleMenu} hitSlop={6} style={({ pressed }) => ({ width: 44, height: 44, marginRight: -10, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
          <Display size={20} weight={900} wdth={100} color={colors.ink2} ls={0.1} lh={1.1} upper={false}>···</Display>
        </Pressable>
      </Row>
      <Row align="flex-end" gap={8}>
        <View style={{ flex: 1 }} accessibilityLabel={`${g.names[0]} has $${budget(0)}`}>
          <Row gap={6}><PlayerMark p={0} /><Mono color={playerColor(0)} ls={0.1} numberOfLines={1}>{g.names[0]}</Mono></Row>
          <CountingNumber value={budget(0)} delay={350} size={40} ls={-0.02} lh={1} style={{ marginTop: 2 }} />
        </View>
        <Display size={13} color={colors.ink5} ls={0} lh={1.1} style={{ paddingBottom: 8 }}>VS</Display>
        <View style={{ flex: 1, alignItems: 'flex-end' }} accessibilityLabel={`${g.names[1]} has $${budget(1)}`}>
          <Row gap={6}><Mono color={playerColor(1)} ls={0.1} numberOfLines={1}>{g.names[1]}</Mono><PlayerMark p={1} /></Row>
          <CountingNumber value={budget(1)} delay={350} size={40} ls={-0.02} lh={1} align="right" style={{ marginTop: 2 }} />
        </View>
      </Row>
      <Row justify="space-between" style={{ marginTop: 16 }}>
        <Mono color={colors.ink2}>ITEM {r.idx + 1} / 10</Mono>
        {r.idx === 9 && <Pulse period={1200}><Mono color={accent}>FINAL ITEM</Mono></Pulse>}
      </Row>
      <Row gap={4} style={{ marginTop: 8 }} accessibilityLabel={`Item ${r.idx + 1} of 10`}>
        {Array.from({ length: 10 }, (_, i) => (
          <View key={i} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: i < r.idx ? 'rgba(243,241,236,0.75)' : i === r.idx ? accent : colors.line12 }} />
        ))}
      </Row>
    </View>
  );
}
