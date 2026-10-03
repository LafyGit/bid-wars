import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { categoryById, groupOfCategory } from '../content/topics';
import { decideCopy } from '../content/decide';
import { DecideCard, DecideSheet } from '../ui/DecideSheet';
import { pickTopicId } from '../game/pick';
import { useGame } from '../store/GameContext';
import { colors, layout, withAlpha } from '../theme/tokens';
import { TextLink } from '../ui/Btn';
import { Enter } from '../ui/Motion';
import { Screen, useScreenInsets } from '../ui/Screen';
import { Body, Display, Mono } from '../ui/Txt';

/** Subtopics of one category. A "surprise me" row picks one at random from this category. */
export function Subtopics() {
  const g = useGame();
  const p = useScreenInsets();
  const c = categoryById(g.state.categoryId);
  const group = groupOfCategory(c.id);
  const surprise = () => g.chooseTopic(pickTopicId(c.topics.map((t) => t.id), g.state.recentTopics));
  const copy = decideCopy(c.id);
  const [deciding, setDeciding] = useState(false);
  return (
    <Screen padX={false} padBottom={false}>
      <View style={{ paddingHorizontal: layout.padX }}>
        <TextLink label={`← ${group.title.toUpperCase()}`} onPress={() => g.openGroup(group.id)} />
        <Mono color={c.accent} style={{ marginTop: 10 }}>{c.title}</Mono>
        <Display size={34} lh={0.92} style={{ marginTop: 4 }}>PICK A LANE</Display>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: layout.padX, paddingTop: 16, paddingBottom: p.bottom, gap: 8 }} showsVerticalScrollIndicator={false}>
        <Enter kind="in" duration={320}>
          <Pressable accessibilityRole="button" onPress={surprise} style={({ pressed }) => ({ padding: 16, borderRadius: 20, backgroundColor: c.accent, flexDirection: 'row', alignItems: 'center', gap: 12, transform: [{ scale: pressed ? 0.98 : 1 }] })}>
            <Display size={30} color={colors.bg} ls={0} lh={1.1}>?</Display>
            <View style={{ flex: 1 }}>
              <Display size={18} wdth={112} color={colors.bg} upper={false} ls={0} lh={1.1}>Surprise me</Display>
              <Body size={12} color={withAlpha(colors.bg, 0.75)}>Any {c.title} pack</Body>
            </View>
          </Pressable>
        </Enter>
        {copy && (
          <Enter kind="in" delay={40} duration={320}><DecideCard copy={copy} accent={c.accent} onPress={() => setDeciding(true)} /></Enter>
        )}
        {c.topics.map((t, i) => (
          <Enter key={t.id} kind="in" delay={50 + i * 40} duration={320}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${t.title}. ${t.subtitle}`}
              onPress={() => g.chooseTopic(t.id)}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 20, backgroundColor: pressed ? '#1C1D22' : colors.surface })}
            >
              <View style={{ width: 10, height: 44, borderRadius: 5, backgroundColor: c.accent }} />
              <View style={{ flex: 1 }}>
                <Display size={18} wdth={112} upper={false} ls={0} lh={1.1}>{t.title}</Display>
                <Body size={13} color={colors.ink3} style={{ marginTop: 2 }}>{t.subtitle}</Body>
              </View>
              <Mono size={10} ls={0.1} lh={1.5} align="right">PLAY →</Mono>
            </Pressable>
          </Enter>
        ))}
      </ScrollView>
      {deciding && copy && <DecideSheet copy={copy} accent={c.accent} pool={c.topics.map((t) => ({ title: t.title, items: t.items }))} onClose={() => setDeciding(false)} />}
    </Screen>
  );
}
