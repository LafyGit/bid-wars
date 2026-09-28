import React from 'react';
import { Platform, View } from 'react-native';
import Animated, { FadeIn, Keyframe, Easing } from 'react-native-reanimated';
import { TOPICS } from '../content/topics';
import { useGame } from '../store/GameContext';
import { colors, tint } from '../theme/tokens';
import { CTA, TextLink } from '../ui/Btn';
import { Enter } from '../ui/Motion';
import { Screen } from '../ui/Screen';
import { Display, Mono } from '../ui/Txt';

export function TopicReveal() {
  const g = useGame();
  const { idx, landed } = g.state.reveal;
  const t = TOPICS[idx] ?? TOPICS[0];
  const title = t.categoryTitle;
  const size = Math.min(76, Math.floor(330 / (title.length * 0.86)));
  const ring = new Keyframe({ 0: { opacity: 0.9, transform: [{ scale: 0.3 }] }, 100: { opacity: 0, transform: [{ scale: 2.6 }], easing: Easing.out(Easing.ease) } }).duration(700);
  return (
    <Screen>
      {landed && <Animated.View pointerEvents="none" entering={FadeIn.duration(500)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: tint(t.accent, 0.14) }} />}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Enter kind="fade"><Mono size={12} color={colors.ink2} ls={0.2}>TONIGHT’S CATEGORY</Mono></Enter>
        <View style={{ marginTop: 22, height: 124, alignItems: 'center', justifyContent: 'center' }}>
          <Display size={size} ls={-0.04} lh={0.9} align="center" color={landed ? t.accent : colors.ink} numberOfLines={1} adjustsFontSizeToFit accessibilityLiveRegion="polite">{title}</Display>
        </View>
        {landed && !g.rm && Platform.OS !== 'web' && (
          <Animated.View pointerEvents="none" entering={ring} style={{ position: 'absolute', width: 260, height: 260 }}>
            <View style={{ flex: 1, borderRadius: 130, borderWidth: 3, borderColor: t.accent, opacity: 0 }} />
          </Animated.View>
        )}
        {landed && (
          <Enter kind="pop"><Display size={22} wdth={110} weight={800} ls={0.04} lh={1.2} align="center">{t.title}</Display></Enter>
        )}
      </View>
      {landed && (
        <Enter kind="in" delay={200} duration={360} style={{ gap: 10 }}>
          <CTA label="LET’S GO" bg={t.accent} onPress={() => g.go('intro')} />
          <TextLink label="SPIN AGAIN" height={48} align="center" onPress={g.startRandom} />
        </Enter>
      )}
    </Screen>
  );
}
