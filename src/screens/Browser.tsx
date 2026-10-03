import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { COMING_SOON, GROUPS } from '../content/topics';
import { categoryUnlocked } from '../store/entitlements';
import { useGame } from '../store/GameContext';
import { colors, layout } from '../theme/tokens';
import { TextLink } from '../ui/Btn';
import { Enter } from '../ui/Motion';
import { Screen, useScreenInsets } from '../ui/Screen';
import { Body, Display, Mono, FitText } from '../ui/Txt';

/** Topic packs browser: categories expand into subtopics. Never lists the items. */
export function Browser() {
  const g = useGame();
  const p = useScreenInsets();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <Screen padX={false} padBottom={false}>
      <View style={{ paddingHorizontal: layout.padX }}>
        <TextLink label="← BACK" onPress={() => g.go('home')} />
        <Display size={36} style={{ marginTop: 10 }}>TOPIC PACKS</Display>
        <Body size={14} color={colors.ink3} style={{ marginTop: 8 }}>Items stay secret until they're up for auction.</Body>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: layout.padX, paddingTop: 18, paddingBottom: p.bottom, gap: 8 }} showsVerticalScrollIndicator={false}>
        {GROUPS.map((gr, i) => {
          const isOpen = open === gr.id;
          return (
            <Enter key={gr.id} kind="in" delay={40 + i * 30} duration={320}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
                onPress={() => setOpen(isOpen ? null : gr.id)}
                style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 20, backgroundColor: pressed ? '#1C1D22' : colors.surface })}
              >
                <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: gr.accent, alignItems: 'center', justifyContent: 'center' }}>
                  <Display size={20} color={colors.bg} ls={0} lh={1.1}>?</Display>
                </View>
                <View style={{ flex: 1 }}>
                  <FitText text={gr.title} size={18} minSize={12} maxLines={2} wdth={112} upper={false} ls={0} lh={1.1} />
                  <Body size={13} color={colors.ink3} style={{ marginTop: 2 }}>{gr.subtitle}</Body>
                </View>
                <Mono size={10} ls={0.1} lh={1.5} align="right">{isOpen ? '▲' : '▼'}</Mono>
              </Pressable>
              {isOpen && (
                <View style={{ paddingLeft: 16, paddingTop: 6, gap: 4 }}>
                  {gr.categories.map((c) => (
                    <View key={c.id} style={{ gap: 4, marginBottom: 6 }}>
                      <Mono color={c.accent} style={{ marginTop: 6, marginLeft: 6 }}>{c.title}</Mono>
                      {c.topics.map((t) => (
                        <Pressable key={t.id} accessibilityRole="button" onPress={() => g.chooseTopic(t.id)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, backgroundColor: pressed ? '#1C1D22' : colors.surfaceAlt })}>
                          <View style={{ width: 6, height: 26, borderRadius: 3, backgroundColor: c.accent }} />
                          <View style={{ flex: 1 }}>
                            <FitText kind="body" text={t.title} size={15} minSize={11} maxLines={2} weight={700} color={colors.ink} />
                            <Body size={12} color={colors.ink4}>{t.subtitle}</Body>
                          </View>
                          <Mono size={10} ls={0.1} color={categoryUnlocked(c.id, g.state.owned) ? colors.ink3 : gr.accent}>{categoryUnlocked(c.id, g.state.owned) ? 'PLAY →' : 'LOCKED'}</Mono>
                        </Pressable>
                      ))}
                    </View>
                  ))}
                </View>
              )}
            </Enter>
          );
        })}
        <Mono color={colors.ink4} style={{ marginTop: 18 }}>COMING SOON</Mono>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {COMING_SOON.map((x) => (
            <View key={x} accessibilityLabel={`${x}, coming soon`} style={{ paddingHorizontal: 13, paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: colors.line12 }}>
              <Body size={13} weight={600} color={colors.ink3} lh={1.2}>{x}</Body>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
