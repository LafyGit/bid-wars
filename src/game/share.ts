const STORE_URL = 'https://apps.apple.com/app/id6816925758';

/** What a player sends after a round. The link is what brings the friend in, so it's never optional. */
export function resultMessage(winner: string, topic: string, score: readonly [number, number]): string {
  return `${winner} just won our $20 draft on ${topic} in Outbid. Match score: ${score[0]}-${score[1]}.\n$20 each, 10 hidden items, one phone. Play it: ${STORE_URL}`;
}
