import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';
import Animated, { Easing, FadeIn, Keyframe, interpolate, useAnimatedReaction, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming, Extrapolation, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { TOPICS } from '../content/topics';
import { haptic } from '../fx/haptics';
import { sfx } from '../fx/sound';
import { useGame } from '../store/GameContext';
import { colors, tint } from '../theme/tokens';
import { CTA, TextLink } from '../ui/Btn';
import { Enter } from '../ui/Motion';
import { Screen } from '../ui/Screen';
import { Display, FitText, Mono } from '../ui/Txt';

const ROW_H = 96;
const WINDOW_H = ROW_H * 3;
const SPIN_MS = 3300;

const fontFor = (title: string) => Math.min(64, Math.floor(330 / (title.length * 0.86)));

function Row({ i, y, title, size, color }: { i: number; y: SharedValue<number>; title: string; size: number; color: string }) {
  const st = useAnimatedStyle(() => {
    const dist = Math.abs(y.value + i * ROW_H) / ROW_H;
    return {
      opacity: interpolate(dist, [0, 1, 2], [1, 0.28, 0.06], Extrapolation.CLAMP),
      transform: [{ scale: interpolate(dist, [0, 1, 2], [1, 0.74, 0.55], Extrapolation.CLAMP) }],
    };
  });
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: i * ROW_H, height: ROW_H, alignItems: 'center', justifyContent: 'center' }, st]}>
      <Display size={size} ls={-0.04} lh={0.9} align="center" color={color} numberOfLines={1} adjustsFontSizeToFit>{title}</Display>
    </Animated.View>
  );
}

/** Slot-style reel: the strip scrolls up, slows to a stop, overshoots a touch, then settles on the target. */
function Reel({ reel, spin, landed, accent, onLand }: { reel: number[]; spin: boolean; landed: boolean; accent: string; onLand: () => void }) {
  const last = reel.length - 1;
  const travel = last * ROW_H;
  const y = useSharedValue(spin ? 0 : -travel);
  const lastTick = useSharedValue(0);

  useEffect(() => {
    if (!spin) { y.value = -travel; return; }
    y.value = withDelay(120, withSequence(
      withTiming(16, { duration: 170, easing: Easing.out(Easing.quad) }),
      withTiming(-travel - 14, { duration: SPIN_MS, easing: Easing.bezier(0.32, 0.04, 0.12, 1) }),
      withTiming(-travel, { duration: 280, easing: Easing.out(Easing.back(1.6)) }, (done) => { if (done) scheduleOnRN(onLand); }),
    ));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tick = () => { sfx('topic_spin_tick'); haptic('adjust'); };
  useAnimatedReaction(
    () => Math.round(-y.value / ROW_H),
    (cur, prev) => {
      if (prev === null || cur === prev || cur < 0 || cur > last) return;
      const now = Date.now();
      if (now - lastTick.value < 70) return;
      lastTick.value = now;
      scheduleOnRN(tick);
    },
  );

  const strip = useAnimatedStyle(() => ({ transform: [{ translateY: y.value + ROW_H }] }));
  return (
    <View style={{ height: WINDOW_H, width: '100%', overflow: 'hidden' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: 0, height: ROW_H * reel.length }, strip]}>
        {reel.map((idx, i) => {
          const title = TOPICS[idx]?.categoryTitle ?? '';
          return <Row key={i} i={i} y={y} title={title} size={fontFor(title)} color={landed && i === last ? accent : colors.ink} />;
        })}
      </Animated.View>
    </View>
  );
}

export function TopicReveal() {
  const g = useGame();
  const { idx, landed, reel } = g.state.reveal;
  const t = TOPICS[idx] ?? TOPICS[0];
  const spinning = !!reel && reel.length > 1 && !g.rm;
  const strip = spinning ? reel! : [idx];
  const ring = new Keyframe({ 0: { opacity: 0.9, transform: [{ scale: 0.3 }] }, 100: { opacity: 0, transform: [{ scale: 2.6 }], easing: Easing.out(Easing.ease) } }).duration(700);
  return (
    <Screen>
      {landed && <Animated.View pointerEvents="none" entering={FadeIn.duration(500)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: tint(t.accent, 0.14) }} />}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Enter kind="fade"><Mono size={12} color={colors.ink2} ls={0.2}>TONIGHT’S CATEGORY</Mono></Enter>
        <View style={{ marginTop: 14, height: WINDOW_H, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <Reel key={strip.join(',')} reel={strip} spin={spinning && !landed} landed={landed} accent={t.accent} onLand={g.landSpin} />
          <Display size={1} color="transparent" accessibilityLiveRegion="polite" style={{ position: 'absolute', height: 1, width: 1 }}>{landed ? t.categoryTitle : ''}</Display>
        </View>
        {landed && !g.rm && Platform.OS !== 'web' && (
          <Animated.View pointerEvents="none" entering={ring} style={{ position: 'absolute', width: 260, height: 260 }}>
            <View style={{ flex: 1, borderRadius: 130, borderWidth: 3, borderColor: t.accent, opacity: 0 }} />
          </Animated.View>
        )}
        <View style={{ minHeight: 56, marginTop: 6, alignItems: 'center', justifyContent: 'center' }}>
          {landed && (
            <Enter kind="pop" style={{ paddingHorizontal: 24 }}><FitText text={t.title} size={22} minSize={13} maxLines={2} wdth={110} weight={800} ls={0.04} lh={1.2} align="center" /></Enter>
          )}
        </View>
      </View>
      {landed ? (
        <Enter kind="in" delay={200} duration={360} style={{ gap: 10 }}>
          <CTA label="LET’S GO" bg={t.accent} onPress={() => g.go('intro')} />
          <TextLink label="SPIN AGAIN" height={48} align="center" onPress={g.startRandom} />
        </Enter>
      ) : (
        <View style={{ height: 110 }} />
      )}
    </Screen>
  );
}
