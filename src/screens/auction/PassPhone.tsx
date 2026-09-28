import React, { useEffect } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useGame } from '../../store/GameContext';
import { colors, playerColor } from '../../theme/tokens';
import { CTA } from '../../ui/Btn';
import { Enter } from '../../ui/Motion';
import { Screen } from '../../ui/Screen';
import { Body, Display, Mono, nameSize } from '../../ui/Txt';

function PhoneIcon({ color }: { color: string }) {
  const { rm } = useGame();
  const k = useSharedValue(0);
  useEffect(() => {
    if (rm) { k.value = 0.5; return; }
    k.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }), -1, false);
  }, [rm, k]);
  const st = useAnimatedStyle(() => ({
    opacity: interpolate(k.value, [0, 0.25, 0.75, 1], [0, 1, 1, 0]),
    transform: [{ translateX: interpolate(k.value, [0, 1], [-70, 70]) }, { rotate: `${interpolate(k.value, [0, 1], [-10, 10])}deg` }],
  }));
  return <Animated.View style={[{ width: 56, height: 96, borderRadius: 14, borderWidth: 3, borderColor: color }, st]} />;
}

/** Screen 11: hand the phone over. The opponent's bid is never shown here. */
export function PassPhone() {
  const g = useGame();
  const r = g.state.round!;
  const { width } = useWindowDimensions();
  const next = r.bidder;
  const prev = g.names[1 - next];
  const nextName = g.names[next];
  const c = playerColor(next);
  return (
    <Enter kind="fade" duration={220} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 30 }}>
      <Screen bg={colors.bgDeep}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <View style={{ height: 120, alignItems: 'center', justifyContent: 'center' }}><PhoneIcon color={c} /></View>
          <Mono size={12} color={colors.ink4} style={{ marginTop: 28 }}>{prev}’S BID IS LOCKED</Mono>
          <Display size={44} lh={0.9} style={{ marginTop: 10 }}>{'PASS THE\nPHONE TO'}</Display>
          <Enter kind="right" duration={400}>
            <Display size={nameSize(nextName, 64, width - 60)} color={c} ls={-0.04} lh={0.95} numberOfLines={1} adjustsFontSizeToFit>{nextName}</Display>
          </Enter>
          <Body size={16} color={colors.ink3} style={{ marginTop: 18 }}>No peeking, {prev}.</Body>
        </View>
        <CTA label={`I’M ${nextName}`} bg={c} height={68} onPress={g.handedOver} />
      </Screen>
    </Enter>
  );
}
