import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { CUSTOM_ACCENT } from '../content/custom';
import { canAddCustomPack, ownsPro } from '../store/entitlements';
import { useGame } from '../store/GameContext';
import { colors, layout, withAlpha } from '../theme/tokens';
import { TextLink } from '../ui/Btn';
import { Enter } from '../ui/Motion';
import { Screen, useScreenInsets } from '../ui/Screen';
import { Body, Display, FitText, Mono } from '../ui/Txt';

/** The players' own packs: make one, play one, edit one. */
export function Packs() {
  const g = useGame();
  const p = useScreenInsets();
  const packs = g.state.custom;
  const full = !canAddCustomPack(g.state.owned, packs.length);
  const pro = ownsPro(g.state.owned);
  return (
    <Screen padX={false} padBottom={false}>
      <View style={{ paddingHorizontal: layout.padX }}>
        <TextLink label="← TOPICS" onPress={g.back} />
        <Mono color={CUSTOM_ACCENT} style={{ marginTop: 10 }}>MADE BY YOU</Mono>
        <Display size={34} lh={0.92} style={{ marginTop: 4 }}>YOUR PACKS</Display>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: layout.padX, paddingTop: 16, paddingBottom: p.bottom, gap: 8 }} showsVerticalScrollIndicator={false}>
        <Enter kind="in" duration={320}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={full ? 'New pack. Needs Outbid Pro' : 'Make a new pack'}
            onPress={g.newPack}
            style={({ pressed }) => ({ padding: 16, borderRadius: 20, backgroundColor: CUSTOM_ACCENT, flexDirection: 'row', alignItems: 'center', gap: 12, transform: [{ scale: pressed ? 0.98 : 1 }] })}
          >
            <Display size={30} color={colors.bg} ls={0} lh={1.1}>+</Display>
            <View style={{ flex: 1 }}>
              <Display size={18} wdth={112} color={colors.bg} upper={false} ls={0} lh={1.1}>New pack</Display>
              <Body size={12} color={withAlpha(colors.bg, 0.75)}>{full ? 'Pro makes as many as you like' : 'Your friends, your jokes, your city'}</Body>
            </View>
            {full && <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 7, backgroundColor: withAlpha(colors.bg, 0.18) }}><Mono size={9} color={colors.bg} ls={0.12}>PRO</Mono></View>}
          </Pressable>
        </Enter>
        {packs.length === 0 && (
          <Enter kind="in" delay={60} duration={320} style={{ padding: 16, borderRadius: 20, backgroundColor: colors.surface, gap: 6 }}>
            <Body size={15} weight={700} color={colors.ink}>Type ten or more things, best first.</Body>
            <Body size={13} color={colors.ink3}>Inside jokes, your group chat, the best kebab spots in town. Each round draws ten of them at random, and the built-in judge ranks your list from the top.</Body>
          </Enter>
        )}
        {packs.map((pack, i) => (
          <Enter key={pack.id} kind="in" delay={50 + i * 40} duration={320} style={{ flexDirection: 'row', alignItems: 'stretch', borderRadius: 20, backgroundColor: colors.surface, overflow: 'hidden' }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Play ${pack.title}. ${pack.items.length} items`}
              onPress={() => g.chooseTopic(pack.id)}
              style={({ pressed }) => ({ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, backgroundColor: pressed ? colors.surfaceHover : 'transparent' })}
            >
              <View style={{ width: 10, height: 44, borderRadius: 5, backgroundColor: pack.accent }} />
              <View style={{ flex: 1 }}>
                <FitText text={pack.title} size={18} minSize={12} maxLines={2} wdth={112} upper={false} ls={0} lh={1.1} />
                <Body size={13} color={colors.ink3} style={{ marginTop: 2 }}>{pack.items.length} items</Body>
              </View>
              <Mono size={10} ls={0.1} lh={1.5}>PLAY →</Mono>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Edit ${pack.title}`}
              onPress={() => g.editPack(pack.id)}
              style={({ pressed }) => ({ justifyContent: 'center', paddingHorizontal: 16, borderLeftWidth: 1, borderLeftColor: colors.line07, backgroundColor: pressed ? colors.surfaceHover : 'transparent' })}
            >
              <Mono size={10} ls={0.1} color={colors.ink3}>EDIT</Mono>
            </Pressable>
          </Enter>
        ))}
        {!pro && <Body size={12} color={colors.ink4} align="center" style={{ marginTop: 8 }}>One pack is free. Outbid Pro makes as many as you like.</Body>}
        <Body size={12} color={colors.ink5} align="center">Saved on this phone only.</Body>
      </ScrollView>
    </Screen>
  );
}
