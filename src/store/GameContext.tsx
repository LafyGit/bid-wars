import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { AccessibilityInfo } from 'react-native';
import { TOPICS, topicById, type Topic } from '../content/topics';
import * as R from '../game/round';
import type { Pair, Player, Privacy, RoundState, Session, Settings } from '../game/types';
import { haptic, setHapticsEnabled } from '../fx/haptics';
import { initSound, setSoundEnabled, sfx } from '../fx/sound';
import { KEYS, load, loadRaw, save } from './storage';

export type Screen =
  | 'splash' | 'home' | 'howto' | 'setup' | 'topics' | 'reveal' | 'intro'
  | 'auction' | 'final' | 'winner' | 'awards' | 'browser' | 'settings';

export type AppState = {
  hydrated: boolean;
  osReducedMotion: boolean;
  screen: Screen;
  back: Screen;
  /** Raw stored names; empty string falls back to "Player N". */
  names: Pair<string>;
  draft: Pair<string>;
  score: Pair<number>;
  session: Session;
  settings: Settings;
  topicId: string;
  round: RoundState | null;
  reveal: { idx: number; landed: boolean };
  collOpen: boolean;
  menu: boolean;
  confirmReset: boolean;
  roundWinner: Player;
  lastRound: number;
  winnerBurst: number;
};

const DEFAULT_SETTINGS: Settings = { sound: true, haptics: true, reducedMotion: false, privacy: 'pass' };

const initial: AppState = {
  hydrated: false,
  osReducedMotion: false,
  screen: 'splash',
  back: 'home',
  names: ['', ''],
  draft: ['', ''],
  score: [0, 0],
  session: R.newSession(),
  settings: DEFAULT_SETTINGS,
  topicId: TOPICS[0].id,
  round: null,
  reveal: { idx: 0, landed: false },
  collOpen: false,
  menu: false,
  confirmReset: false,
  roundWinner: 0,
  lastRound: 1,
  winnerBurst: 0,
};

type Action =
  | { type: 'hydrate'; names: Pair<string>; score: Pair<number>; session: Session; settings: Settings }
  | { type: 'osReducedMotion'; on: boolean }
  | { type: 'go'; screen: Screen; back?: Screen }
  | { type: 'draft'; i: Player; value: string }
  | { type: 'draftReset' }
  | { type: 'names'; names: Pair<string> }
  | { type: 'setting'; key: keyof Settings; value: boolean | Privacy }
  | { type: 'resetConfirm'; on: boolean }
  | { type: 'resetScore' }
  | { type: 'spin'; topicId: string; idx: number; landed: boolean }
  | { type: 'spinTick'; idx: number; landed: boolean }
  | { type: 'round'; round: RoundState | null }
  | { type: 'coll'; open: boolean }
  | { type: 'menu'; open: boolean }
  | { type: 'roundWon'; w: Player; score: Pair<number>; session: Session };

function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    case 'hydrate': return { ...s, hydrated: true, names: a.names, draft: a.names, score: a.score, session: a.session, settings: a.settings };
    case 'osReducedMotion': return { ...s, osReducedMotion: a.on };
    case 'go': return { ...s, screen: a.screen, back: a.back ?? s.back, menu: false, collOpen: false, confirmReset: false };
    case 'draft': { const d: Pair<string> = [s.draft[0], s.draft[1]]; d[a.i] = a.value; return { ...s, draft: d }; }
    case 'draftReset': return { ...s, draft: [s.names[0], s.names[1]] };
    case 'names': return { ...s, names: a.names };
    case 'setting': return { ...s, settings: { ...s.settings, [a.key]: a.value } };
    case 'resetConfirm': return { ...s, confirmReset: a.on };
    case 'resetScore': return { ...s, score: [0, 0], session: R.newSession(), confirmReset: false };
    case 'spin': return { ...s, topicId: a.topicId, reveal: { idx: a.idx, landed: a.landed }, screen: 'reveal', menu: false, collOpen: false };
    case 'spinTick': return { ...s, reveal: { idx: a.idx, landed: a.landed } };
    case 'round': return { ...s, round: a.round };
    case 'coll': return { ...s, collOpen: a.open };
    case 'menu': return { ...s, menu: a.open };
    case 'roundWon': return { ...s, roundWinner: a.w, score: a.score, session: a.session, lastRound: a.session.rounds, screen: 'winner', winnerBurst: s.winnerBurst + 1, menu: false, collOpen: false };
  }
}

