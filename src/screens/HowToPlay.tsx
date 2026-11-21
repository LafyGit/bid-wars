import React from 'react';
import { View } from 'react-native';
import { useGame } from '../store/GameContext';
import { colors, playerColor } from '../theme/tokens';
import { CTA, TextLink } from '../ui/Btn';
import { Enter } from '../ui/Motion';
import { Screen } from '../ui/Screen';
import { Body, Display } from '../ui/Txt';

const RULES: [string, string][] = [
  ['$20 each', 'Fake money for the round. Your balance is always on screen.'],
  ['10 hidden items', 'One at a time, from one topic. Nobody knows what’s next.'],
  ['Bid or pass', 'Raise by $1 or more, or pass and let them have it. Nobody bids? It goes free to whoever has fewer.'],
  ['5 items each', 'Every item lands on a shelf. Fill yours and the rest go to the other player.'],
  ['Best shelf wins', 'The judge rates both collections on reviews and reputation, not money. You still tap the winner.'],
];

export function HowToPlay() {
  const g = useGame();
  return (
    <Screen>
      <TextLink label="← BACK" onPress={g.back} />
      <Display size={40} style={{ marginTop: 14 }}>{'HOW TO\nPLAY'}</Display>
      <View style={{ flex: 1, justifyContent: 'center', gap: 10 }}>
        {RULES.map(([title, body], i) => (
          <Enter key={title} kind="in" delay={i * 70} style={{ flexDirection: 'row', gap: 12, padding: 16, borderRadius: 18, backgroundColor: colors.surface }}>
            <Display size={22} color={playerColor(i % 2)} ls={-0.01} lh={1.1} style={{ width: 44 }}>{`0${i + 1}`}</Display>
            <View style={{ flex: 1 }}>
              <Display size={16} wdth={110} weight={800} upper={false} ls={0} lh={1.2}>{title}</Display>
              <Body size={14} color={colors.ink3} style={{ marginTop: 4 }}>{body}</Body>
            </View>
          </Enter>
        ))}
      </View>
      <CTA label="GOT IT, LET’S PLAY" onPress={g.play} />
    </Screen>
  );
}
