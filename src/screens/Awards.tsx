import React from 'react';
import { ScrollView, View } from 'react-native';
import { awardsList } from '../game/round';
import { useGame } from '../store/GameContext';
import { colors, playerColor } from '../theme/tokens';
import { CTA, Outline, TextLink } from '../ui/Btn';
import { Enter } from '../ui/Motion';
import { Row, Screen } from '../ui/Screen';
import { Body, Display, Mono, FitText } from '../ui/Txt';

export function Awards() {
  const g = useGame();
  const r = g.state.round;
  const awards = r ? awardsList(r) : [];
  return (
    <Screen>
      <Mono color={g.topic.accent}>ROUND {g.state.lastRound} RECAP</Mono>
      <Display size={40} lh={0.9} style={{ marginTop: 8 }}>{'THE\nAWARDS'}</Display>
      <ScrollView style={{ flex: 1, marginTop: 20 }} contentContainerStyle={{ gap: 10 }} showsVerticalScrollIndicator={false}>
        {awards.map((a, k) => (
          <Enter key={a.title} kind="in" delay={80 + k * 90} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 20, backgroundColor: colors.surface }}>
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: playerColor(a.w), alignItems: 'center', justifyContent: 'center' }}>
              <Display size={18} color={colors.bg} ls={0} lh={1.1}>{g.names[a.w].charAt(0)}</Display>
            </View>
            <View style={{ flex: 1 }}>
              <Mono size={10}>{a.title}</Mono>
              <FitText text={g.names[a.w]} size={19} minSize={12} wdth={115} ls={-0.01} lh={1.1} style={{ marginTop: 2 }} />
              <Body size={13} color={colors.ink3} style={{ marginTop: 2 }}>{a.desc}</Body>
            </View>
          </Enter>
        ))}
        {awards.length === 0 && <Body size={14} color={colors.ink4}>No awards this round. A quiet auction.</Body>}
      </ScrollView>
      <View style={{ gap: 10, marginTop: 14 }}>
        <CTA label={`REMATCH · ${g.topic.title}`} bg={g.topic.accent} onPress={g.startRound} />
        <Row gap={10}>
          <Outline label="NEW TOPIC" height={54} size={13} style={{ flex: 1 }} onPress={() => g.go('topics')} />
          <Outline label="CHANGE PLAYERS" height={54} size={13} style={{ flex: 1 }} onPress={g.openSetup} />
        </Row>
        <TextLink label="HOME" height={40} align="center" color={colors.ink3} size={11} onPress={() => g.go('home')} />
      </View>
    </Screen>
  );
}
