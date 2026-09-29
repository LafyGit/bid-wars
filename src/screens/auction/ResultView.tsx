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

/** Sold / unclaimed verdict with flash, burst, hammer stamp and banter. */
export function ResultView() {
  const g = useGame();
  const r = g.state.round!;
  const R = r.result!;
  const show = r.resultStage >= 1;
  const item = r.items[r.idx];
  const win = R.type === 'win';
  const color = win ? playerColor(R.w) : colors.ink6;
  const headline = win ? `${g.names[R.w]} WINS` : '';
  const best = r.log[r.log.length - 1]?.bids ?? [0, 0];

  return (
    <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 18 }}>
      {show && <Flash key={r.burstKey} color={color} />}
      <Mono align="center">ITEM {String(r.idx + 1).padStart(2, '0')} · {item}</Mono>
      <Row style={{ marginTop: 10 }}>
        {([0, 1] as const).map((p) => (
          <Enter key={p} kind={p === 0 ? 'left' : 'right'} duration={360} style={{ flex: 1 }}>
            <View style={{ alignItems: 'center', opacity: show && (!win || R.w !== p) ? 0.35 : 1 }}>
              <Mono color={playerColor(p)} ls={0.12} numberOfLines={1}>{g.names[p]}</Mono>
              <Display size={56} ls={-0.03} lh={1} tabular color={best[p] ? colors.ink : colors.ink5}>${best[p]}</Display>
              <Mono size={10} color={colors.ink4}>TOP BID</Mono>
            </View>
          </Enter>
        ))}
      </Row>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {show && win && (
          <View style={{ alignItems: 'center' }} accessibilityLiveRegion="assertive">
            <Burst color={color} seed={r.burstKey} />
            <Enter kind="stamp" duration={420}>
              <View style={{ paddingHorizontal: 18, paddingVertical: 6, borderRadius: 12, borderWidth: 4, borderColor: color, transform: [{ rotate: '-6deg' }] }}>
                <Display size={26} color={color} ls={0.06} lh={1.1}>{r.going === 3 ? 'SOLD · 3 COUNT' : 'SOLD'}</Display>
              </View>
            </Enter>
            <Enter kind="pop" delay={120} duration={460} style={{ marginTop: 12 }}>
              <Display size={nameSize(headline, 54)} color={color} ls={-0.035} lh={1.1} align="center" numberOfLines={1} adjustsFontSizeToFit>{headline}</Display>
            </Enter>
            <Enter kind="pop" delay={240} duration={400} style={{ marginTop: 10, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14, backgroundColor: color, maxWidth: 330 }}>
              <Display size={item.length > 22 ? 15 : item.length > 14 ? 18 : 22} wdth={90} color={colors.bg} ls={0} lh={1.1} numberOfLines={1}>{item} · ${R.price}</Display>
            </Enter>
            <Enter kind="in" delay={340} duration={300} style={{ marginTop: 18, flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
              <Mono ls={0.12}>BUDGET</Mono>
              <Display size={22} weight={800} color={colors.ink4} ls={-0.02} lh={1.1} style={{ textDecorationLine: 'line-through' }}>${r.prev[R.w]}</Display>
              <Body size={18} color={colors.ink4}>→</Body>
              <CountingNumber value={r.budgets[R.w]} delay={350} size={30} ls={-0.02} lh={1.1} />
            </Enter>
          </View>
        )}
        {show && !win && (
          <Enter kind="pop" duration={400} style={{ alignItems: 'center' }}>
            <Display size={48} color={colors.ink4} lh={0.95} numberOfLines={1} adjustsFontSizeToFit>UNCLAIMED</Display>
            <View style={{ marginTop: 12, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.ink5 }}>
              <Display size={22} wdth={90} color={colors.ink2} ls={0} lh={1.1}>{item}</Display>
            </View>
          </Enter>
        )}
        {show && (
          <Enter kind="in" delay={420} duration={300} style={{ marginTop: 20, maxWidth: 300 }}>
            <Body size={16} align="center">{quip(r, g.names)}</Body>
          </Enter>
        )}
      </View>

      <View style={{ height: 100, justifyContent: 'center' }}>
        {show && (
          <Enter kind="in" delay={520} duration={300}><CTA label={r.idx === 9 ? 'SEE FINAL COLLECTIONS' : 'NEXT ITEM'} size={18} onPress={g.next} /></Enter>
        )}
      </View>
    </View>
  );
}
