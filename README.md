# Bid Wars

A two-player, one-phone auction party game. Each round: $20 of fake money each, 10 hidden items from one subtopic, and open back-and-forth bidding: raise by at least $1 or pass. A player can win at most 5 items. After ten items the players compare collections, hear the AI judge's opinion, and decide the winner themselves.

Built with React Native + Expo (TypeScript) from the V1 design handoff.

## Run it

```bash
npm install
npx expo start --ios      # or --android, or scan the QR code with Expo Go
```

Unit tests for the game rules (ties, $0/$0, coin toss, budget caps, tie minimums, awards, session stats):

```bash
npm test
```

Type check:

```bash
npm run typecheck
```

## Project layout

```
App.tsx                     Fonts, safe area, providers
src/Root.tsx                One screen at a time, no tab bar
src/store/GameContext.tsx   App state + timers + persistence + sound/haptics around the pure reducer
src/game/round.ts           Pure round logic: startRound, revealItem, startBidding, placeBid, pass, goingTick,
                            nextItem, chooseWinner, awardsList, quip
src/ai/judge.ts             AI judge (Claude via @anthropic-ai/sdk) with an offline fallback
src/game/types.ts           RoundState, Session, Settings, Award
src/game/__tests__/         node:test specs for the rules
src/content/catalog.ts      Groups → categories → subtopics → items (5 groups, 28 categories, 195 subtopics); topics.ts derives the flat list
src/theme/tokens.ts         Colors, radii, font families
src/ui/                     Txt (Display / Mono / Body), Btn, Motion (Reanimated entrances, Burst, Flash),
                            Sheet, Toggle, CountingNumber, PlayerMark
src/screens/                One file per screen; src/screens/auction/ holds the auction phases
src/fx/                     Haptics and the audio event bus
assets/fonts/               Archivo static instances (cut from the variable font) + IBM Plex Mono
assets/sfx/                 Placeholder low-gain tones (swap for real cues later)
```

## Design notes

- **Fonts.** React Native can't drive variable font axes, so `assets/fonts` holds static Archivo instances cut with
  fontTools: Expanded (wdth 125), SemiExpanded (115), default (100), SemiCondensed (88), Condensed (75) at the
  weights the design uses. Each instance carries a unique family / PostScript name; without that iOS merges them
  into one face.
- **Auto-fit text.** The handoff formulas assumed browser glyph metrics. On device Archivo Expanded Black caps
  average 0.93em and Condensed Black 0.59em, so `nameSize` uses 0.9 and `itemSize` uses 0.6 per character, with
  `adjustsFontSizeToFit` as a guard.
- **Open bidding.** Both players share the screen. The reducer enforces turn order, the $1 minimum raise, the
  budget cap and the 5-item cap; a pass concedes the item to the leader (or leaves it unclaimed when nobody bid).
  The optional 3-second rule (Settings) counts "going once, going twice, sold" after every bid.
- **Judging.** The judge always picks a winner (no draws) and ranks on the quality of the picks and the best single pick, never on money left. Without an API key the built-in judge uses each item's highest bid as a demand signal; with a key Claude judges the items themselves.
- **AI judge.** Set `EXPO_PUBLIC_ANTHROPIC_API_KEY` in `.env` (see `.env.example`) and the final screen asks
  Claude (`claude-opus-5`) for a verdict on the two collections. Without a key a built-in judge rules instead.
  The key ships inside the bundle, which is fine for a private TestFlight build; front it with a proxy before a
  public release.
- **Privacy.** The item name is not rendered until the card flip begins. Progress segments show position only.
- **Reduced motion.** The in-app toggle and the OS setting both collapse every entrance to a short fade, skip the
  countdown and topic spin, and drop the burst, flash and shake.
- **Persistence.** Names, match score, session stats and settings are stored with AsyncStorage under the
  `bidwars.*` keys from the handoff.
- **Content.** Add a subtopic by appending to its category in `catalog.ts`; anything with fewer than 10 items is
  skipped automatically. Every category must be listed in exactly one entry of `GROUPS` (the catalog test
  enforces this, plus 10+ unique items per subtopic).
- **Sound.** `src/fx/sound.ts` is an event bus (`reveal`, `lock`, `countdown_tick`, `win`, `tie`, `final_result`,
  `topic_spin_tick`, `topic_land`) wired to placeholder tones. Respects the Sound toggle and the silent switch.

## Fonts license

Archivo and IBM Plex Mono are used under the SIL Open Font License (see `assets/fonts/OFL-Archivo.txt`).
