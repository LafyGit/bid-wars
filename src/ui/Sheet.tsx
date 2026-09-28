import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii } from '../theme/tokens';
import { useEnter } from './Motion';

/** Bottom sheet with a 60% scrim. Slides up in ~300ms. */
export function Sheet({ children, onClose, scrim = colors.scrim60, style, duration = 300 }: { children: React.ReactNode; onClose: () => void; scrim?: string; style?: StyleProp<ViewStyle>; duration?: number }) {
  const enter = useEnter();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 40, justifyContent: 'flex-end' }}>
      <Animated.View entering={enter('fade', 0, 200)} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: scrim }}>
        <Pressable accessibilityLabel="Close" onPress={onClose} style={{ flex: 1 }} />
      </Animated.View>
      <Animated.View entering={enter('up', 0, duration)} style={[{ backgroundColor: colors.surfaceAlt, borderTopLeftRadius: radii.sheet, borderTopRightRadius: radii.sheet, paddingTop: 14, paddingHorizontal: 22, paddingBottom: Math.max(insets.bottom, 24) + 16 }, style]}>
        <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: colors.ink6, alignSelf: 'center', marginBottom: 16 }} />
        {children}
      </Animated.View>
    </View>
  );
}
