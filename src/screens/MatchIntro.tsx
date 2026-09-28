import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { topicLabel } from '../content/topics';
import { useGame } from '../store/GameContext';
import { colors, withAlpha } from '../theme/tokens';
import { CTA } from '../ui/Btn';
import { Enter } from '../ui/Motion';
import { Row, Screen } from '../ui/Screen';
import { Display, Mono, nameSize } from '../ui/Txt';

function Tile({ big, label, delay }: { big: string; label: string; delay: number }) {
  return (
    <Enter kind="in" delay={delay} duration={400} style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 18, backgroundColor: 'rgba(14,15,18,0.7)', borderWidth: 1, borderColor: colors.line10 }}>
      <Display size={26} ls={-0.02} lh={1.05}>{big}</Display>
      <Mono size={10} style={{ marginTop: 2 }}>{label}</Mono>
    </Enter>
  );
}

export function MatchIntro() {
  const g = useGame();
  const { width } = useWindowDimensions();
  const fit = width - 60;
  const [n1, n2] = g.names;
  const accent = g.topic.accent;
  return (
    <Screen style={{ overflow: 'hidden' }}>
      <Enter kind="left" duration={500} pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '50%', backgroundColor: withAlpha(colors.p1, 0.1) }} />
      <Enter kind="right" duration={500} pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '50%', backgroundColor: withAlpha(colors.p2, 0.08) }} />
      <Row justify="space-between">
        <Mono color={colors.ink2}>ROUND {g.state.session.rounds + 1}</Mono>
        <Mono color={accent}>{topicLabel(g.topic)}</Mono>
      </Row>
      <View style={{ flex: 1, justifyContent: 'center', gap: 4 }}>
        <Enter kind="left" duration={460}><Display size={nameSize(n1, 84, fit)} color={colors.p1} ls={-0.04} lh={0.95} numberOfLines={1} adjustsFontSizeToFit>{n1}</Display></Enter>
        <Enter kind="pop" delay={300} duration={400} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginVertical: 10 }}>
          <View style={{ flex: 1, height: 2, backgroundColor: colors.line20 }} />
          <Display size={26} ls={0} lh={1.1}>VS</Display>
          <View style={{ flex: 1, height: 2, backgroundColor: colors.line20 }} />
        </Enter>
        <Enter kind="right" delay={120} duration={460} style={{ alignSelf: 'flex-end' }}><Display size={nameSize(n2, 84, fit)} color={colors.p2} ls={-0.04} lh={0.95} align="right" numberOfLines={1} adjustsFontSizeToFit>{n2}</Display></Enter>
        <Row gap={10} style={{ marginTop: 34 }}>
          <Tile big="$20" label="EACH" delay={480} />
          <Tile big="10" label="HIDDEN ITEMS" delay={520} />
          <Tile big="5" label="MAX EACH" delay={560} />
        </Row>
        <Enter kind="in" delay={640} duration={400} style={{ marginTop: 22 }}>
          <Mono color={accent} ls={0.16}>ONE RULE</Mono>
          <Display size={25} wdth={118} ls={-0.01} lh={1.05} style={{ marginTop: 6 }}>OUTBID THEM OR BACK OUT.</Display>
        </Enter>
      </View>
      <Enter kind="in" delay={760} duration={400}>
        <CTA label="START AUCTION" bg={accent} height={66} size={20} onPress={g.startRound} />
      </Enter>
    </Screen>
  );
}
