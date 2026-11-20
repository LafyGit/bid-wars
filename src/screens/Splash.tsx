import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import Animated, { Keyframe } from 'react-native-reanimated';
import { useGame } from '../store/GameContext';
import { colors } from '../theme/tokens';
import { Enter, EASE_OUT_QUICK, Pulse } from '../ui/Motion';
import { Display, Mono } from '../ui/Txt';
import { wordmark } from '../ui/Wordmark';

export function Splash() {
  const g = useGame();
  const w = wordmark(84);
  const sweep = new Keyframe({ 0: { transform: [{ scaleX: 0 }] }, 100: { transform: [{ scaleX: 1 }], easing: EASE_OUT_QUICK } }).duration(360).delay(200);
  return (
    <Pressable accessibilityLabel="Continue" onPress={() => g.go('home')} style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: w.width }} accessible accessibilityRole="header" accessibilityLabel="Outbid">
        <Enter kind="left" duration={420}><Display {...w.out}>OUT</Display></Enter>
        <Enter kind="right" delay={80} duration={420}><Display {...w.bid}>BID</Display></Enter>
        <Animated.View entering={g.rm || Platform.OS === 'web' ? undefined : sweep} style={{ flexDirection: 'row', ...w.bar, gap: 6, transformOrigin: 'left' }}>
          <View style={{ flex: 1, backgroundColor: colors.p1, borderRadius: 2 }} />
          <View style={{ flex: 1, backgroundColor: colors.p2, borderRadius: 2 }} />
        </Animated.View>
      </View>
      <Pulse style={{ position: 'absolute', bottom: 64 }}>
        <Mono size={11} color={colors.ink4} ls={0.16}>TWO PLAYERS · ONE PHONE</Mono>
      </Pulse>
    </Pressable>
  );
}
