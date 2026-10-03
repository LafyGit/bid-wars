import React from 'react';
import { Pressable, View } from 'react-native';
import { useGame } from '../../store/GameContext';
import { colors, playerColor } from '../../theme/tokens';
import { TextLink } from '../../ui/Btn';
import { Row } from '../../ui/Screen';
import { Sheet } from '../../ui/Sheet';
import { Body, Display, Mono, FitText } from '../../ui/Txt';
import type { Player } from '../../game/types';

/** Screen 08 bottom strip: "COLLECTIONS · Lafy 1 · Dhari 2 ▲". */
export function CollectionsStrip() {
  const g = useGame();
  const r = g.state.round!;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Collections. ${g.names[0]} ${r.collections[0].length}, ${g.names[1]} ${r.collections[1].length}. Tap to open`}
      onPress={g.toggleColl}
      style={({ pressed }) => ({ marginHorizontal: 16, marginBottom: 30, height: 52, borderRadius: 18, backgroundColor: pressed ? colors.surfaceHover : colors.surfaceAlt, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' })}
    >
      <Mono>COLLECTIONS</Mono>
      <Row gap={14}>
        <Body size={14} weight={700} color={playerColor(0)}>{g.names[0]} {r.collections[0].length}</Body>
        <Body size={14} weight={700} color={playerColor(1)}>{g.names[1]} {r.collections[1].length}</Body>
        <Body size={14} weight={700} color={colors.ink4}>▲</Body>
      </Row>
    </Pressable>
  );
}

function Column({ p }: { p: Player }) {
  const g = useGame();
  const r = g.state.round!;
  const verdictShown = r.phase === 'result' && r.resultStage >= 1;
  const budget = verdictShown ? r.budgets[p] : r.prev[p];
  const coll = r.collections[p];
  return (
    <View style={{ flex: 1 }}>
      <Mono color={playerColor(p)} ls={0.12} numberOfLines={1} style={{ paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: playerColor(p) }}>{g.names[p]} · ${budget} LEFT</Mono>
      {coll.map((c, i) => (
        <Row key={`${c.name}-${i}`} justify="space-between" gap={6} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line07 }}>
          <View style={{ flex: 1 }}><FitText kind="body" text={c.name} size={15} minSize={10} maxLines={2} weight={600} color={colors.ink} /></View>
          <Body size={15} weight={600} color={colors.ink3} tabular>${c.price}</Body>
        </Row>
      ))}
      {coll.length === 0 && <Body size={14} color={colors.ink5} style={{ paddingVertical: 10 }}>Nothing yet</Body>}
    </View>
  );
}

/** Screen 18: mid-game collections bottom sheet. */
export function CollectionsSheet() {
  const g = useGame();
  const r = g.state.round!;
  const after = 9 - r.idx;
  return (
    <Sheet onClose={g.toggleColl}>
      <Row justify="space-between">
        <Display size={22} ls={-0.02} lh={1.1}>COLLECTIONS</Display>
        <TextLink label="CLOSE" onPress={g.toggleColl} />
      </Row>
      <Row gap={14} align="flex-start" style={{ marginTop: 10 }}>
        <Column p={0} />
        <Column p={1} />
      </Row>
      <Body size={13} color={colors.ink4} style={{ marginTop: 16 }}>{after > 0 ? `${after} item${after > 1 ? 's' : ''} still hidden after this one.` : 'This is the last item.'}</Body>
    </Sheet>
  );
}
