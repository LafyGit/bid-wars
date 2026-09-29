import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { groupById, topicsInGroup } from '../content/topics';
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
  const all = topicsInGroup(group);
  const surprise = () => g.chooseTopic(all[Math.floor(Math.random() * all.length)].id);
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
        {group.categories.map((c, i) => (
          <Enter key={c.id} kind="in" delay={50 + i * 40} duration={320}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${c.title}. ${c.subtitle}. ${c.topics.length} packs`}
              onPress={() => g.openCategory(c.id)}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 20, backgroundColor: pressed ? '#1C1D22' : colors.surface })}
            >
              <View style={{ width: 10, height: 44, borderRadius: 5, backgroundColor: c.accent }} />
              <View style={{ flex: 1 }}>
                <Display size={18} wdth={112} upper={false} ls={0} lh={1.1} numberOfLines={1}>{c.title}</Display>
                <Body size={13} color={colors.ink3} style={{ marginTop: 2 }} numberOfLines={1}>{c.subtitle}</Body>
              </View>
              <Mono size={10} ls={0.1} lh={1.5} align="right">{`${c.topics.length} PACKS\nOPEN →`}</Mono>
            </Pressable>
          </Enter>
        ))}
      </ScrollView>
    </Screen>
  );
}
