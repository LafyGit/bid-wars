import React from 'react';
import { View } from 'react-native';
import { useGame } from '../../store/GameContext';
import { colors } from '../../theme/tokens';
import { Enter } from '../../ui/Motion';
import { Display, Mono } from '../../ui/Txt';

/** Screen 13: 3 · 2 · 1 in the topic accent, 420ms per digit. */
export function Countdown() {
  const g = useGame();
  const r = g.state.round!;
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 30, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }} accessibilityLiveRegion="assertive" accessibilityLabel={`Revealing bids in ${r.count}`}>
      <Mono size={12} ls={0.2} style={{ position: 'absolute', top: 120 }}>REVEALING BIDS</Mono>
      <Enter key={r.count} kind="count"><Display size={260} color={g.topic.accent} ls={-0.02} lh={1} tabular>{r.count}</Display></Enter>
    </View>
  );
}
