import React from 'react';
import { View } from 'react-native';
import { useGame } from '../../store/GameContext';
import { colors, playerColor } from '../../theme/tokens';
import { CTA } from '../../ui/Btn';
import { Enter } from '../../ui/Motion';
import { Row, Screen } from '../../ui/Screen';
import { Body, Display, Mono } from '../../ui/Txt';

/** Screen 12b: both bids locked, put the phone in the middle. */
export function Ready() {
  const g = useGame();
  const r = g.state.round!;
  const Tile = ({ p }: { p: 0 | 1 }) => (
    <Enter kind={p === 0 ? 'left' : 'right'} duration={360} style={{ flex: 1, height: 130, borderRadius: 22, borderWidth: 2, borderColor: playerColor(p), alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <Mono color={playerColor(p)} ls={0.12} numberOfLines={1}>{g.names[p]}</Mono>
      <Display size={40} color={colors.ink5} ls={0} lh={1.1} upper={false}>$ ?</Display>
    </Enter>
  );
  return (
    <Enter kind="fade" duration={220} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 30 }}>
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', gap: 14 }}>
          <Mono size={12}>{r.items[r.idx]}</Mono>
          <Display size={44} lh={0.9}>{'BOTH BIDS\nLOCKED'}</Display>
          <Row gap={10} style={{ marginTop: 14 }}><Tile p={0} /><Tile p={1} /></Row>
          <Body size={15} color={colors.ink3} style={{ marginTop: 10 }}>Put the phone where you can both see it.</Body>
        </View>
        <CTA label="REVEAL BIDS" height={68} size={20} onPress={g.reveal} />
      </Screen>
    </Enter>
  );
}
