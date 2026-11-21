import React from 'react';
import { Animated as RNAnimated, PanResponder, Platform, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { haptic } from './fx/haptics';
import { useGame, type Screen } from './store/GameContext';
import { colors } from './theme/tokens';
import { Auction } from './screens/Auction';
import { Awards } from './screens/Awards';
import { Browser } from './screens/Browser';
import { Final } from './screens/Final';
import { Home } from './screens/Home';
import { HowToPlay } from './screens/HowToPlay';
import { MatchIntro } from './screens/MatchIntro';
import { PackEditor } from './screens/PackEditor';
import { Packs } from './screens/Packs';
import { Paywall } from './screens/Paywall';
import { Settings } from './screens/Settings';
import { Setup } from './screens/Setup';
import { Splash } from './screens/Splash';
import { Subtopics } from './screens/Subtopics';
import { TopicReveal } from './screens/TopicReveal';
import { Topics } from './screens/Topics';
import { Winner } from './screens/Winner';

/** Screens with a ← BACK link. The pack editor is left out: a stray swipe would throw away typed items. */
const SWIPE_BACK = new Set<Screen>(['howto', 'setup', 'topics', 'subtopics', 'paywall', 'browser', 'settings', 'packs']);
/** Touches that start this close to the left edge can swipe back, like iOS. */
const EDGE = 28;

/** Drag from the left edge to go back: the screen follows the finger and leaves past a third of the width or on a flick. */
function SwipeBack({ enabled, onBack, children }: { enabled: boolean; onBack: () => void; children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const x = React.useRef(new RNAnimated.Value(0)).current;
  const live = React.useRef({ enabled, onBack, width });
  live.current = { enabled, onBack, width };
  const pan = React.useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponderCapture: (e, g) =>
      live.current.enabled && e.nativeEvent.pageX - g.dx < EDGE && g.dx > 8 && Math.abs(g.dy) < g.dx,
    onPanResponderTerminationRequest: () => false,
    onPanResponderMove: (_, g) => x.setValue(Math.max(0, g.dx)),
    onPanResponderRelease: (_, g) => {
      const w = live.current.width;
      if (g.dx > w / 3 || (g.vx > 0.5 && g.dx > 40)) {
        haptic('nav');
        RNAnimated.timing(x, { toValue: w, duration: 160, useNativeDriver: true }).start(() => live.current.onBack());
      } else RNAnimated.spring(x, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
    },
    onPanResponderTerminate: () => RNAnimated.spring(x, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start(),
  }), [x]);
  return <RNAnimated.View {...pan.panHandlers} style={{ flex: 1, transform: [{ translateX: x }] }}>{children}</RNAnimated.View>;
}

/** Simple stack: one screen at a time, no tab bar. Screens cross-fade. */
export function Root() {
  const { state, rm, back } = useGame();
  let screen: React.ReactNode;
  switch (state.screen) {
    case 'splash': screen = <Splash />; break;
    case 'home': screen = <Home />; break;
    case 'howto': screen = <HowToPlay />; break;
    case 'setup': screen = <Setup />; break;
    case 'topics': screen = <Topics />; break;
    case 'paywall': screen = <Paywall />; break;
    case 'subtopics': screen = <Subtopics />; break;
    case 'reveal': screen = <TopicReveal />; break;
    case 'intro': screen = <MatchIntro />; break;
    case 'auction': screen = <Auction />; break;
    case 'final': screen = <Final />; break;
    case 'winner': screen = <Winner />; break;
    case 'awards': screen = <Awards />; break;
    case 'browser': screen = <Browser />; break;
    case 'settings': screen = <Settings />; break;
    case 'packs': screen = <Packs />; break;
    case 'packEdit': screen = <PackEditor />; break;
  }
  const animate = !rm && Platform.OS !== 'web';
  return (
    <Animated.View
      key={state.screen}
      entering={animate ? FadeIn.duration(220) : undefined}
      exiting={animate ? FadeOut.duration(120) : undefined}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <SwipeBack enabled={SWIPE_BACK.has(state.screen)} onBack={back}>{screen}</SwipeBack>
    </Animated.View>
  );
}
