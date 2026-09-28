import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useGame } from '../store/GameContext';
import { colors, radii } from '../theme/tokens';
import { CTA, Chip, Outline } from '../ui/Btn';
import { Enter } from '../ui/Motion';
import { Row, Screen } from '../ui/Screen';
import { Body, Display, Mono } from '../ui/Txt';

function TiltCard({ color, glyph, from, to, period, offset }: { color: string; glyph: string; from: number; to: number; period: number; offset: { x: number; y: number } }) {
  const { rm } = useGame();
  const k = useSharedValue(0);
  useEffect(() => {
    if (rm) { k.value = 0; return; }
    k.value = withRepeat(withSequence(withTiming(1, { duration: period / 2, easing: Easing.inOut(Easing.ease) }), withTiming(0, { duration: period / 2, easing: Easing.inOut(Easing.ease) })), -1, false);
  }, [rm, period, k]);
  const st = useAnimatedStyle(() => ({ transform: [{ rotate: `${from + (to - from) * k.value}deg` }, { translateY: -8 * k.value }] }));
  return (
    <Animated.View style={[{ position: 'absolute', width: 150, height: 210, marginLeft: offset.x, marginTop: offset.y, borderRadius: radii.card, backgroundColor: color, opacity: 0.9, alignItems: 'center', justifyContent: 'center' }, st]}>
      <Display size={80} color={colors.bg} ls={-0.02} lh={1.1} upper={false}>{glyph}</Display>
    </Animated.View>
  );
}

export function Home() {
  const g = useGame();
  const [n1, n2] = g.names;
  const hasScore = g.state.score[0] + g.state.score[1] > 0;
  return (
    <Screen>
      <Row justify="space-between">
        <Chip label={g.state.settings.sound ? 'SOUND ON' : 'SOUND OFF'} onPress={g.toggleSound} accessibilityLabel={g.state.settings.sound ? 'Sound on. Tap to mute' : 'Sound off. Tap to unmute'} />
        <Chip label="SETTINGS" onPress={() => g.go('settings', 'home')} />
      </Row>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', top: '50%', left: '50%' }}>
          <TiltCard color={colors.p1} glyph="?" from={-14} to={-11} period={5000} offset={{ x: -170, y: -190 }} />
          <TiltCard color={colors.p2} glyph="$" from={12} to={9} period={5600} offset={{ x: 24, y: -150 }} />
        </View>
        <Enter kind="in" duration={420} style={{ marginTop: 150, alignItems: 'center' }}>
          <Display size={76} ls={-0.045} lh={0.86} align="center">{'BID\nWARS'}</Display>
          <Body size={17} align="center" style={{ marginTop: 16 }}>Spend smart. You don’t know what’s next.</Body>
          {hasScore && (
            <View style={{ marginTop: 18, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: colors.surfaceHover }}>
              <Mono size={12} color={colors.ink2} ls={0.08} upper={false}>MATCH · {n1} {g.state.score[0]} – {g.state.score[1]} {n2}</Mono>
            </View>
          )}
        </Enter>
      </View>
      <Enter kind="in" delay={120} duration={420} style={{ gap: 12 }}>
        <CTA label="PLAY" height={68} size={22} onPress={g.play} />
        <Row gap={12}>
          <Outline label="HOW TO PLAY" style={{ flex: 1 }} onPress={() => g.go('howto')} />
          <Outline label="TOPICS" style={{ flex: 1 }} onPress={() => g.go('browser')} />
        </Row>
      </Enter>
    </Screen>
  );
}
