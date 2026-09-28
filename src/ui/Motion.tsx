import React, { useEffect } from 'react';
import { Platform, View, type ViewStyle, type StyleProp } from 'react-native';
import Animated, { Easing, FadeIn, Keyframe, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useGame } from '../store/GameContext';

export const EASE_OUT_QUICK = Easing.bezier(0.2, 0.9, 0.2, 1);
export const EASE_FLIP = Easing.bezier(0.3, 1.3, 0.5, 1);
export const EASE_BURST = Easing.bezier(0.1, 0.8, 0.3, 1);

export type EnterKind = 'in' | 'fade' | 'pop' | 'left' | 'right' | 'up' | 'stamp' | 'count' | 'tie';

function keyframe(kind: EnterKind, duration: number) {
  switch (kind) {
    case 'in': return new Keyframe({ 0: { opacity: 0, transform: [{ translateY: 16 }] }, 100: { opacity: 1, transform: [{ translateY: 0 }], easing: Easing.out(Easing.cubic) } }).duration(duration);
    case 'fade': return new Keyframe({ 0: { opacity: 0 }, 100: { opacity: 1 } }).duration(duration);
    case 'pop': return new Keyframe({ 0: { opacity: 0, transform: [{ scale: 0.55 }] }, 60: { opacity: 1, transform: [{ scale: 1.08 }] }, 100: { opacity: 1, transform: [{ scale: 1 }] } }).duration(duration);
    case 'left': return new Keyframe({ 0: { opacity: 0, transform: [{ translateX: -80 }] }, 100: { opacity: 1, transform: [{ translateX: 0 }], easing: EASE_OUT_QUICK } }).duration(duration);
    case 'right': return new Keyframe({ 0: { opacity: 0, transform: [{ translateX: 80 }] }, 100: { opacity: 1, transform: [{ translateX: 0 }], easing: EASE_OUT_QUICK } }).duration(duration);
    case 'up': return new Keyframe({ 0: { transform: [{ translateY: 600 }] }, 100: { transform: [{ translateY: 0 }], easing: EASE_OUT_QUICK } }).duration(duration);
    case 'stamp': return new Keyframe({ 0: { opacity: 0, transform: [{ scale: 2.2 }] }, 60: { opacity: 1, transform: [{ scale: 0.94 }] }, 100: { opacity: 1, transform: [{ scale: 1 }] } }).duration(duration);
    case 'count': return new Keyframe({ 0: { opacity: 0, transform: [{ scale: 1.9 }] }, 35: { opacity: 1, transform: [{ scale: 1 }] }, 100: { opacity: 1, transform: [{ scale: 0.88 }] } }).duration(duration);
    case 'tie':
      // pop (300ms) then shake ±12/±7 twice (420ms × 2) — total 1140ms
      return new Keyframe({
        0: { opacity: 0, transform: [{ scale: 0.55 }, { translateX: 0 }] },
        16: { opacity: 1, transform: [{ scale: 1.08 }, { translateX: 0 }] },
        26: { opacity: 1, transform: [{ scale: 1 }, { translateX: 0 }] },
        33: { opacity: 1, transform: [{ scale: 1 }, { translateX: -12 }] },
        41: { opacity: 1, transform: [{ scale: 1 }, { translateX: 12 }] },
        48: { opacity: 1, transform: [{ scale: 1 }, { translateX: -7 }] },
        56: { opacity: 1, transform: [{ scale: 1 }, { translateX: 7 }] },
        63: { opacity: 1, transform: [{ scale: 1 }, { translateX: 0 }] },
        70: { opacity: 1, transform: [{ scale: 1 }, { translateX: -12 }] },
        78: { opacity: 1, transform: [{ scale: 1 }, { translateX: 12 }] },
        85: { opacity: 1, transform: [{ scale: 1 }, { translateX: -7 }] },
        93: { opacity: 1, transform: [{ scale: 1 }, { translateX: 7 }] },
        100: { opacity: 1, transform: [{ scale: 1 }, { translateX: 0 }] },
      }).duration(duration);
  }
}

const DEFAULT_DURATION: Record<EnterKind, number> = { in: 380, fade: 300, pop: 420, left: 460, right: 460, up: 300, stamp: 380, count: 420, tie: 1140 };

/**
 * Entering animation for Animated.View. Under reduced motion every entrance becomes a short fade.
 */
export function useEnter() {
  const { rm } = useGame();
  return (kind: EnterKind, delay = 0, duration = DEFAULT_DURATION[kind]) => {
    // Reanimated keyframe entrances leave views at their first frame on web, so web gets no entrances.
    if (Platform.OS === 'web') return undefined;
    if (rm) return FadeIn.duration(120);
    return keyframe(kind, duration).delay(delay);
  };
}

