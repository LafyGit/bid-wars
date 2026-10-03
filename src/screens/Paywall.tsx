import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { GROUPS, groupById } from '../content/topics';
import { groupProductId, ownsGroup, ownsPro, PRO_ID } from '../store/entitlements';
import { useGame } from '../store/GameContext';
import { colors, layout, withAlpha } from '../theme/tokens';
import { TextLink } from '../ui/Btn';
import { Enter } from '../ui/Motion';
import { Screen, useScreenInsets } from '../ui/Screen';
import { Body, Display, Mono } from '../ui/Txt';

function Offer({ title, tagline, accent, price, owned, available, featured, onBuy, delay }: {
  title: string; tagline: string; accent: string; price?: string; owned: boolean; available: boolean; featured?: boolean; onBuy: () => void; delay: number;
}) {
  const label = owned ? 'OWNED' : price ?? '—';
  return (
    <Enter kind="in" delay={delay} duration={340}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={owned ? `${title}, owned` : `${title}, ${price ?? 'unavailable'}. ${tagline}`}
        accessibilityState={{ disabled: owned || !available }}
        disabled={owned || !available}
        onPress={onBuy}
        style={({ pressed }) => ({ borderRadius: 24, padding: 18, backgroundColor: featured ? withAlpha(accent, 0.14) : colors.surface, borderWidth: featured ? 2 : 1, borderColor: featured ? accent : colors.line12, opacity: !owned && !available ? 0.55 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            {featured && <Mono size={10} color={accent} ls={0.16}>BEST VALUE</Mono>}
            <Display size={19} wdth={112} upper={false} ls={-0.01} lh={1.15} numberOfLines={2}>{title}</Display>
            <Body size={13} color={colors.ink3} style={{ marginTop: 4 }}>{tagline}</Body>
          </View>
          <View style={{ minWidth: 84, height: 44, paddingHorizontal: 14, borderRadius: 14, backgroundColor: owned ? colors.line12 : accent, alignItems: 'center', justifyContent: 'center' }}>
            <Display size={15} wdth={100} color={owned ? colors.ink2 : colors.bg} ls={0} lh={1.1} numberOfLines={1}>{label}</Display>
          </View>
        </View>
      </Pressable>
    </Enter>
  );
}

/** Unlock more topics: the group pack the player came from, plus Pro (everything). One-time purchases. */
export function Paywall() {
  const g = useGame();
  const p = useScreenInsets();
  const { owned, products, storeStatus, storeMessage, paywallGroup, paywallBack } = g.state;
  const group = paywallGroup ? groupById(paywallGroup) : null;
  const available = storeStatus === 'ready';
  return (
    <Screen padX={false} padBottom={false}>
      <View style={{ paddingHorizontal: layout.padX }}>
        <TextLink label="← BACK" onPress={() => g.go(paywallBack === 'paywall' ? 'topics' : paywallBack)} />
        <Display size={36} lh={1} style={{ marginTop: 10 }}>{'MORE TOPICS,\nMORE WARS'}</Display>
        <Body size={14} color={colors.ink3} style={{ marginTop: 10 }}>One-time purchases. No subscription, no ads. Yours on every device with your Apple account.</Body>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: layout.padX, paddingTop: 18, paddingBottom: p.bottom + 12, gap: 10 }} showsVerticalScrollIndicator={false}>
        <Offer
          title="Bid Wars Pro"
          tagline="Every topic in every group, plus everything we add later"
          accent="#39FF6A"
          featured
          price={products[PRO_ID]?.price}
          owned={ownsPro(owned)}
          available={available && !!products[PRO_ID]}
          onBuy={() => g.buyProduct(PRO_ID)}
          delay={60}
        />
        {group && (
          <Offer
            title={`${group.title} Pack`}
            tagline={group.subtitle}
            accent={group.accent}
            price={products[groupProductId(group.id)]?.price}
            owned={ownsGroup(owned, group.id)}
            available={available && !!products[groupProductId(group.id)]}
            onBuy={() => g.buyProduct(groupProductId(group.id))}
            delay={120}
          />
        )}
        {!group && GROUPS.map((gr, i) => {
          const owns = ownsGroup(owned, gr.id);
          return (
            <Offer
              key={gr.id}
              title={`${gr.title} Pack`}
              tagline={gr.subtitle}
              accent={gr.accent}
              price={products[groupProductId(gr.id)]?.price}
              owned={owns}
              available={available && !!products[groupProductId(gr.id)]}
              onBuy={() => g.buyProduct(groupProductId(gr.id))}
              delay={120 + i * 50}
            />
          );
        })}
        {group && (
          <Pressable accessibilityRole="button" onPress={() => g.openPaywall(null)} style={{ alignSelf: 'center', paddingVertical: 8 }}>
            <Mono color={colors.ink3}>SEE ALL UNLOCKS</Mono>
          </Pressable>
        )}
        {storeStatus === 'unavailable' && <Body size={13} color={colors.ink4} align="center">The App Store isn’t available right now, so purchases are paused. The free packs still work.</Body>}
        {storeStatus === 'loading' && <Body size={13} color={colors.ink4} align="center">Loading prices…</Body>}
        {storeMessage && <Body size={13} color={colors.ink2} align="center" accessibilityLiveRegion="polite">{storeMessage}</Body>}
        <Pressable accessibilityRole="button" onPress={g.restorePurchases} style={({ pressed }) => ({ alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 14, borderWidth: 1, borderColor: colors.line14, opacity: pressed ? 0.7 : 1 })}>
          <Mono color={colors.ink2}>RESTORE PURCHASES</Mono>
        </Pressable>
        <Body size={11} color={colors.ink5} align="center" lh={1.5}>Payment is charged to your Apple account at confirmation. Purchases are one-time and can be restored at any time.</Body>
      </ScrollView>
    </Screen>
  );
}
