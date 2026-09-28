import React from 'react';
import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, layout } from '../theme/tokens';

/** Safe-area padding used by every screen: top = inset + 8, bottom = 38 (or inset + 4). */
export function useScreenInsets() {
  const insets = useSafeAreaInsets();
  return {
    top: insets.top + layout.topExtra,
    bottom: insets.bottom > 0 ? insets.bottom + 4 : layout.padBottom - 10,
    left: insets.left,
    right: insets.right,
  };
}

/**
 * Full-bleed screen container. `padX` false leaves horizontal padding to the children (for scrolling lists).
 */
export function Screen({ children, bg = colors.bg, padX = true, padBottom = true, style }: { children: React.ReactNode; bg?: string; padX?: boolean; padBottom?: boolean; style?: StyleProp<ViewStyle> }) {
  const p = useScreenInsets();
  return (
    <View style={[{ flex: 1, backgroundColor: bg, paddingTop: p.top, paddingBottom: padBottom ? p.bottom : 0, paddingHorizontal: padX ? layout.padX : 0 }, style]}>
      {children}
    </View>
  );
}

export const Row = ({ children, style, gap, align = 'center', justify, ...rest }: ViewProps & { children: React.ReactNode; style?: StyleProp<ViewStyle>; gap?: number; align?: ViewStyle['alignItems']; justify?: ViewStyle['justifyContent'] }) => (
  <View {...rest} style={[{ flexDirection: 'row', alignItems: align, justifyContent: justify, gap }, style]}>{children}</View>
);

export const Spacer = ({ h = 0, flex }: { h?: number; flex?: boolean }) => <View style={{ height: h, flex: flex ? 1 : undefined }} />;
