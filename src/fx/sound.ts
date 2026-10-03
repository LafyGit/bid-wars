import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

/** Audio event bus. Auction-house sound set: gavel knocks, coin clinks, a cash-register 'sold', a slot-reel ratchet. */
export type SoundEvent = 'reveal' | 'lock' | 'countdown_tick' | 'win' | 'tie' | 'final_result' | 'topic_spin_tick' | 'topic_land' | 'pass';

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
};

let enabled = true;
let players: Partial<Record<SoundEvent, AudioPlayer>> = {};
let ready = false;

export const setSoundEnabled = (on: boolean) => { enabled = on; };

export async function initSound() {
  if (ready) return;
  ready = true;
  try {
    await setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' });
    (Object.keys(sources) as SoundEvent[]).forEach((k) => {
      const p = createAudioPlayer(sources[k]);
      p.volume = 0.6;
      players[k] = p;
    });
  } catch {
    // Audio is optional. The game is fully playable silent.
  }
}

export function sfx(e: SoundEvent) {
  if (!enabled) return;
  const p = players[e];
  if (!p) return;
  try {
    p.seekTo(0);
    p.play();
  } catch {}
}
