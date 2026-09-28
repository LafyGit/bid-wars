import React from 'react';
import { useGame } from '../../store/GameContext';
import { colors } from '../../theme/tokens';
import { CTA, Outline } from '../../ui/Btn';
import { Sheet } from '../../ui/Sheet';
import { Display } from '../../ui/Txt';

/** "···" pause sheet: RESUME, SETTINGS (returns to the game), QUIT ROUND. */
export function PauseMenu() {
  const g = useGame();
  return (
    <Sheet onClose={g.toggleMenu} scrim={colors.scrim65} duration={280} style={{ paddingTop: 24, gap: 10, zIndex: 60 }}>
      <Display size={22} ls={-0.02} lh={1.1} style={{ marginBottom: 6 }}>PAUSED</Display>
      <CTA label="RESUME" height={58} size={16} style={{ borderRadius: 18 }} onPress={g.toggleMenu} />
      <Outline label="SETTINGS" height={58} size={15} onPress={() => g.go('settings', 'auction')} />
      <Outline label="QUIT ROUND" height={58} size={15} onPress={g.quitRound} />
    </Sheet>
  );
}
