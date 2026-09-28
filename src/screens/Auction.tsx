import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '../store/GameContext';
import { colors } from '../theme/tokens';
import { AuctionHeader } from './auction/AuctionHeader';
import { CollectionsSheet, CollectionsStrip } from './auction/CollectionsSheet';
import { Countdown } from './auction/Countdown';
import { HiddenCard } from './auction/HiddenCard';
import { PassPhone } from './auction/PassPhone';
import { PauseMenu } from './auction/PauseMenu';
import { PrivateBid } from './auction/PrivateBid';
import { Ready } from './auction/Ready';
import { ResultView } from './auction/ResultView';
import { TableMode } from './auction/TableMode';

/**
 * Screens 08–19 and 28. The header stays mounted; the phase decides the body and any full-screen overlay.
 * hidden/item → card · result → verdict · bid/pass/ready/count/table → overlays.
 */
export function Auction() {
  const g = useGame();
  const insets = useSafeAreaInsets();
  const r = g.state.round;
  if (!r) return null;
  const ph = r.phase;
  const showCard = ph === 'hidden' || ph === 'item' || ph === 'bid' || ph === 'pass' || ph === 'ready' || ph === 'count' || ph === 'table';
  const showStrip = ph === 'hidden' || ph === 'item' || ph === 'result';
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 2 }}>
      <AuctionHeader />
      {showCard && <HiddenCard />}
      {ph === 'result' && <ResultView />}
      {showStrip ? <CollectionsStrip /> : <View style={{ height: 82 }} />}

      {ph === 'bid' && <PrivateBid />}
      {ph === 'pass' && <PassPhone />}
      {ph === 'ready' && <Ready />}
      {ph === 'count' && <Countdown />}
      {ph === 'table' && <TableMode />}

      {g.state.collOpen && <CollectionsSheet />}
      {g.state.menu && <PauseMenu />}
    </View>
  );
}
