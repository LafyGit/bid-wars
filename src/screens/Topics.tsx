import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { CUSTOM_ACCENT } from '../content/custom';
import { GROUPS, type Category } from '../content/topics';
import { categoryUnlocked } from '../store/entitlements';
import { useGame } from '../store/GameContext';
import { colors, layout, withAlpha } from '../theme/tokens';
import { TextLink } from '../ui/Btn';
import { Enter } from '../ui/Motion';
import { Screen, useScreenInsets } from '../ui/Screen';
import { Body, Display, Mono, FitText } from '../ui/Txt';

function CategoryTile({ c, delay }: { c: Category; delay: number }) {
  const g = useGame();
  const open = categoryUnlocked(c.id, g.state.owned);
  return (
    <Enter kind="in" delay={delay} duration={320} style={{ width: '48.5%' }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${c.title}. ${c.subtitle}${open ? '' : '. Pro pack'}`}
        onPress={() => (open ? g.openCategory(c.id) : g.openPaywall())}
        style={({ pressed }) => ({ flexGrow: 1, minHeight: 118, borderRadius: 20, backgroundColor: pressed ? colors.surfaceHover : colors.surface, padding: 14, justifyContent: 'space-between', gap: 10, overflow: 'hidden', transform: [{ scale: pressed ? 0.97 : 1 }] })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ width: 22, height: 6, borderRadius: 3, backgroundColor: c.accent }} />
          {!open && <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 7, backgroundColor: withAlpha(colors.p1, 0.16) }}><Mono size={9} color={colors.p1} ls={0.12}>PRO</Mono></View>}
        </View>
        <View>
          <FitText text={c.title} size={17} minSize={12} maxLines={2} wdth={112} upper={false} ls={0} lh={1.15} />
          <Body size={12} color={colors.ink4} lh={1.3} style={{ marginTop: 3 }}>{c.subtitle}</Body>
        </View>
      </Pressable>
    </Enter>
  );
}

/** Pick a battle: Random up top, then every category on one page, sectioned by group. */
export function Topics() {
  const g = useGame();
  const p = useScreenInsets();
  const packs = g.state.custom.length;
  let n = 0;
  return (
    <Screen padX={false} padBottom={false}>
      <View style={{ paddingHorizontal: layout.padX }}>
        <TextLink label="← PLAYERS" onPress={g.openSetup} />
        <Display size={36} style={{ marginTop: 10 }}>{'CHOOSE YOUR\nBATTLE'}</Display>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: layout.padX, paddingTop: 20, paddingBottom: p.bottom }} showsVerticalScrollIndicator={false}>
        <Enter kind="in" duration={360}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Random topic. Let the phone pick."
            onPress={g.startRandom}
            style={({ pressed }) => ({ height: 120, borderRadius: 24, backgroundColor: colors.ink, padding: 20, justifyContent: 'flex-end', overflow: 'hidden', transform: [{ scale: pressed ? 0.98 : 1 }] })}
          >
            <Display size={180} color="rgba(14,15,18,0.08)" lh={1} ls={0} style={{ position: 'absolute', right: -10, top: -28 }}>?</Display>
            <Display size={36} color={colors.bg} lh={1}>RANDOM</Display>
            <Body size={14} color={colors.ink6} style={{ marginTop: 4 }}>Let the phone pick. No arguing.</Body>
          </Pressable>
        </Enter>
        <Enter kind="in" delay={40} duration={360}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Your packs. ${packs ? `${packs} saved` : 'Make your own'}`}
            onPress={() => g.go('packs')}
            style={({ pressed }) => ({ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: withAlpha(CUSTOM_ACCENT, 0.5), backgroundColor: pressed ? colors.surfaceHover : colors.surface, transform: [{ scale: pressed ? 0.98 : 1 }] })}
          >
            <View style={{ width: 22, height: 6, borderRadius: 3, backgroundColor: CUSTOM_ACCENT }} />
            <View style={{ flex: 1 }}>
              <Display size={17} wdth={112} upper={false} ls={0} lh={1.15}>Your Packs</Display>
              <Body size={12} color={colors.ink4} lh={1.3}>{packs ? `${packs} saved · make, play, edit` : 'Make your own: friends, jokes, your city'}</Body>
            </View>
            <Mono size={10} ls={0.1} color={CUSTOM_ACCENT}>OPEN →</Mono>
          </Pressable>
        </Enter>
        {GROUPS.map((gr) => (
          <View key={gr.id} style={{ marginTop: 26 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: gr.accent }} />
              <Mono color={colors.ink2} ls={0.14}>{gr.title}</Mono>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 }}>
              {gr.categories.map((c) => <CategoryTile key={c.id} c={c} delay={Math.min(60 + n++ * 25, 400)} />)}
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}
