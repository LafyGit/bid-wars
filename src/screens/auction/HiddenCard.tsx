import React, { useEffect } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { topicLabel } from '../../content/topics';
import { useGame } from '../../store/GameContext';
import { colors, radii } from '../../theme/tokens';
import { CTA } from '../../ui/Btn';
import { EASE_FLIP, Enter, Float, Pulse } from '../../ui/Motion';
import { Row } from '../../ui/Screen';
import { Body, Display, FitText, Mono, itemSize } from '../../ui/Txt';

/** Faint 135° stripe texture for the hidden face. */
function Stripes() {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: -200, top: -200, right: -200, bottom: -200, transform: [{ rotate: '-45deg' }] }}>
      {Array.from({ length: 60 }, (_, i) => <View key={i} style={{ position: 'absolute', left: 0, right: 0, top: i * 24, height: 12, backgroundColor: 'rgba(243,241,236,0.025)' }} />)}
    </View>
  );
}

/**
 * Screens 08/09: the hidden card and its 3D flip. The item name is not rendered until the flip begins.
 */
export function HiddenCard() {
  const g = useGame();
  const r = g.state.round!;
  const { width } = useWindowDimensions();
  const [boxH, setBoxH] = React.useState(0);
  const accent = g.topic.accent;
  const flipped = r.phase !== 'hidden';
  const rot = useSharedValue(flipped ? 180 : 0);
  useEffect(() => {
    rot.value = g.rm ? (flipped ? 180 : 0) : withTiming(flipped ? 180 : 0, { duration: 560, easing: EASE_FLIP });
  }, [flipped, g.rm, rot]);
  const back = useAnimatedStyle(() => ({ transform: [{ perspective: 1400 }, { rotateY: `${rot.value}deg` }] }));
  const front = useAnimatedStyle(() => ({ transform: [{ perspective: 1400 }, { rotateY: `${rot.value + 180}deg` }] }));

  const item = r.items[r.idx];
  const last = r.idx === 9;
  const no = String(r.idx + 1).padStart(2, '0');
  const face = { position: 'absolute' as const, left: 0, top: 0, right: 0, bottom: 0, borderRadius: radii.cardLg, overflow: 'hidden' as const, backfaceVisibility: 'hidden' as const };

  return (
    <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 18 }}>
      <Enter kind="in" style={{ flex: 1 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={flipped ? `Item ${r.idx + 1}: ${item}` : `Hidden item ${r.idx + 1}. Tap to reveal`}
          disabled={flipped}
          onPress={g.tapCard}
          style={{ flex: 1 }}
        >
          <Animated.View style={[face, back, { backgroundColor: colors.surfaceAlt, borderWidth: 1.5, borderColor: colors.line10, alignItems: 'center', justifyContent: 'center' }]}>
            <Stripes />
            <Row justify="space-between" style={{ position: 'absolute', top: 22, left: 24, right: 24 }}>
              <Mono color={colors.ink4}>NO. {no}</Mono>
              <Mono color={colors.ink4}>{last ? 'LAST CHANCE' : 'HIDDEN'}</Mono>
            </Row>
            <Float><Display size={190} color={accent} ls={0} lh={1} upper={false}>?</Display></Float>
            <Display size={24} ls={0.02} lh={1.1}>{last ? 'FINAL ITEM' : 'NEXT ITEM'}</Display>
            <Pulse period={1800} style={{ marginTop: 22, height: 44, paddingHorizontal: 20, borderRadius: 22, backgroundColor: 'rgba(243,241,236,0.08)', justifyContent: 'center' }}>
              <Mono size={12} color={colors.ink2}>TAP TO REVEAL</Mono>
            </Pulse>
          </Animated.View>
          <Animated.View style={[face, front, { backgroundColor: accent, padding: 24 }]}>
            {flipped && (
              <>
                <Row justify="space-between">
                  <Mono color={colors.bg}>NO. {no}</Mono>
                  <Mono color={colors.bg}>{topicLabel(g.topic)}</Mono>
                </Row>
                <View style={{ flex: 1, justifyContent: 'center' }} onLayout={(e) => setBoxH(e.nativeEvent.layout.height)}>
                  <FitText text={item} size={itemSize(item, width - 100)} minSize={18} maxLines={6} maxHeight={boxH ? boxH - 8 : undefined} wdth={75} color={colors.bg} ls={-0.01} lh={1} />
                </View>
                <Row justify="space-between" align="flex-end">
                  <Mono color={colors.bg}>UP FOR AUCTION</Mono>
                  <Display size={40} color={colors.bg} ls={0} lh={0.9} upper={false}>$?</Display>
                </Row>
              </>
            )}
          </Animated.View>
        </Pressable>
      </Enter>
      <View style={{ height: 118, justifyContent: 'center' }}>
        {r.phase === 'hidden' && <Body size={14} color={colors.ink4} align="center">Nobody knows what’s under here. Not even the app’s owner.</Body>}
        {r.phase === 'item' && (
          <Enter kind="in" delay={380} duration={300} style={{ gap: 8 }}>
            <CTA label="START BIDDING" size={18} onPress={g.startBidding} />
            <Mono color={colors.ink4} ls={0.12} align="center">{g.names[r.opener]} OPENS THE BIDDING</Mono>
          </Enter>
        )}
      </View>
    </View>
  );
}
