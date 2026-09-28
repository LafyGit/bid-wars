# Bid Wars — app icon / logo

Six candidate marks, all built from the app's existing palette and type. PNGs are 960×960 previews of the 240pt tile (4x). Pick one and generate platform icon sets from it (Expo: `app.json` → `icon`, `android.adaptiveIcon.foregroundImage` + `backgroundColor: "#0E0F12"`).

## Shared rules
- Tile background `#0E0F12` (ink on dark) except 1C (gold `#EFC45A`).
- Tile corner radius = 22.5% of side (54 / 240). Platforms mask their own shape; export the icon square with no radius and let iOS/Android round it.
- P1 periwinkle `#8FA0F5`, always circle. P2 gold `#EFC45A`, always diamond (square rotated 45°).
- Light ink `#F3F1EC`. Dark ink on any colored fill `#0E0F12`.
- Type: Archivo weight 900, `wdth 125` (expanded). Labels: IBM Plex Mono 600.
- Safe zone: keep artwork inside the central 80% (Android adaptive icons crop to a 66% circle — check 2C's tags and 1A's bars at that crop).

## Options

### 2A · Crossed paddles (vector — `icon-2a-crossed-paddles.svg`)
Two bidding paddles crossed like swords. Centre of the cross at (120, 138) in a 240 grid. Each paddle: handle 18×118, rx 9, from y −30 to 88; head centred at y −58 (P1 circle r 46, P2 square 72 rotated 45°). P1 rotated −32°, P2 rotated +32°, P2 on top. Pure shapes, no font dependency — the safest to ship.

### 2B · Torn dollar
One `$` glyph (Archivo 900, wdth 125, size 214 on a 240 tile, centred) split vertically at 50%. Left half P1 colour shifted up 14; right half P2 colour shifted down 14. Scales: shift = 5.8% of tile.

### 2C · Secret item, two sealed bids
White card 108×150, radius 14, rotated −8°, at (66, 34), with `?` in dark ink (Archivo 900, 110). Two pills rotated −8°, height 52, radius 26: P1 `$140` at left (26, 140), P2 `$95` at right (right 26, top 66). Pill text IBM Plex Mono 600, 22, tracking .06em. Below 120pt drop the text and keep the pills as plain shapes (40×26 / 34×26 at 120pt).

### 1A · Split wordmark
`BID` (P1) left-aligned over `WARS` (P2) right-aligned, Archivo 900 wdth 125, 78 on 240, letter-spacing −.045em, line-height .84, 6 gap. Split bar underneath: two 7-tall bars, 5 gap, P1 | P2. Drop the bars under 80pt.

### 1B · Circle vs diamond
P1 circle 112 at (40, 64). P2 square 112 at (104, 64), rotated 45°, scaled .72, drawn on top. Optional `BID WARS` label in Plex Mono 600, 13, tracking .2em, 26 from bottom — drop under 200pt.

### 1C · Split B
Gold tile, P1 triangle over the top-left half (`polygon(0 0, 100% 0, 0 100%)`). `B` in dark ink, Archivo 900 wdth 125, 190 on 240, letter-spacing −.06em, centred, nudged up 8. Tiny `P1` / `P2` Plex Mono labels bottom-left / top-right at 240 only.

## Source
`Bid Wars Logo.dc.html` in the project root renders all six at 240 / 120 / 60 pt.
