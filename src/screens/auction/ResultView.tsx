import React from 'react';
import { View } from 'react-native';
import { quip } from '../../game/round';
import { useGame } from '../../store/GameContext';
import { colors, playerColor } from '../../theme/tokens';
import { CTA } from '../../ui/Btn';
import { CountingNumber } from '../../ui/CountingNumber';
import { Burst, Enter, Flash } from '../../ui/Motion';
import { Row } from '../../ui/Screen';
import { Body, Display, Mono, nameSize } from '../../ui/Txt';

/** Screens 13–17: bids slide in, then the verdict (win / tie / unclaimed) with flash, burst and banter. */
export function ResultView() {
  const g = useGame();
  const r = g.state.round!;
  const R = r.result!;
  const accent = g.topic.accent;
  const show = r.resultStage >= 1;
  const rw = R.type === 'win' ? R.w : -1;
  const item = r.items[r.idx];
  const color = rw === 0 ? colors.p1 : rw === 1 ? colors.p2 : R.type === 'tie' ? accent : colors.ink6;
  const dim = (p: 0 | 1) => (show && ((rw >= 0 && rw !== p) || R.type === 'unclaimed') ? 0.35 : 1);
  const kicker = R.type === 'win' && R.coin ? 'COIN TOSS' : r.tieRound > 0 ? 'TIE-BREAK WON' : 'SOLD';
  const headline = R.type === 'win' ? `${g.names[R.w]} WINS` : '';

  return (
    <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 22 }}>
      {show && <Flash key={r.burstKey} color={color} />}
      <Mono align="center">ITEM {String(r.idx + 1).padStart(2, '0')} · {item}</Mono>
      <Row style={{ marginTop: 14 }}>
        <Enter kind="left" duration={360} style={{ flex: 1 }}>
          <View style={{ alignItems: 'center', opacity: dim(0) }}>
            <Mono color={playerColor(0)} ls={0.12} numberOfLines={1}>{g.names[0]}</Mono>
            <Display size={76} ls={-0.03} lh={1} tabular accessibilityLabel={`${g.names[0]} bid $${r.bids[0]}`}>${r.bids[0]}</Display>
          </View>
        </Enter>
        <Display size={14} color={colors.ink5} ls={0} lh={1.1}>VS</Display>
        <Enter kind="right" duration={360} style={{ flex: 1 }}>
          <View style={{ alignItems: 'center', opacity: dim(1) }}>
            <Mono color={playerColor(1)} ls={0.12} numberOfLines={1}>{g.names[1]}</Mono>
            <Display size={76} ls={-0.03} lh={1} tabular accessibilityLabel={`${g.names[1]} bid $${r.bids[1]}`}>${r.bids[1]}</Display>
          </View>
        </Enter>
      </Row>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {show && R.type === 'win' && (
          <View style={{ alignItems: 'center' }} accessibilityLiveRegion="assertive">
            {/* R.w is a Player here */}
            <Burst color={color} seed={r.burstKey} />
            <Enter kind="fade"><Mono color={colors.ink2} ls={0.16}>{kicker}</Mono></Enter>
            <Enter kind="pop" duration={460} style={{ marginTop: 6 }}>
              <Display size={nameSize(headline, 54)} color={color} ls={-0.035} lh={0.95} align="center" numberOfLines={1} adjustsFontSizeToFit>{headline}</Display>
            </Enter>
            <Enter kind="pop" delay={140} duration={400} style={{ marginTop: 12, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14, backgroundColor: color }}>
              <Display size={22} wdth={90} color={colors.bg} ls={0} lh={1.1} numberOfLines={1}>{item} · ${R.price}</Display>
            </Enter>
            <Enter kind="in" delay={260} duration={300} style={{ marginTop: 20, flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
              <Mono ls={0.12}>BUDGET</Mono>
              <Display size={22} weight={800} color={colors.ink4} ls={-0.02} lh={1.1} style={{ textDecorationLine: 'line-through' }}>${r.prev[R.w]}</Display>
              <Body size={18} color={colors.ink4}>→</Body>
              <CountingNumber value={r.budgets[R.w]} delay={350} size={30} ls={-0.02} lh={1.1} />
            </Enter>
          </View>
        )}
        {show && R.type === 'tie' && (
          <View style={{ alignItems: 'center' }} accessibilityLiveRegion="assertive">
            <Enter kind="tie"><Display size={120} ls={-0.04} lh={0.9}>TIE</Display></Enter>
            <Mono size={12} color={accent} style={{ marginTop: 10 }}>TIE-BREAK · BID AGAIN · MIN ${R.amount}</Mono>
          </View>
        )}
        {show && R.type === 'unclaimed' && (
          <Enter kind="pop" duration={400} style={{ alignItems: 'center' }} >
            <Display size={48} color={colors.ink4} lh={0.95} numberOfLines={1} adjustsFontSizeToFit>UNCLAIMED</Display>
            <View style={{ marginTop: 12, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.ink5 }}>
              <Display size={22} wdth={90} color={colors.ink2} ls={0} lh={1.1}>{item}</Display>
            </View>
          </Enter>
        )}
        {show && (
          <Enter kind="in" delay={380} duration={300} style={{ marginTop: 22, maxWidth: 300 }}>
            <Body size={16} align="center">{quip(r, g.names)}</Body>
          </Enter>
        )}
      </View>

      <View style={{ height: 118, justifyContent: 'center' }}>
        {show && R.type === 'tie' && (
          <Enter kind="in" delay={500} duration={300}><CTA label="START TIE-BREAK" bg={accent} size={18} onPress={g.tieBreak} /></Enter>
        )}
        {show && R.type !== 'tie' && (
          <Enter kind="in" delay={500} duration={300}><CTA label={r.idx === 9 ? 'SEE FINAL COLLECTIONS' : 'NEXT ITEM'} size={18} onPress={g.next} /></Enter>
        )}
      </View>
    </View>
  );
}
