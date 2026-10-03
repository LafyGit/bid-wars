import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { GROUPS } from '../content/topics';
import { categoryUnlocked } from '../store/entitlements';
import { useGame } from '../store/GameContext';
import { colors, layout } from '../theme/tokens';
import { TextLink } from '../ui/Btn';
import { Enter } from '../ui/Motion';
import { Screen, useScreenInsets } from '../ui/Screen';
import { Body, Display, Mono, FitText } from '../ui/Txt';

/** Screen 05: RANDOM hero, then the big categories. Tapping one opens its subtopics. */
export function Topics() {
  const g = useGame();
  const p = useScreenInsets();
  return (
    <Screen padX={false} padBottom={false}>
      <View style={{ paddingHorizontal: layout.padX }}>
        <TextLink label="← PLAYERS" onPress={g.openSetup} />
        <Display size={36} style={{ marginTop: 10 }}>{'CHOOSE YOUR\nBATTLE'}</Display>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: layout.padX, paddingTop: 20, paddingBottom: p.bottom, gap: 12 }} showsVerticalScrollIndicator={false}>
        <Enter kind="in" duration={360}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Random topic. Let the phone pick tonight's category."
            onPress={g.startRandom}
            style={({ pressed }) => ({ height: 140, borderRadius: 24, backgroundColor: colors.ink, padding: 20, justifyContent: 'space-between', overflow: 'hidden', transform: [{ scale: pressed ? 0.98 : 1 }] })}
          >
            <Display size={200} color="rgba(14,15,18,0.08)" lh={1} ls={0} style={{ position: 'absolute', right: -14, top: -30 }}>?</Display>
            <Mono color={colors.bg}>FASTEST START</Mono>
            <View>
              <Display size={40} color={colors.bg} lh={0.9}>RANDOM</Display>
              <Body size={14} color={colors.ink6} style={{ marginTop: 4 }}>Any topic, any subtopic. No arguing.</Body>
            </View>
          </Pressable>
        </Enter>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {GROUPS.map((gr, i) => (
            <Enter key={gr.id} kind="in" delay={60 + i * 45} duration={360} style={{ width: '48%', flexGrow: 1 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${gr.title}. ${gr.subtitle}`}
                onPress={() => g.openGroup(gr.id)}
                style={({ pressed }) => ({ height: 172, borderRadius: 22, backgroundColor: pressed ? '#1C1D22' : colors.surfaceAlt, padding: 16, justifyContent: 'flex-end', overflow: 'hidden', transform: [{ scale: pressed ? 0.97 : 1 }] })}
              >
                <View style={{ position: 'absolute', right: -30, top: -30, width: 88, height: 88, borderRadius: 44, backgroundColor: gr.accent }} />
                <FitText text={gr.title} size={19} minSize={13} maxLines={2} wdth={112} upper={false} ls={-0.01} lh={1.1} />
                <View style={{ marginTop: 3 }}><FitText kind="body" text={gr.subtitle} size={12} minSize={9} maxLines={3} color={colors.ink3} lh={1.3} /></View>
                <Mono size={10} color={gr.accent} ls={0.12} style={{ marginTop: 8 }}>{gr.categories.some((c) => !categoryUnlocked(c.id, g.state.owned)) ? 'MORE TO UNLOCK' : 'ALL UNLOCKED'}</Mono>
              </Pressable>
            </Enter>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