export type Game = {
  state: AppState;
  topic: Topic;
  /** Effective display names ("Player 1" fallback). */
  names: Pair<string>;
  rm: boolean;
  privacy: Privacy;
  go: (screen: Screen, back?: Screen) => void;
  play: () => void;
  openSetup: () => void;
  setDraft: (i: Player, v: string) => void;
  setupDone: () => void;
  toggleSound: () => void;
  setSetting: (k: keyof Settings, v: boolean | Privacy) => void;
  resetScore: () => void;
  startRandom: () => void;
  chooseTopic: (id: string) => void;
  startRound: () => void;
  tapCard: () => void;
  startBidding: () => void;
  adjust: (p: Player, d: number) => void;
  setBid: (p: Player, v: number) => void;
  lock: (p: Player) => void;
  handedOver: () => void;
  reveal: () => void;
  tieBreak: () => void;
  next: () => void;
  chooseWinner: (w: Player) => void;
  peek: (p: Player, on: boolean) => void;
  toggleColl: () => void;
  toggleMenu: () => void;
  quitRound: () => void;
};

const Ctx = createContext<Game | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const stateRef = useRef(state);
  stateRef.current = state;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const rm = state.settings.reducedMotion || state.osReducedMotion;
  const rmRef = useRef(rm);
  rmRef.current = rm;

  const later = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, rmRef.current ? Math.min(ms, 60) : ms);
    timers.current.push(t);
    return t;
  }, []);
  const clearTimers = useCallback(() => { timers.current.forEach(clearTimeout); timers.current = []; }, []);

  // Hydrate persisted state, then leave the splash after 1.7s (or on tap).
  useEffect(() => {
    let alive = true;
    (async () => {
      const [names, score, session, settings] = await Promise.all([
        loadRaw<Pair<string>>(KEYS.names, ['', '']),
        loadRaw<Pair<number>>(KEYS.score, [0, 0]),
        load<Session>(KEYS.session, R.newSession()),
        load<Settings>(KEYS.settings, DEFAULT_SETTINGS),
      ]);
      if (!alive) return;
      setHapticsEnabled(settings.haptics);
      setSoundEnabled(settings.sound);
      initSound();
      dispatch({ type: 'hydrate', names, score, session, settings });
    })();
    AccessibilityInfo.isReduceMotionEnabled().then((on) => alive && dispatch({ type: 'osReducedMotion', on })).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (on) => dispatch({ type: 'osReducedMotion', on }));
    const t = setTimeout(() => { if (stateRef.current.screen === 'splash') dispatch({ type: 'go', screen: 'home' }); }, 1700);
    return () => { alive = false; sub.remove(); clearTimeout(t); clearTimers(); };
  }, [clearTimers]);

  const setRound = useCallback((fn: (r: RoundState) => RoundState) => {
    const r = stateRef.current.round;
    if (!r) return;
    const nr = fn(r);
    if (nr !== r) {
      // Keep the ref current for timer chains that dispatch several steps in a row.
      stateRef.current = { ...stateRef.current, round: nr };
      dispatch({ type: 'round', round: nr });
    }
  }, []);

  const privacyOf = () => stateRef.current.settings.privacy;

  const api = useMemo<Omit<Game, 'state' | 'topic' | 'names' | 'rm' | 'privacy'>>(() => {
    const go = (screen: Screen, back?: Screen) => dispatch({ type: 'go', screen, back });

    const startCountdown = () => {
      if (rmRef.current) return resolveNow();
      setRound(R.startCountdown);
      sfx('countdown_tick'); haptic('tick');
      later(() => { setRound(R.countTick); sfx('countdown_tick'); haptic('tick'); }, 420);
      later(() => { setRound(R.countTick); sfx('countdown_tick'); haptic('tick'); }, 840);
      later(resolveNow, 1260);
    };

    const resolveNow = () => {
      setRound((r) => R.resolve(r));
      later(() => {
        setRound(R.showVerdict);
        const res = stateRef.current.round?.result;
        if (!res) return;
        if (res.type === 'tie') { sfx('tie'); haptic('tie'); }
        else if (res.type === 'win') { sfx('win'); haptic('win'); }
        else haptic('unclaimed');
      }, 380);
    };

    return {
      go,
      play: () => { dispatch({ type: 'draftReset' }); go('setup'); },
      openSetup: () => { dispatch({ type: 'draftReset' }); go('setup'); },
      setDraft: (i, v) => dispatch({ type: 'draft', i, value: v.slice(0, 12) }),
      setupDone: () => {
        const d = stateRef.current.draft;
        const names: Pair<string> = [d[0].trim(), d[1].trim()];
        save(KEYS.names, names);
        dispatch({ type: 'names', names });
        go('topics');
      },
      toggleSound: () => api.setSetting('sound', !stateRef.current.settings.sound),
      setSetting: (k, v) => {
        const settings = { ...stateRef.current.settings, [k]: v };
        save(KEYS.settings, settings);
        if (k === 'haptics') setHapticsEnabled(v as boolean);
        if (k === 'sound') setSoundEnabled(v as boolean);
        dispatch({ type: 'setting', key: k, value: v });
      },
      resetScore: () => {
        if (!stateRef.current.confirmReset) return dispatch({ type: 'resetConfirm', on: true });
        save(KEYS.score, [0, 0]); save(KEYS.session, R.newSession());
        dispatch({ type: 'resetScore' });
      },
      startRandom: () => {
        clearTimers();
        const target = Math.floor(Math.random() * TOPICS.length);
        if (rmRef.current) {
          dispatch({ type: 'spin', topicId: TOPICS[target].id, idx: target, landed: true });
          sfx('topic_land'); haptic('land');
          return;
        }
        dispatch({ type: 'spin', topicId: TOPICS[target].id, idx: Math.floor(Math.random() * TOPICS.length), landed: false });
        let t = 0, i = Math.floor(Math.random() * TOPICS.length);
        const steps = 14;
        for (let s = 0; s < steps; s++) {
          t += 45 + s * s * 1.6;
          const last = s === steps - 1;
          const idx = last ? target : (i = (i + 1) % TOPICS.length);
          const tt = setTimeout(() => {
            dispatch({ type: 'spinTick', idx, landed: last });
            sfx(last ? 'topic_land' : 'topic_spin_tick');
            if (last) haptic('land');
          }, t);
          timers.current.push(tt);
        }
      },
      chooseTopic: (id) => {
        clearTimers();
        dispatch({ type: 'spin', topicId: id, idx: TOPICS.findIndex((t) => t.id === id), landed: true });
        sfx('reveal');
      },
      startRound: () => {
        clearTimers();
        const s = stateRef.current;
        const topic = topicById(s.topicId);
        const items = R.shuffle(topic.items).slice(0, R.ITEMS);
        const first: Player = (s.session.rounds % 2) as Player;
        dispatch({ type: 'round', round: R.startRound(topic.id, items, first) });
        go('auction', 'auction');
      },
      tapCard: () => {
        const r = stateRef.current.round;
        if (!r || r.phase !== 'hidden') return;
        setRound(R.revealItem);
        sfx('reveal'); haptic('reveal');
      },
      startBidding: () => setRound((r) => R.startBidding(r, privacyOf())),
      adjust: (p, d) => {
        const before = stateRef.current.round?.bids[p];
        setRound((r) => R.adjustBid(r, p, d));
        if (stateRef.current.round?.bids[p] !== before) haptic('adjust');
      },
      setBid: (p, v) => {
        const before = stateRef.current.round?.bids[p];
        setRound((r) => R.setBid(r, p, v));
        if (stateRef.current.round?.bids[p] !== before) haptic('adjust');
      },
      lock: (p) => {
        const r = stateRef.current.round;
        if (!r || r.locked[p]) return;
        setRound((x) => R.lockBid(x, p));
        sfx('lock'); haptic('lock');
        const nr = stateRef.current.round!;
        if (nr.phase === 'table') {
          if (nr.locked[0] && nr.locked[1]) later(startCountdown, 500);
          return;
        }
        later(() => setRound(R.afterLock), 650);
      },
      handedOver: () => { setRound(R.handedOver); haptic('nav'); },
      reveal: startCountdown,
      tieBreak: () => setRound((r) => R.tieBreak(r, privacyOf())),
      next: () => {
        const r = stateRef.current.round;
        if (!r) return;
        if (R.isLastItem(r)) {
          sfx('final_result'); haptic('final');
          go('final');
          return;
        }
        setRound(R.nextItem);
      },
      chooseWinner: (w) => {
        const s = stateRef.current;
        if (!s.round) return;
        const { score, session } = R.chooseWinner(s.round, s.score, s.session, w);
        save(KEYS.score, score); save(KEYS.session, session);
        dispatch({ type: 'roundWon', w, score, session });
        sfx('final_result'); haptic('final');
      },
      peek: (p, on) => setRound((r) => R.setPeek(r, p, on)),
      toggleColl: () => dispatch({ type: 'coll', open: !stateRef.current.collOpen }),
      toggleMenu: () => dispatch({ type: 'menu', open: !stateRef.current.menu }),
      quitRound: () => { clearTimers(); dispatch({ type: 'round', round: null }); go('home', 'home'); },
    };
  }, [later, clearTimers, setRound]);

  const names: Pair<string> = [state.names[0].trim() || 'Player 1', state.names[1].trim() || 'Player 2'];
  const topic = topicById(state.topicId);
  const value = useMemo<Game>(() => ({ ...api, state, topic, names, rm, privacy: state.settings.privacy }), [api, state, topic, names[0], names[1], rm]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGame(): Game {
  const g = useContext(Ctx);
  if (!g) throw new Error('useGame must be used inside GameProvider');
  return g;
}
