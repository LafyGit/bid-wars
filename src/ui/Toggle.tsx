import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors } from '../theme/tokens';
import { Body } from './Txt';
import { EASE_OUT_QUICK } from './Motion';

/** 52×32 toggle, 26pt knob. On = ink track + dark knob; off = #2A2B31 track + ink-4 knob. */
export function ToggleRow({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  const x = useSharedValue(value ? 23 : 3);
  useEffect(() => { x.value = withTiming(value ? 23 : 3, { duration: 200, easing: EASE_OUT_QUICK }); }, [value, x]);
  const knob = useAnimatedStyle(() => ({ left: x.value }));
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      accessibilityHint={sub}
      onPress={() => onChange(!value)}
      style={({ pressed }) => ({ height: 64, borderRadius: 18, backgroundColor: pressed ? colors.surfaceHover : colors.surface, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 })}
    >
      <View style={{ flex: 1 }}>
        <Body size={16} weight={700} color={colors.ink} lh={1.25}>{label}</Body>
        <Body size={12} color={colors.ink4} lh={1.3} style={{ marginTop: 2 }}>{sub}</Body>
      </View>
      <View style={{ width: 52, height: 32, borderRadius: 16, backgroundColor: value ? colors.ink : colors.surfacePress }}>
        <Animated.View style={[{ position: 'absolute', top: 3, width: 26, height: 26, borderRadius: 13, backgroundColor: value ? colors.bg : colors.ink4 }, knob]} />
      </View>
    </Pressable>
  );
}
