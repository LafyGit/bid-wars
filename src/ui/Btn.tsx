import React from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii } from '../theme/tokens';
import { Display, Mono } from './Txt';

type Common = Omit<PressableProps, 'style' | 'children'> & { style?: StyleProp<ViewStyle>; label: string };

/** Filled primary CTA. 64–68pt, radius 20, expanded 900 text on dark ink. */
export function CTA({ label, bg = colors.ink, color = colors.bg, height = 64, size = 19, style, ...rest }: Common & { bg?: string; color?: string; height?: number; size?: number }) {
  return (
    <Pressable
      accessibilityRole="button"
      {...rest}
      style={({ pressed }) => [
        { height, borderRadius: radii.cta, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, transform: [{ scale: pressed ? 0.97 : 1 }] },
        style,
      ]}
    >
      <Display size={size} color={color} ls={0.01} lh={1.1} numberOfLines={1}>{label}</Display>
    </Pressable>
  );
}

/** Outline secondary button. 54–58pt, radius 18. */
export function Outline({ label, height = 56, size = 14, style, ...rest }: Common & { height?: number; size?: number }) {
  return (
    <Pressable
      accessibilityRole="button"
      {...rest}
      style={({ pressed }) => [
        { height, borderRadius: radii.secondary, borderWidth: 1, borderColor: colors.line16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, transform: [{ scale: pressed ? 0.97 : 1 }] },
        style,
      ]}
    >
      <Display size={size} weight={800} ls={0} lh={1.1} numberOfLines={1} adjustsFontSizeToFit>{label}</Display>
    </Pressable>
  );
}

/** Mono text link ("← BACK", "SPIN AGAIN", "HOME"). 44pt tall. */
export function TextLink({ label, color = colors.ink2, height = 44, align = 'flex-start', size = 12, style, ...rest }: Common & { color?: string; height?: number; align?: ViewStyle['alignSelf']; size?: number }) {
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={6}
      {...rest}
      style={({ pressed }) => [{ height, alignSelf: align, justifyContent: 'center', paddingHorizontal: 4, opacity: pressed ? 0.6 : 1 }, style]}
    >
      <Mono size={size} color={color} ls={0.12}>{label}</Mono>
    </Pressable>
  );
}

/** Outline pill chip (SOUND ON / SETTINGS, $0 / ALL IN). */
export function Chip({ label, height = 44, radius = radii.pill, color = colors.ink2, borderColor = colors.line14, style, ...rest }: Common & { height?: number; radius?: number; color?: string; borderColor?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      {...rest}
      style={({ pressed }) => [
        { height, paddingHorizontal: 16, borderRadius: radius, borderWidth: 1, borderColor, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 },
        style,
      ]}
    >
      <Mono size={11} color={color} ls={0.12} numberOfLines={1}>{label}</Mono>
    </Pressable>
  );
}

/** Round stepper (− / +). 80pt in pass mode, 64pt in table mode. */
export function Stepper({ glyph, size = 80, disabled, label, ...rest }: Omit<PressableProps, 'style'> & { glyph: '−' | '+'; size?: number; disabled?: boolean; label: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      hitSlop={4}
      {...rest}
      style={({ pressed }) => ({
        width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center',
        backgroundColor: pressed ? colors.surfacePress : colors.surface2,
        opacity: disabled ? 0.3 : 1,
        transform: [{ scale: pressed ? 0.92 : 1 }],
      })}
    >
      <Display size={size / 2} weight={800} wdth={100} ls={0} lh={1.1} upper={false}>{glyph}</Display>
    </Pressable>
  );
}
