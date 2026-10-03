import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { groupById, topicsInGroup } from '../content/topics';
import { categoryUnlocked } from '../store/entitlements';
import { useGame } from '../store/GameContext';
import { colors, layout } from '../theme/tokens';
import { TextLink } from '../ui/Btn';
import { Enter } from '../ui/Motion';
import { Screen, useScreenInsets } from '../ui/Screen';
import { Body, Display, Mono } from '../ui/Txt';

/** One group (Gaming, Sports & Cars, ...) and the categories inside it. */
export function Group() {
  const g = useGame();
  const p = useScreenInsets();
  const group = groupById(g.state.groupId);
  const owned = g.state.owned;
  const all = topicsInGroup(group).filter((t) => categoryUnlocked(t.categoryId, owned));
  const lockedCount = group.categories.filter((c) => !categoryUnlocked(c.id, owned)).length;
  const surprise = () => (all.length ? g.chooseTopic(all[Math.floor(Math.random() * all.length)].id) : g.openPaywall(group.id));
  return (
    <Screen padX={false} padBottom={false}>
      <View style={{ paddingHorizontal: layout.padX }}>
        <TextLink label="← TOPICS" onPress={() => g.go('topics')} />
        <Mono color={group.accent} style={{ marginTop: 10 }}>{group.categories.length} CATEGORIES · {group.topicCount} PACKS</Mono>
        <Display size={34} lh={1} numberOfLines={1} adjustsFontSizeToFit style={{ marginTop: 4 }}>{group.title}</Display>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: layout.padX, paddingTop: 16, paddingBottom: p.bottom, gap: 8 }} showsVerticalScrollIndicator={false}>
        <Enter kind="in" duration={320}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Surprise me with any ${group.title} pack`} onPress={surprise} style={({ pressed }) => ({ padding: 16, borderRadius: 20, backgroundColor: group.accent, flexDirection: 'row', alignItems: 'center', gap: 12, transform: [{ scale: pressed ? 0.98 : 1 }] })}>
            <Display size={30} color={colors.bg} ls={0} lh={1.1}>?</Display>
            <View style={{ flex: 1 }}>
              <Display size={18} wdth={112} color={colors.bg} upper={false} ls={0} lh={1.1}>Surprise me</Display>
              <Body size={12} color="rgba(14,15,18,0.75)">Any {group.title} pack</Body>
            </View>
          </Pressable>
        </Enter>
        {lockedCount > 0 && (
          <Pressable accessibilityRole="button" accessibilityLabel={`Unlock ${lockedCount} more categories`} onPress={() => g.openPaywall(group.id)} style={({ pressed }) => ({ padding: 14, borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed', borderColor: group.accent, opacity: pressed ? 0.7 : 1 })}>
            <Body size={14} weight={700} color={colors.ink}>{`Unlock ${lockedCount} more ${lockedCount === 1 ? 'category' : 'categories'}`}</Body>
            <Body size={12} color={colors.ink3}>See the {group.title} Pack and Bid Wars Pro</Body>
          </Pressable>
        )}
        {group.categories.map((c, i) => (
          <Enter key={c.id} kind="in" delay={50 + i * 40} duration={320}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${c.title}. ${c.subtitle}. ${c.topics.length} packs`}
              onPress={() => (categoryUnlocked(c.id, owned) ? g.openCategory(c.id) : g.openPaywall(group.id))}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 20, backgroundColor: pressed ? '#1C1D22' : colors.surface })}
            >
              <View style={{ width: 10, height: 44, borderRadius: 5, backgroundColor: c.accent }} />
              <View style={{ flex: 1 }}>
                <Display size={18} wdth={112} upper={false} ls={0} lh={1.1} numberOfLines={1}>{c.title}</Display>
                <Body size={13} color={colors.ink3} style={{ marginTop: 2 }} numberOfLines={1}>{c.subtitle}</Body>
              </View>
              {categoryUnlocked(c.id, owned)
                ? <Mono size={10} ls={0.1} lh={1.5} align="right">{`${c.topics.length} PACKS\n${c.free ? 'FREE →' : 'OPEN →'}`}</Mono>
                : <Mono size={10} color={group.accent} ls={0.1} lh={1.5} align="right">{`${c.topics.length} PACKS\nLOCKED`}</Mono>}
            </Pressable>
          </Enter>
        ))}
      </ScrollView>
    </Screen>
  );
}
