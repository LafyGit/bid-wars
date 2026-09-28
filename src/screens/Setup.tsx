import React from 'react';
import { KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import { useGame } from '../store/GameContext';
import { colors, fonts, playerColor } from '../theme/tokens';
import { CTA, TextLink } from '../ui/Btn';
import { Enter } from '../ui/Motion';
import { PlayerMark } from '../ui/PlayerMark';
import { Row, Screen } from '../ui/Screen';
import { Body, Display, Mono } from '../ui/Txt';
import type { Player } from '../game/types';

function NameCard({ p }: { p: Player }) {
  const g = useGame();
  const c = playerColor(p);
  return (
    <Enter kind={p === 0 ? 'left' : 'right'} delay={p === 0 ? 0 : 80} duration={380} style={{ padding: 18, borderRadius: 22, backgroundColor: colors.surface }}>
      <Row gap={8}>
        <PlayerMark p={p} size={10} />
        <Mono color={c}>PLAYER {p + 1}</Mono>
      </Row>
      <TextInput
        value={g.state.draft[p]}
        onChangeText={(v) => g.setDraft(p, v)}
        maxLength={12}
        placeholder="Enter name"
        placeholderTextColor={colors.ink5}
        autoCorrect={false}
        autoCapitalize="words"
        returnKeyType="done"
        accessibilityLabel={`Player ${p + 1} name`}
        style={{ marginTop: 10, height: 56, borderBottomWidth: 2, borderBottomColor: c, color: colors.ink, fontFamily: fonts.semiExpandedExtraBold, fontSize: 30, padding: 0 }}
      />
    </Enter>
  );
}

export function Setup() {
  const g = useGame();
  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <TextLink label="← BACK" onPress={() => g.go('home')} />
        <Display size={40} style={{ marginTop: 14 }}>{'WHO’S\nPLAYING?'}</Display>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <NameCard p={0} />
          <Enter kind="pop" delay={160} duration={380} style={{ alignSelf: 'center', marginVertical: -2, zIndex: 2, width: 52, height: 52, borderRadius: 26, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
            <Display size={15} color={colors.ink4} ls={0} lh={1.1}>VS</Display>
          </Enter>
          <NameCard p={1} />
          <Body size={13} color={colors.ink4} align="center" style={{ marginTop: 16 }}>Names are saved on this phone. No accounts.</Body>
        </View>
        <CTA label="CONTINUE" onPress={g.setupDone} />
      </KeyboardAvoidingView>
    </Screen>
  );
}
