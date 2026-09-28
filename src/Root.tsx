import React from 'react';
import { View } from 'react-native';
import { useGame } from './store/GameContext';
import { colors } from './theme/tokens';
import { Auction } from './screens/Auction';
import { Awards } from './screens/Awards';
import { Browser } from './screens/Browser';
import { Final } from './screens/Final';
import { Home } from './screens/Home';
import { HowToPlay } from './screens/HowToPlay';
import { MatchIntro } from './screens/MatchIntro';
import { Settings } from './screens/Settings';
import { Setup } from './screens/Setup';
import { Splash } from './screens/Splash';
import { TopicReveal } from './screens/TopicReveal';
import { Topics } from './screens/Topics';
import { Winner } from './screens/Winner';

/** Simple stack: one screen at a time, no tab bar. */
export function Root() {
  const { state } = useGame();
  let screen: React.ReactNode;
  switch (state.screen) {
    case 'splash': screen = <Splash />; break;
    case 'home': screen = <Home />; break;
    case 'howto': screen = <HowToPlay />; break;
    case 'setup': screen = <Setup />; break;
    case 'topics': screen = <Topics />; break;
    case 'reveal': screen = <TopicReveal />; break;
    case 'intro': screen = <MatchIntro />; break;
    case 'auction': screen = <Auction />; break;
    case 'final': screen = <Final />; break;
    case 'winner': screen = <Winner />; break;
    case 'awards': screen = <Awards />; break;
    case 'browser': screen = <Browser />; break;
    case 'settings': screen = <Settings />; break;
  }
  return <View key={state.screen} style={{ flex: 1, backgroundColor: colors.bg }}>{screen}</View>;
}
