import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '../store/GameContext';
import { colors } from '../theme/tokens';
import { AuctionHeader } from './auction/AuctionHeader';
import { CollectionsSheet, CollectionsStrip } from './auction/CollectionsSheet';
import { HiddenCard } from './auction/HiddenCard';
import { OpenAuction } from './auction/OpenAuction';
import { PauseMenu } from './auction/PauseMenu';
import { ResultView } from './auction/ResultView';

/**
 * The header stays mounted; the phase decides the body.
 * hidden/item → card · auction → open bidding · result → verdict.
 */
export function Auction() {
  const g = useGame();
  const insets = useSafeAreaInsets();
  const r = g.state.round;
  if (!r) return null;
  const ph = r.phase;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 2 }}>
      <AuctionHeader />
      {(ph === 'hidden' || ph === 'item') && <HiddenCard />}
      {ph === 'auction' && <OpenAuction />}
      {ph === 'result' && <ResultView />}
      {ph === 'auction' ? <View style={{ height: Math.max(insets.bottom, 16) + 6 }} /> : <CollectionsStrip />}
      {g.state.collOpen && <CollectionsSheet />}
      {g.state.menu && <PauseMenu />}
    </View>
  );
}
