import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { judgeAvailable, judgeCollections, localVerdict, type Verdict } from '../ai/judge';
import { topicLabel } from '../content/topics';
import type { Player } from '../game/types';
import { useGame } from '../store/GameContext';
import { colors, layout, playerColor } from '../theme/tokens';
import { CTA } from '../ui/Btn';
import { Enter } from '../ui/Motion';
import { Row, Screen, useScreenInsets } from '../ui/Screen';
import { Body, Display, Mono } from '../ui/Txt';

function CollectionCard({ p }: { p: Player }) {
  const g = useGame();
  const r = g.state.round!;
  const coll = r.collections[p];
  return (
    <Enter kind={p === 0 ? 'left' : 'right'} delay={100} duration={400} style={{ flex: 1, borderRadius: 22, backgroundColor: colors.surface, paddingVertical: 16, paddingHorizontal: 14 }}>
      <Display size={20} wdth={118} color={playerColor(p)} ls={-0.01} lh={1.1} numberOfLines={1}>{g.names[p]}</Display>
      <View style={{ marginTop: 10 }}>
        {coll.map((c, i) => (
          <Enter key={`${c.name}-${i}`} kind="in" delay={220 + i * 60} duration={300}>
            <Row justify="space-between" gap={6} style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line07 }}>
              <Body size={14} weight={600} color={colors.ink} style={{ flex: 1 }} numberOfLines={2}>{c.name}</Body>
              <Body size={14} weight={600} color={colors.ink3} tabular>${c.price}</Body>
            </Row>
          </Enter>
        ))}
        {coll.length === 0 && <Body size={14} color={colors.ink5} style={{ paddingVertical: 8 }}>Won nothing. Bold.</Body>}
      </View>
      <Mono size={10} ls={0.12} style={{ marginTop: 14 }}>REMAINING</Mono>
      <Display size={30} ls={-0.02} lh={1.1} tabular>${r.budgets[p]}</Display>
    </Enter>
  );
}

/** The judge's verdict card. Claude when a key is configured, a built-in judge otherwise. Advice only. */
function Judge() {
  const g = useGame();
  const r = g.state.round!;
  const [v, setV] = useState<Verdict | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    const input = { topic: topicLabel(g.topic), names: g.names, collections: r.collections, budgets: r.budgets, unclaimed: r.log.filter((l) => l.w === -1).map((l) => l.item) };
    if (!judgeAvailable()) { setV(localVerdict(input)); return; }
    judgeCollections(input).then((res) => alive && setV(res)).catch((e) => { if (alive) { setErr(e instanceof Error ? e.message : 'Judge unavailable'); setV(localVerdict(input)); } });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const color = v && v.winner >= 0 ? playerColor(v.winner) : colors.ink3;
  return (
    <Enter kind="in" delay={400} duration={400} style={{ marginTop: 12, borderRadius: 22, backgroundColor: colors.surface, padding: 16, borderWidth: 1.5, borderColor: v ? color : colors.line12 }}>
      <Row gap={10}>
        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
          <Display size={16} color={colors.bg} ls={0} lh={1.1}>AI</Display>
        </View>
        <View style={{ flex: 1 }}>
          <Mono size={10} color={colors.ink4}>{judgeAvailable() ? 'THE JUDGE · CLAUDE' : 'THE JUDGE'}</Mono>
          <Body size={12} color={colors.ink5}>Opinion only. You still tap the winner.</Body>
        </View>
        {!v && <ActivityIndicator color={colors.ink3} />}
      </Row>
      {v && (
        <Enter kind="in" duration={360} style={{ marginTop: 12 }}>
          <Display size={22} wdth={115} color={color} ls={-0.01} lh={1.05}>{v.headline}</Display>
          <Body size={14} color={colors.ink2} style={{ marginTop: 8 }}>{v.reasoning}</Body>
          <Body size={14} weight={700} color={colors.ink} style={{ marginTop: 8 }}>{v.roast}</Body>
          {err && <Body size={11} color={colors.ink5} style={{ marginTop: 8 }}>Claude was unreachable ({err}), so the built-in judge ruled.</Body>}
        </Enter>
      )}
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
        {g.state.settings.aiJudge && <Judge />}
      </ScrollView>
      <Enter kind="in" delay={300} duration={400} style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: p.bottom, backgroundColor: colors.bg }}>
        <Display size={24} ls={-0.02} lh={1.1} align="center">WHO WON?</Display>
        <Body size={13} color={colors.ink3} align="center" style={{ marginTop: 4 }}>Argue it out. Then tap the winner.</Body>
        <Row gap={10} style={{ marginTop: 12 }}>
          <CTA label={g.names[0]} bg={colors.p1} size={18} style={{ flex: 1 }} onPress={() => g.chooseWinner(0)} accessibilityLabel={`${g.names[0]} won the round`} />
          <CTA label={g.names[1]} bg={colors.p2} size={18} style={{ flex: 1 }} onPress={() => g.chooseWinner(1)} accessibilityLabel={`${g.names[1]} won the round`} />
        </Row>
      </Enter>
    </Screen>
  );
}
