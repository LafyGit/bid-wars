import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { suggest, type DecideCopy, type SuggestPool, type Suggestion } from '../content/decide';
import { colors, withAlpha } from '../theme/tokens';
import { Enter } from './Motion';
import { Body, Display, Mono, FitText } from './Txt';
import { Row } from './Screen';

/** Entry card on a category screen: "Can't decide?" */
export function DecideCard({ copy, accent, onPress }: { copy: DecideCopy; accent: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${copy.question} ${copy.cta}`} onPress={onPress} style={({ pressed }) => ({ padding: 14, borderRadius: 18, borderWidth: 1.5, borderColor: withAlpha(accent, 0.6), backgroundColor: withAlpha(accent, 0.08), flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.8 : 1 })}>
      <Display size={22} color={accent} ls={0} lh={1.15}>✦</Display>
      <View style={{ flex: 1 }}>
        <Body size={14} weight={700} color={colors.ink}>{copy.question}</Body>
        <Body size={12} color={colors.ink3}>{copy.cta}</Body>
      </View>
      <Mono size={10} color={accent} ls={0.12}>ASK →</Mono>
    </Pressable>
  );
}

/** Bottom sheet that suggests one item and can offer another. Pure UI over `suggest`. */
export function DecideSheet({ copy, accent, pool, onClose }: { copy: DecideCopy; accent: string; pool: SuggestPool; onClose: () => void }) {
  const [shown, setShown] = useState<string[]>([]);
  const [current, setCurrent] = useState<Suggestion | null>(() => suggest(pool));
  const another = () => {
    const prev = current ? shown.concat(current.item) : shown;
    setShown(prev);
    setCurrent(suggest(pool, prev));
  };
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'flex-end', zIndex: 50 }}>
      <Pressable accessibilityLabel="Close" onPress={onClose} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.scrim65 }} />
      <Enter kind="up" duration={320}>
        <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 36, gap: 6 }}>
          <Mono color={accent} ls={0.16}>{copy.question.toUpperCase()}</Mono>
          {current ? (
            <Enter key={current.item} kind="pop" duration={360} style={{ marginTop: 10, gap: 6 }}>
              <Mono color={colors.ink4}>{copy.verb.toUpperCase()}</Mono>
              <FitText text={current.item} size={34} minSize={18} maxLines={4} wdth={100} color={colors.ink} ls={-0.02} lh={1.1} upper={false} />
              <Body size={13} color={colors.ink3}>From {current.from}</Body>
            </Enter>
          ) : (
            <Body size={15} color={colors.ink3} style={{ marginTop: 10 }}>Nothing to suggest here yet.</Body>
          )}
          <Row gap={10} style={{ marginTop: 18 }}>
            <Pressable accessibilityRole="button" onPress={another} style={({ pressed }) => ({ flex: 1, height: 54, borderRadius: 16, backgroundColor: accent, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.85 : 1 })}>
              <Display size={15} color={colors.bg} ls={0} lh={1.15}>ANOTHER</Display>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onClose} style={({ pressed }) => ({ flex: 1, height: 54, borderRadius: 16, borderWidth: 1.5, borderColor: colors.line20, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}>
              <Display size={15} color={colors.ink} ls={0} lh={1.15}>SOUNDS GOOD</Display>
            </Pressable>
          </Row>
        </View>
      </Enter>
    </View>
  );
}
