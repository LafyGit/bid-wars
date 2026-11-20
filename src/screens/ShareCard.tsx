import React, { useRef, useState } from 'react';
import { PixelRatio, Platform, Share, View, useWindowDimensions } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { topicLabel } from '../content/topics';
import { resultMessage } from '../game/share';
import type { Collected, Player } from '../game/types';
import { useGame } from '../store/GameContext';
import { colors, playerColor } from '../theme/tokens';
import { CTA, TextLink } from '../ui/Btn';
import { Row } from '../ui/Screen';
import { Sheet } from '../ui/Sheet';
import { Body, Display, FitText, Mono } from '../ui/Txt';
import { Wordmark } from '../ui/Wordmark';

/** The card is laid out at 4:5 and exported at 1080×1350, the size feeds and stories both take. */
const CARD_W = 320;
const CARD_H = 400;
const EXPORT = { width: 1080, height: 1350 };
/** Native capture takes points and multiplies by the screen scale (3240 px wide on a 3x phone); the web takes pixels. */
const exportSize = () => {
  const r = Platform.OS === 'web' ? 1 : PixelRatio.get();
  return { width: EXPORT.width / r, height: EXPORT.height / r };
};

function Column({ p, name, items }: { p: Player; name: string; items: Collected[] }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingBottom: 5, borderBottomWidth: 2, borderBottomColor: playerColor(p) }}>
        <FitText kind="mono" text={name} size={10} minSize={7} color={playerColor(p)} ls={0.12} />
      </View>
      {items.map((c, i) => (
        <Row key={`${c.name}-${i}`} justify="space-between" gap={4} style={{ paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.line07 }}>
          <View style={{ flex: 1 }}><FitText kind="body" text={c.name} size={11} minSize={8} maxLines={2} weight={600} color={colors.ink} lh={1.25} /></View>
          <Body size={10} weight={600} color={colors.ink3} tabular>${c.price}</Body>
        </Row>
      ))}
      {items.length === 0 && <Body size={11} color={colors.ink5} style={{ paddingVertical: 4 }}>Won nothing. Bold.</Body>}
    </View>
  );
}

/** The image players send: who won, on what, and both collections. Fixed size so every phone exports the same card. */
export function ShareCard({ cardRef }: { cardRef: React.RefObject<View | null> }) {
  const g = useGame();
  const r = g.state.round!;
  const w = g.state.roundWinner;
  const name = g.names[w];
  return (
    <View ref={cardRef} collapsable={false} style={{ width: CARD_W, height: CARD_H, backgroundColor: colors.bg, borderRadius: 0, padding: 20, overflow: 'hidden' }}>
      <Row justify="space-between" align="flex-start">
        <Wordmark size={17} bar />
        <View style={{ alignItems: 'flex-end', maxWidth: 170 }}>
          <Mono size={9} color={colors.ink3} ls={0.14}>ROUND {g.state.lastRound}</Mono>
          <FitText kind="mono" text={topicLabel(g.topic)} size={9} minSize={7} maxLines={2} color={g.topic.accent} ls={0.12} align="right" />
        </View>
      </Row>
      <View style={{ marginTop: 18 }}>
        <FitText text={name} size={40} minSize={18} fitWidth={CARD_W - 40} color={playerColor(w)} ls={-0.04} lh={1.05} />
        <Display size={17} ls={-0.01} lh={1.1}>WINS THE ROUND</Display>
      </View>
      <Row gap={14} align="flex-start" style={{ marginTop: 16, flex: 1 }}>
        <Column p={0} name={g.names[0]} items={r.collections[0]} />
        <Column p={1} name={g.names[1]} items={r.collections[1]} />
      </Row>
      <Row justify="space-between" style={{ marginTop: 10 }}>
        <Mono size={9} color={colors.ink4} ls={0.14}>MATCH {g.state.score[0]}–{g.state.score[1]}</Mono>
        <Mono size={9} color={colors.ink4} ls={0.14}>TWO PLAYERS · ONE PHONE</Mono>
      </Row>
    </View>
  );
}

/** Preview the card, then share the image (with the store link as text). Falls back to the text share if capture fails. */
export function ShareSheet({ onClose, beforeShare }: { onClose: () => void; beforeShare?: () => void }) {
  const g = useGame();
  const { width } = useWindowDimensions();
  const ref = useRef<View>(null);
  const [busy, setBusy] = useState(false);
  const scale = Math.min(1, (width - 44) / CARD_W);
  const message = resultMessage(g.names[g.state.roundWinner], g.topic.title, g.state.score);
  const share = async () => {
    beforeShare?.();
    setBusy(true);
    try {
      const uri = await captureRef(ref, { format: 'png', quality: 1, result: Platform.OS === 'web' ? 'data-uri' : 'tmpfile', ...exportSize() });
      await Share.share(Platform.OS === 'android' ? { message } : { url: uri, message });
    } catch {
      // No image (capture failed or the sheet was dismissed oddly): the text still carries the result and the link.
      await Share.share({ message }).catch(() => {});
    } finally {
      setBusy(false);
    }
  };
  return (
    <Sheet onClose={onClose}>
      <Mono color={colors.ink3} ls={0.14} align="center">SHARE THE RESULT</Mono>
      <View style={{ alignItems: 'center', marginTop: 12, height: CARD_H * scale }}>
        <View style={{ transform: [{ scale }], transformOrigin: 'top' }}>
          <View style={{ borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: colors.line07 }}>
            <ShareCard cardRef={ref} />
          </View>
        </View>
      </View>
      <CTA label={busy ? 'PREPARING…' : 'SHARE IMAGE'} size={18} disabled={busy} style={{ marginTop: 16, opacity: busy ? 0.6 : 1 }} onPress={share} />
      <TextLink label="CLOSE" align="center" onPress={onClose} />
    </Sheet>
  );
}
