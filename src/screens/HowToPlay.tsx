import React from 'react';
import { View } from 'react-native';
import { useGame } from '../store/GameContext';
import { colors, playerColor } from '../theme/tokens';
import { CTA, TextLink } from '../ui/Btn';
import { Enter } from '../ui/Motion';
import { Screen } from '../ui/Screen';
import { Body, Display } from '../ui/Txt';

const RULES: [string, string][] = [
  ['$20 each', 'Both players get $20 of fake money for the round. Your balance is always on screen.'],
  ['10 hidden items', 'Items from one subtopic appear one at a time. Nobody knows what’s next.'],
  ['Bid back and forth', 'Take turns raising by at least $1. Pass to let the other player have it at their bid.'],
  ['Max 5 items', 'A full shelf can’t bid. Going once, going twice, sold: turn on the 3-second rule in Settings.'],
  ['You be the judge', 'After ten items, compare collections. The AI judge weighs in, but you decide.'],
];

export function HowToPlay() {
  const g = useGame();
  return (
    <Screen>
      <TextLink label="← BACK" onPress={() => g.go('home')} />
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
