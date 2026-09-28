import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useGame } from '../store/GameContext';
import { colors } from '../theme/tokens';
import { TextLink } from '../ui/Btn';
import { Screen } from '../ui/Screen';
import { ToggleRow } from '../ui/Toggle';
import { Body, Display } from '../ui/Txt';

function Seg({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={onPress} style={{ flex: 1, height: 44, borderRadius: 11, backgroundColor: on ? colors.ink : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
      <Body size={13} weight={700} color={on ? colors.bg : colors.ink3}>{label}</Body>
    </Pressable>
  );
}

function RowBtn({ label, right, color = colors.ink, onPress, hint }: { label: string; right: string; color?: string; onPress: () => void; hint?: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityHint={hint} onPress={onPress} style={({ pressed }) => ({ height: 60, borderRadius: 18, backgroundColor: pressed ? colors.surfaceHover : colors.surface, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 })}>
      <Body size={16} weight={700} color={color}>{label}</Body>
      <Body size={14} color={colors.ink4} numberOfLines={1} style={{ flexShrink: 1 }}>{right}</Body>
    </Pressable>
  );
}

export function Settings() {
  const g = useGame();
  const s = g.state.settings;
  const [n1, n2] = g.names;
  const scoreText = `${n1} ${g.state.score[0]} – ${g.state.score[1]} ${n2}`;
  return (
    <Screen>
      <TextLink label="← BACK" onPress={() => g.go(g.state.back === 'auction' && g.state.round ? 'auction' : 'home')} />
      <Display size={36} style={{ marginTop: 10 }}>SETTINGS</Display>
      <ScrollView style={{ flex: 1, marginTop: 18 }} contentContainerStyle={{ gap: 8, paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
        <ToggleRow label="Sound" sub="Reveal, lock, countdown and win cues" value={s.sound} onChange={(v) => g.setSetting('sound', v)} />
        <ToggleRow label="Haptics" sub="Subtle taps on bids, locks and wins" value={s.haptics} onChange={(v) => g.setSetting('haptics', v)} />
        <ToggleRow label="Reduced motion" sub="Skips countdowns, flips and bursts" value={s.reducedMotion} onChange={(v) => g.setSetting('reducedMotion', v)} />
        <View style={{ paddingHorizontal: 16, paddingVertical: 14, borderRadius: 18, backgroundColor: colors.surface }}>
          <Body size={16} weight={700} color={colors.ink}>Bid privacy</Body>
          <Body size={12} color={colors.ink4} style={{ marginTop: 2 }}>How you hide bids on one phone</Body>
          <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', gap: 6, marginTop: 12, padding: 4, borderRadius: 14, backgroundColor: colors.bg }}>
            <Seg label="Pass the phone" on={s.privacy === 'pass'} onPress={() => g.setSetting('privacy', 'pass')} />
            <Seg label="Table mode" on={s.privacy === 'table'} onPress={() => g.setSetting('privacy', 'table')} />
          </View>
        </View>
        <RowBtn label="Change player names" right={`${n1} & ${n2} →`} onPress={g.openSetup} />
        <RowBtn
          label={g.state.confirmReset ? 'Tap again to reset' : 'Reset match score'}
          color={g.state.confirmReset ? colors.danger : colors.ink}
          right={scoreText}
          hint="Tap twice to clear the match score and session stats"
          onPress={g.resetScore}
        />
        <View style={{ paddingHorizontal: 16, paddingVertical: 14, borderRadius: 18, backgroundColor: colors.surface }}>
          <Body size={16} weight={700} color={colors.ink}>About</Body>
          <Body size={13} color={colors.ink3} lh={1.5} style={{ marginTop: 4 }}>Bid Wars v1.0. A two-player blind auction party game. All money is fake. All regret is real.</Body>
        </View>
      </ScrollView>
    </Screen>
  );
}
