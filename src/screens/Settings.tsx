import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { judgeAvailable } from '../ai/judge';
import { ownsPro } from '../store/entitlements';
import { useGame } from '../store/GameContext';
import { colors } from '../theme/tokens';
import { TextLink } from '../ui/Btn';
import { Screen } from '../ui/Screen';
import { ToggleRow } from '../ui/Toggle';
import { Body, Display, FitText } from '../ui/Txt';

function RowBtn({ label, right, color = colors.ink, onPress, hint }: { label: string; right: string; color?: string; onPress: () => void; hint?: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityHint={hint} onPress={onPress} style={({ pressed }) => ({ height: 60, borderRadius: 18, backgroundColor: pressed ? colors.surfaceHover : colors.surface, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 })}>
      <Body size={16} weight={700} color={color}>{label}</Body>
      <View style={{ flexShrink: 1 }}><FitText kind="body" text={right} size={14} minSize={10} maxLines={2} color={colors.ink4} align="right" /></View>
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
        <ToggleRow label="3-second rule" sub="Going once, going twice, sold. Raise within 3 seconds or lose it" value={s.threeSecondRule} onChange={(v) => g.setSetting('threeSecondRule', v)} />
        <ToggleRow label="Judge's verdict" sub={judgeAvailable() ? 'Claude weighs in on the final collections' : 'A quick opinion on who built the better collection'} value={s.aiJudge} onChange={(v) => g.setSetting('aiJudge', v)} />
        <ToggleRow label="Sound" sub="Reveal, bid, going-once and win cues" value={s.sound} onChange={(v) => g.setSetting('sound', v)} />
        <ToggleRow label="Haptics" sub="Subtle taps on bids, passes and wins" value={s.haptics} onChange={(v) => g.setSetting('haptics', v)} />
        <ToggleRow label="Reduced motion" sub="Skips flips, bursts and the topic spin" value={s.reducedMotion} onChange={(v) => g.setSetting('reducedMotion', v)} />
        <RowBtn label={ownsPro(g.state.owned) ? 'Bid Wars Pro' : 'Unlock more topics'} right={ownsPro(g.state.owned) ? 'Unlocked ✓' : 'See what is inside →'} onPress={() => g.openPaywall(null)} />
        <RowBtn label="Restore purchases" right="Already bought? →" onPress={() => { g.restorePurchases(); g.openPaywall(null); }} />
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
          <Body size={13} color={colors.ink3} lh={1.5} style={{ marginTop: 4 }}>Bid Wars. A two-player open auction party game. All money is fake. All regret is real.</Body>
        </View>
      </ScrollView>
    </Screen>
  );
}
