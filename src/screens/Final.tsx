import React from 'react';
import { ScrollView, View } from 'react-native';
import { topicLabel } from '../content/topics';
import { useGame } from '../store/GameContext';
import { colors, layout, playerColor } from '../theme/tokens';
import { CTA } from '../ui/Btn';
import { Enter } from '../ui/Motion';
import { Row, Screen, useScreenInsets } from '../ui/Screen';
import { Body, Display, Mono } from '../ui/Txt';
import type { Player } from '../game/types';

function CollectionCard({ p }: { p: Player }) {
  const g = useGame();
  const r = g.state.round!;
  const coll = r.collections[p];
  return (
    <Enter kind={p === 0 ? 'left' : 'right'} delay={100} duration={400} style={{ flex: 1, borderRadius: 22, backgroundColor: colors.surface, paddingVertical: 16, paddingHorizontal: 14 }}>
      <Display size={20} wdth={118} color={playerColor(p)} ls={-0.01} lh={1.1} numberOfLines={1}>{g.names[p]}</Display>
      <View style={{ marginTop: 10 }}>
        {coll.map((c, i) => (
          <Row key={`${c.name}-${i}`} justify="space-between" gap={6} style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line07 }}>
            <Body size={14} weight={600} color={colors.ink} style={{ flex: 1 }} numberOfLines={2}>{c.name}</Body>
            <Body size={14} weight={600} color={colors.ink3} tabular>${c.price}</Body>
          </Row>
        ))}
        {coll.length === 0 && <Body size={14} color={colors.ink5} style={{ paddingVertical: 8 }}>Won nothing. Bold.</Body>}
      </View>
      <Mono size={10} ls={0.12} style={{ marginTop: 14 }}>REMAINING</Mono>
      <Display size={30} ls={-0.02} lh={1.1} tabular>${r.budgets[p]}</Display>
    </Enter>
  );
}

export function Final() {
  const g = useGame();
  const r = g.state.round;
  const p = useScreenInsets();
  if (!r) return null;
  const unclaimed = r.log.filter((l) => l.w === -1).map((l) => l.item);
  return (
    <Screen padX={false} padBottom={false}>
      <Enter kind="in" duration={360} style={{ paddingHorizontal: layout.padX }}>
        <Mono color={g.topic.accent}>{topicLabel(g.topic)} · 10 / 10</Mono>
        <Display size={40} lh={0.9} style={{ marginTop: 8 }}>{'AUCTION\nCOMPLETE'}</Display>
      </Enter>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
        <Row gap={10} align="stretch">
          <CollectionCard p={0} />
          <CollectionCard p={1} />
        </Row>
        {unclaimed.length > 0 && (
          <View style={{ marginTop: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.ink6 }}>
            <Body size={13} color={colors.ink3}>Unclaimed: {unclaimed.join(', ')}</Body>
          </View>
        )}
      </ScrollView>
      <Enter kind="in" delay={300} duration={400} style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: p.bottom, backgroundColor: colors.bg }}>
        <Display size={24} ls={-0.02} lh={1.1} align="center">WHO WON?</Display>
        <Body size={13} color={colors.ink3} align="center" style={{ marginTop: 4 }}>Argue it out. Then tap the winner.</Body>
        <Row gap={10} style={{ marginTop: 14 }}>
          <CTA label={g.names[0]} bg={colors.p1} size={18} style={{ flex: 1 }} onPress={() => g.chooseWinner(0)} accessibilityLabel={`${g.names[0]} won the round`} />
          <CTA label={g.names[1]} bg={colors.p2} size={18} style={{ flex: 1 }} onPress={() => g.chooseWinner(1)} accessibilityLabel={`${g.names[1]} won the round`} />
        </Row>
      </Enter>
    </Screen>
  );
}
