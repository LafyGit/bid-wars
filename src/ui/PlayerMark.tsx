import React from 'react';
import { View } from 'react-native';
import { playerColor } from '../theme/tokens';
import type { Player } from '../game/types';

/** Player shape marker: P1 circle, P2 diamond. Never rely on color alone. */
export function PlayerMark({ p, size = 8 }: { p: Player; size?: number }) {
  return p === 0
    ? <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: playerColor(0) }} />
    : <View style={{ width: size, height: size, backgroundColor: playerColor(1), transform: [{ rotate: '45deg' }] }} />;
}