/** Convenience wrapper: <Enter kind="in" delay={120}>…</Enter> */
export function Enter({ kind, delay, duration, style, children, pointerEvents }: { kind: EnterKind; delay?: number; duration?: number; style?: StyleProp<ViewStyle>; children?: React.ReactNode; pointerEvents?: 'none' | 'auto' | 'box-none' }) {
  const enter = useEnter();
  return <Animated.View pointerEvents={pointerEvents} entering={enter(kind, delay, duration)} style={style}>{children}</Animated.View>;
}

/** Idle float: translateY 0 → −7 → 0 over 2.6s. */
export function Float({ children, style, amplitude = 7, period = 2600 }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; amplitude?: number; period?: number }) {
  const { rm } = useGame();
  const y = useSharedValue(0);
  useEffect(() => {
    if (rm) { y.value = 0; return; }
    y.value = withRepeat(withSequence(withTiming(-amplitude, { duration: period / 2, easing: Easing.inOut(Easing.ease) }), withTiming(0, { duration: period / 2, easing: Easing.inOut(Easing.ease) })), -1, false);
  }, [rm, amplitude, period, y]);
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return <Animated.View style={[style, st]}>{children}</Animated.View>;
}

/** Opacity pulse 1 → .4 → 1. */
export function Pulse({ children, style, period = 1600, min = 0.4 }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; period?: number; min?: number }) {
  const { rm } = useGame();
  const o = useSharedValue(1);
  useEffect(() => {
    if (rm) { o.value = 1; return; }
    o.value = withRepeat(withSequence(withTiming(min, { duration: period / 2 }), withTiming(1, { duration: period / 2 })), -1, false);
  }, [rm, period, min, o]);
  const st = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[style, st]}>{children}</Animated.View>;
}

/** Full-bleed color flash: opacity .45 → 0. Mount it keyed so it replays. */
export function Flash({ color, duration = 600 }: { color: string; duration?: number }) {
  const { rm } = useGame();
  if (rm || Platform.OS === 'web') return null;
  const kf = new Keyframe({ 0: { opacity: 0.45 }, 100: { opacity: 0, easing: Easing.out(Easing.ease) } }).duration(duration);
  return (
    <Animated.View pointerEvents="none" entering={kf} style={{ position: 'absolute', top: -400, left: -100, right: -100, bottom: -400 }}>
      <View style={{ flex: 1, backgroundColor: color, opacity: 0 }} />
    </Animated.View>
  );
}

/** Radial particle burst: 22 particles + a ring. Position it at the center of a relative parent. */
export function Burst({ color, seed }: { color: string; seed: number }) {
  const { rm } = useGame();
  if (rm || Platform.OS === 'web') return null;
  const parts = React.useMemo(() => Array.from({ length: 22 }, (_, i) => {
    const ang = (i / 22) * Math.PI * 2 + Math.random() * 0.3;
    const dist = 100 + Math.random() * 90;
    const sz = 6 + Math.random() * 8;
    return { i, dx: Math.cos(ang) * dist, dy: Math.sin(ang) * dist, sz, dur: 650 + Math.random() * 250, round: i % 3 !== 0, white: i % 4 === 0 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [seed]);
  return (
    <Animated.View key={seed} pointerEvents="none" style={{ position: 'absolute', left: '50%', top: '50%', width: 0, height: 0, zIndex: 0 }}>
      {parts.map((p) => (
        <Animated.View
          key={p.i}
          entering={new Keyframe({
            0: { opacity: 1, transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 }, { rotate: '0deg' }] },
            100: { opacity: 0, transform: [{ translateX: p.dx }, { translateY: p.dy }, { scale: 0.2 }, { rotate: '200deg' }], easing: EASE_BURST },
          }).duration(p.dur)}
          style={{ position: 'absolute', left: -p.sz / 2, top: -p.sz / 2, width: p.sz, height: p.sz }}
        >
          <View style={{ flex: 1, borderRadius: p.round ? p.sz : 2, backgroundColor: p.white ? '#F3F1EC' : color, opacity: 0 }} />
        </Animated.View>
      ))}
      <Animated.View
        entering={new Keyframe({ 0: { opacity: 0.9, transform: [{ scale: 0.3 }] }, 100: { opacity: 0, transform: [{ scale: 2.6 }], easing: Easing.out(Easing.ease) } }).duration(650)}
        style={{ position: 'absolute', left: -90, top: -90, width: 180, height: 180 }}
      >
        <View style={{ flex: 1, borderRadius: 90, borderWidth: 3, borderColor: color, opacity: 0 }} />
      </Animated.View>
    </Animated.View>
  );
}
