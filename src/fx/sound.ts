import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

/** Audio event bus. Auction-house sound set: gavel knocks, soft bid tones (one per player), a cash-register 'sold', a slot-reel ratchet. */
export type SoundEvent = 'reveal' | 'lock' | 'countdown_tick' | 'win' | 'tie' | 'final_result' | 'topic_spin_tick' | 'topic_land' | 'pass' | 'bid_p1' | 'bid_p2';

const sources: Record<SoundEvent, number> = {
  reveal: require('../../assets/sfx/reveal.caf'),
  lock: require('../../assets/sfx/lock.caf'),
  countdown_tick: require('../../assets/sfx/tick.caf'),
  win: require('../../assets/sfx/win.caf'),
  tie: require('../../assets/sfx/tie.caf'),
  final_result: require('../../assets/sfx/final.caf'),
  topic_spin_tick: require('../../assets/sfx/spin.caf'),
  topic_land: require('../../assets/sfx/land.caf'),
  pass: require('../../assets/sfx/pass.caf'),
  bid_p1: require('../../assets/sfx/bid1.caf'),
  bid_p2: require('../../assets/sfx/bid2.caf'),
};

/** Each event gets a small pool of players so a sound can fire again before the last one has finished. */
const POOL: Partial<Record<SoundEvent, number>> = { bid_p1: 3, bid_p2: 3, topic_spin_tick: 3, countdown_tick: 2 };

let enabled = true;
const players: Partial<Record<SoundEvent, AudioPlayer[]>> = {};
const next: Partial<Record<SoundEvent, number>> = {};
let ready = false;

export const setSoundEnabled = (on: boolean) => { enabled = on; };

export async function initSound() {
  if (ready) return;
  ready = true;
  try {
    await setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' });
    (Object.keys(sources) as SoundEvent[]).forEach((k) => {
      players[k] = Array.from({ length: POOL[k] ?? 1 }, () => {
        const p = createAudioPlayer(sources[k]);
        p.volume = k === 'bid_p1' || k === 'bid_p2' ? 0.45 : 0.6;
        return p;
      });
    });
  } catch {
    // Audio is optional. The game is fully playable silent.
  }
}

export function sfx(e: SoundEvent) {
  if (!enabled) return;
  const pool = players[e];
  if (!pool?.length) return;
  const i = (next[e] ?? 0) % pool.length;
  next[e] = i + 1;
  const p = pool[i];
  try {
    p.pause();
    p.seekTo(0);
    p.play();
  } catch {}
}
