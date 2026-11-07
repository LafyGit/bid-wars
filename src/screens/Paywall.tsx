import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { rewardedAvailable } from '../ads/ads';
import { CATEGORIES, topicById } from '../content/topics';
import { ownsPro, PRO_ID } from '../store/entitlements';
import { useGame } from '../store/GameContext';
import { colors, layout, withAlpha } from '../theme/tokens';
import { CTA, TextLink } from '../ui/Btn';
import { Enter } from '../ui/Motion';
import { Screen, useScreenInsets } from '../ui/Screen';
import { Body, Display, Mono } from '../ui/Txt';

const PRO = '#39FF6A';

function Perk({ title, body, delay }: { title: string; body: string; delay: number }) {
  return (
    <Enter kind="in" delay={delay} duration={340} style={{ flexDirection: 'row', gap: 12, padding: 16, borderRadius: 18, backgroundColor: colors.surface }}>
      <View style={{ width: 8, borderRadius: 4, backgroundColor: PRO }} />
      <View style={{ flex: 1 }}>
        <Display size={17} wdth={112} upper={false} ls={0} lh={1.2}>{title}</Display>
        <Body size={13} color={colors.ink3} style={{ marginTop: 3 }}>{body}</Body>
      </View>
    </Enter>
  );
}

/** Outbid Pro: one purchase, no ads, the bonus packs. Every core pack stays free. */
export function Paywall() {
  const g = useGame();
  const p = useScreenInsets();
  const { owned, products, storeStatus, storeMessage, paywallBack } = g.state;
  const pro = ownsPro(owned);
  const price = products[PRO_ID]?.price;
  const available = storeStatus === 'ready' && !!price;
  const trial = g.state.paywallTopic ? topicById(g.state.paywallTopic) : null;
  const bonus = CATEGORIES.filter((c) => !c.free && c.topics.length).map((c) => c.title);
  // The rewarded ad loads in the background; poll so the offer appears once it is ready.
  const [adReady, setAdReady] = React.useState(rewardedAvailable());
  React.useEffect(() => {
    const t = setInterval(() => setAdReady(rewardedAvailable()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <Screen padX={false} padBottom={false}>
      <View style={{ paddingHorizontal: layout.padX }}>
        <TextLink label="← BACK" onPress={() => g.go(paywallBack === 'paywall' ? 'topics' : paywallBack)} />
        <Mono color={PRO} style={{ marginTop: 12 }}>ONE-TIME PURCHASE</Mono>
        <Display size={40} lh={1} style={{ marginTop: 6 }}>{'OUTBID\nPRO'}</Display>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: layout.padX, paddingTop: 18, paddingBottom: p.bottom + 12, gap: 10 }} showsVerticalScrollIndicator={false}>
        <Perk title="No ads, ever" body="No breaks between rounds. Just the next auction." delay={40} />
        <Perk title="Bonus packs" body={bonus.join(' · ')} delay={90} />
        <Perk title="Everything we add later" body="New Pro packs land in your app for free." delay={140} />
        <Enter kind="in" delay={200} duration={340} style={{ marginTop: 6 }}>
          {pro
            ? <View style={{ height: 64, borderRadius: 20, backgroundColor: withAlpha(PRO, 0.14), borderWidth: 2, borderColor: PRO, alignItems: 'center', justifyContent: 'center' }}><Display size={18} color={PRO} ls={0.02} lh={1.1}>PRO UNLOCKED</Display></View>
            : <CTA label={available ? `GET PRO · ${price}` : 'GET PRO'} bg={PRO} height={64} size={19} disabled={!available} style={{ opacity: available ? 1 : 0.5 }} onPress={() => g.buyProduct(PRO_ID)} accessibilityLabel={available ? `Get Bid Wars Pro for ${price}` : 'Bid Wars Pro, unavailable right now'} />}
        </Enter>
        <Body size={12} color={colors.ink4} align="center">Every other pack is free to play.</Body>
        {!pro && trial && adReady && (
          <Pressable accessibilityRole="button" accessibilityLabel={`Watch an ad to play ${trial.title} once`} onPress={g.watchAdForTopic} style={({ pressed }) => ({ borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.line14, backgroundColor: pressed ? colors.surfaceHover : 'transparent', alignItems: 'center', gap: 4 })}>
            <Mono color={colors.ink2}>OR WATCH A SHORT AD</Mono>
            <Body size={14} color={colors.ink} weight={700} align="center">Play {trial.title} free this time</Body>
          </Pressable>
        )}
        {storeStatus === 'unavailable' && <Body size={13} color={colors.ink4} align="center">The App Store isn’t available right now, so purchases are paused. The free packs still work.</Body>}
        {storeStatus === 'loading' && <Body size={13} color={colors.ink4} align="center">Loading price…</Body>}
        {storeMessage && <Body size={13} color={colors.ink2} align="center" accessibilityLiveRegion="polite">{storeMessage}</Body>}
        <Pressable accessibilityRole="button" onPress={g.restorePurchases} style={({ pressed }) => ({ alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 14, borderWidth: 1, borderColor: colors.line14, opacity: pressed ? 0.7 : 1 })}>
          <Mono color={colors.ink2}>RESTORE PURCHASES</Mono>
        </Pressable>
        <Body size={11} color={colors.ink5} align="center" lh={1.5}>Payment is charged to your Apple account at confirmation. One-time, no subscription, restorable at any time. Packs bought earlier keep working and stay ad-free.</Body>
      </ScrollView>
    </Screen>
  );
}
