import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { cleanItems, CUSTOM_ACCENT, ITEM_MAX, longWord, MAX_ITEMS, MIN_ITEMS, packProblem, TITLE_MAX, WORD_MAX } from '../content/custom';
import { useGame } from '../store/GameContext';
import { colors, fonts, layout } from '../theme/tokens';
import { CTA, TextLink } from '../ui/Btn';
import { Row, Screen, useScreenInsets } from '../ui/Screen';
import { Body, Display, Mono } from '../ui/Txt';

const field = { color: colors.ink, backgroundColor: colors.surface, borderRadius: 16, paddingHorizontal: 14 } as const;

/** Make or edit a pack: a name and one item per line, best first. Leaving with ← BACK discards the changes. */
export function PackEditor() {
  const g = useGame();
  const p = useScreenInsets();
  const editing = g.state.custom.find((x) => x.id === g.state.editingPack) ?? null;
  const [title, setTitle] = useState(editing?.title ?? '');
  const [text, setText] = useState(editing ? editing.items.join('\n') : '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const items = useMemo(() => cleanItems(text), [text]);
  const problem = packProblem(title, items);
  const enough = items.length >= MIN_ITEMS;
  const tooLong = longWord(title.trim(), items);
  return (
    <Screen padX={false} padBottom={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: layout.padX }}>
          <TextLink label="← BACK" onPress={g.back} />
          <Display size={34} lh={0.92} style={{ marginTop: 6 }}>{editing ? 'EDIT PACK' : 'NEW PACK'}</Display>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: layout.padX, paddingTop: 16, paddingBottom: 16, gap: 8 }} showsVerticalScrollIndicator={false}>
          <Mono color={CUSTOM_ACCENT}>NAME</Mono>
          <TextInput
            value={title}
            onChangeText={setTitle}
            maxLength={TITLE_MAX}
            placeholder="Office legends"
            placeholderTextColor={colors.ink5}
            autoCapitalize="words"
            returnKeyType="next"
            accessibilityLabel="Pack name"
            style={[field, { height: 54, fontFamily: fonts.semiExpandedExtraBold, fontSize: 20 }]}
          />
          <Row justify="space-between" style={{ marginTop: 14 }}>
            <Mono color={CUSTOM_ACCENT}>ITEMS · BEST FIRST</Mono>
            <Mono color={enough ? CUSTOM_ACCENT : colors.ink3} accessibilityLiveRegion="polite">{enough ? `${items.length} ITEMS` : `${items.length} / ${MIN_ITEMS}`}</Mono>
          </Row>
          <TextInput
            value={text}
            onChangeText={setText}
            multiline
            scrollEnabled={false}
            maxLength={MAX_ITEMS * (ITEM_MAX + 1)}
            placeholder={'One per line\nBest first: the judge ranks from the top'}
            placeholderTextColor={colors.ink5}
            autoCapitalize="sentences"
            accessibilityLabel="Pack items, one per line, best first"
            style={[field, { minHeight: 260, paddingTop: 14, paddingBottom: 14, fontFamily: fonts.semiBold, fontSize: 17, lineHeight: 26, textAlignVertical: 'top' }]}
          />
          {tooLong && <Body size={13} weight={700} color={colors.p2} accessibilityLiveRegion="polite">“{tooLong.slice(0, WORD_MAX)}…” is too long for the cards. Keep words to {WORD_MAX} letters.</Body>}
          <Body size={12} color={colors.ink4}>One per line. Each round draws ten at random, so a longer list keeps rounds fresh. Up to {MAX_ITEMS} items, {ITEM_MAX} characters each.</Body>
          {editing && (
            <Pressable
              accessibilityRole="button"
              onPress={() => (confirmDelete ? g.deletePack(editing.id) : setConfirmDelete(true))}
              style={({ pressed }) => ({ alignSelf: 'center', marginTop: 14, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 14, borderWidth: 1, borderColor: confirmDelete ? colors.p2 : colors.line14, opacity: pressed ? 0.7 : 1 })}
            >
              <Mono color={confirmDelete ? colors.p2 : colors.ink3}>{confirmDelete ? 'TAP AGAIN TO DELETE' : 'DELETE PACK'}</Mono>
            </Pressable>
          )}
        </ScrollView>
        <View style={{ paddingHorizontal: layout.padX, paddingTop: 8, paddingBottom: p.bottom }}>
          <CTA
            label={problem ? problem.toUpperCase() : 'SAVE PACK'}
            bg={CUSTOM_ACCENT}
            disabled={!!problem}
            style={{ opacity: problem ? 0.5 : 1 }}
            onPress={() => g.savePack(title, text)}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
