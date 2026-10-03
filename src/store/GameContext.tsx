import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { AccessibilityInfo } from 'react-native';
import { GROUPS, TOPICS, groupOfCategory, randomTopic, topicById, type Topic } from '../content/topics';
import * as R from '../game/round';
import type { Pair, Player, RoundState, Session, Settings } from '../game/types';
import { haptic, setHapticsEnabled } from '../fx/haptics';
import { initSound, setSoundEnabled, sfx } from '../fx/sound';
import { KEYS, load, loadRaw, save } from './storage';
import { playableTopics, topicUnlocked } from './entitlements';
import { pickItems, pickTopicId, remember } from '../game/pick';
import * as store from './purchases';
import type { ProductInfo, StoreStatus } from './purchases';

export type Screen =
  | 'splash' | 'home' | 'howto' | 'setup' | 'topics' | 'subtopics' | 'reveal' | 'intro'
  | 'auction' | 'final' | 'winner' | 'awards' | 'browser' | 'settings' | 'group' | 'paywall';

export type AppState = {
  hydrated: boolean;
  osReducedMotion: boolean;
  screen: Screen;
  back: Screen;
  names: Pair<string>;
  draft: Pair<string>;
  score: Pair<number>;
  session: Session;
  settings: Settings;
  groupId: string;
  categoryId: string;
  topicId: string;
  round: RoundState | null;
  reveal: { idx: number; landed: boolean };
  collOpen: boolean;
  menu: boolean;
  confirmReset: boolean;
  roundWinner: Player;
  lastRound: number;
  winnerBurst: number;
  /** Product ids the player owns (cached locally, confirmed by the store). */
  owned: string[];
  /** Item names shown recently (oldest first) and topics played recently, so evenings stay fresh. */
  seen: string[];
  recentTopics: string[];
  products: Record<string, ProductInfo>;
  storeStatus: StoreStatus;
  storeMessage: string | null;
  /** Group the paywall was opened from, so it can lead with that group's pack. */
  paywallGroup: string | null;
  paywallBack: Screen;
};

const DEFAULT_SETTINGS: Settings = { sound: true, haptics: true, reducedMotion: false, threeSecondRule: false, aiJudge: true };

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
  groupId: GROUPS[0].id,
  categoryId: TOPICS[0].categoryId,
  topicId: TOPICS[0].id,
  round: null,
  reveal: { idx: 0, landed: false },
  collOpen: false,
  menu: false,
  confirmReset: false,
  roundWinner: 0,
  lastRound: 1,
  winnerBurst: 0,
  owned: [],
  seen: [],
  recentTopics: [],
  products: {},
  storeStatus: 'loading',
  storeMessage: null,
  paywallGroup: null,
  paywallBack: 'topics',
};

type Action =
  | { type: 'hydrate'; names: Pair<string>; score: Pair<number>; session: Session; settings: Settings }
  | { type: 'osReducedMotion'; on: boolean }
  | { type: 'go'; screen: Screen; back?: Screen }
  | { type: 'draft'; i: Player; value: string }
  | { type: 'draftReset' }
  | { type: 'names'; names: Pair<string> }
  | { type: 'setting'; key: keyof Settings; value: boolean }
  | { type: 'resetConfirm'; on: boolean }
  | { type: 'resetScore' }
  | { type: 'group'; id: string }
  | { type: 'category'; id: string }
  | { type: 'spin'; topicId: string; idx: number; landed: boolean }
  | { type: 'spinTick'; idx: number; landed: boolean }
  | { type: 'round'; round: RoundState | null }
  | { type: 'coll'; open: boolean }
  | { type: 'menu'; open: boolean }
  | { type: 'roundWon'; w: Player; score: Pair<number>; session: Session }
  | { type: 'owned'; ids: string[]; replace?: boolean }
  | { type: 'history'; seen: string[]; recentTopics: string[] }
  | { type: 'products'; products: Record<string, ProductInfo> }
  | { type: 'storeStatus'; status: StoreStatus }
  | { type: 'storeMessage'; message: string | null }
  | { type: 'paywall'; group: string | null; back: Screen };

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
    case 'group': return { ...s, groupId: a.id, screen: 'group', menu: false, collOpen: false };
    case 'category': return { ...s, categoryId: a.id, groupId: groupOfCategory(a.id).id, screen: 'subtopics', menu: false, collOpen: false };
    case 'spin': return { ...s, topicId: a.topicId, reveal: { idx: a.idx, landed: a.landed }, screen: 'reveal', menu: false, collOpen: false };
    case 'spinTick': return { ...s, reveal: { idx: a.idx, landed: a.landed } };
    case 'round': return { ...s, round: a.round };
    case 'coll': return { ...s, collOpen: a.open };
    case 'menu': return { ...s, menu: a.open };
    case 'history': return { ...s, seen: a.seen, recentTopics: a.recentTopics };
    case 'owned': return { ...s, owned: a.replace ? a.ids : Array.from(new Set([...s.owned, ...a.ids])) };
    case 'products': return { ...s, products: a.products };
    case 'storeStatus': return { ...s, storeStatus: a.status };
    case 'storeMessage': return { ...s, storeMessage: a.message };
    case 'paywall': return { ...s, screen: 'paywall', paywallGroup: a.group, paywallBack: a.back, storeMessage: null, menu: false, collOpen: false };
    case 'roundWon': return { ...s, roundWinner: a.w, score: a.score, session: a.session, lastRound: a.session.rounds, screen: 'winner', winnerBurst: s.winnerBurst + 1, menu: false, collOpen: false };
  }
}

export type Game = {
  state: AppState;
  topic: Topic;
  /** Effective display names ("Player 1" fallback). */
  names: Pair<string>;
  rm: boolean;
  go: (screen: Screen, back?: Screen) => void;
  play: () => void;
  openSetup: () => void;
  setDraft: (i: Player, v: string) => void;
  setupDone: () => void;
  toggleSound: () => void;
  setSetting: (k: keyof Settings, v: boolean) => void;
  resetScore: () => void;
  openGroup: (id: string) => void;
  openCategory: (id: string) => void;
  startRandom: () => void;
  chooseTopic: (id: string) => void;
  startRound: () => void;
  tapCard: () => void;
  startBidding: () => void;
  bid: (p: Player, amount: number) => void;
  pass: (p: Player) => void;
  next: () => void;
  chooseWinner: (w: Player) => void;
  toggleColl: () => void;
  toggleMenu: () => void;
  quitRound: () => void;
  openPaywall: (group?: string | null) => void;
  buyProduct: (id: string) => void;
  restorePurchases: () => void;
  isUnlocked: (topic: Topic) => boolean;
};

const Ctx = createContext<Game | null>(null);

/** Pause before the verdict lands on the result screen. */
const VERDICT_DELAY = 420;
/** 3-second rule: one tick per second after the last bid. */
const GOING_TICK = 1000;

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const stateRef = useRef(state);
  stateRef.current = state;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const goingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rm = state.settings.reducedMotion || state.osReducedMotion;
  const rmRef = useRef(rm);
  rmRef.current = rm;

  const later = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, rmRef.current ? Math.min(ms, 60) : ms);
    timers.current.push(t);
    return t;
  }, []);
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout); timers.current = [];
    if (goingTimer.current) { clearTimeout(goingTimer.current); goingTimer.current = null; }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [names, score, session, settings, owned, seen, recentTopics] = await Promise.all([
        loadRaw<Pair<string>>(KEYS.names, ['', '']),
        loadRaw<Pair<number>>(KEYS.score, [0, 0]),
        load<Session>(KEYS.session, R.newSession()),
        load<Settings>(KEYS.settings, DEFAULT_SETTINGS),
        loadRaw<string[]>(KEYS.owned, []),
        loadRaw<string[]>(KEYS.seen, []),
        loadRaw<string[]>(KEYS.recent, []),
      ]);
      if (!alive) return;
      dispatch({ type: 'owned', ids: owned, replace: true });
      dispatch({ type: 'history', seen, recentTopics });
      store.startStore({
        onOwned: (ids) => alive && dispatch({ type: 'owned', ids }),
        onProducts: (products) => alive && dispatch({ type: 'products', products }),
        onStatus: (status) => alive && dispatch({ type: 'storeStatus', status }),
        onMessage: (message) => alive && dispatch({ type: 'storeMessage', message }),
      });
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

  // Remember purchases locally so the game still unlocks offline.
  const firstOwned = useRef(true);
  useEffect(() => {
    if (firstOwned.current) { firstOwned.current = false; return; }
    save(KEYS.owned, state.owned);
  }, [state.owned]);

  const setRound = useCallback((fn: (r: RoundState) => RoundState) => {
    const r = stateRef.current.round;
    if (!r) return null;
    const nr = fn(r);
    if (nr !== r) {
      stateRef.current = { ...stateRef.current, round: nr };
      dispatch({ type: 'round', round: nr });
    }
    return nr;
  }, []);

  const api = useMemo<Omit<Game, 'state' | 'topic' | 'names' | 'rm'>>(() => {
    const go = (screen: Screen, back?: Screen) => dispatch({ type: 'go', screen, back });

    const stopGoing = () => { if (goingTimer.current) { clearTimeout(goingTimer.current); goingTimer.current = null; } };

    /** After an item resolves: sound, haptic, then the verdict beat. */
    const afterResolve = (r: RoundState) => {
      stopGoing();
      if (r.result?.type === 'win') { sfx('win'); haptic('win'); } else { haptic('unclaimed'); }
      later(() => setRound(R.showVerdict), VERDICT_DELAY);
    };

    /** 3-second rule: going once, twice, sold. Restarts on every bid. */
    const armGoing = () => {
      stopGoing();
      if (!stateRef.current.settings.threeSecondRule) return;
      const tick = () => {
        const r = stateRef.current.round;
        if (!r || r.phase !== 'auction' || r.leader === -1) return;
        const nr = setRound(R.goingTick);
        if (!nr) return;
        if (nr.phase === 'result') { afterResolve(nr); return; }
        sfx('countdown_tick'); haptic('tick');
        goingTimer.current = setTimeout(tick, GOING_TICK);
      };
      goingTimer.current = setTimeout(tick, GOING_TICK);
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
        if (k === 'haptics') setHapticsEnabled(v);
        if (k === 'sound') setSoundEnabled(v);
        dispatch({ type: 'setting', key: k, value: v });
      },
      resetScore: () => {
        if (!stateRef.current.confirmReset) return dispatch({ type: 'resetConfirm', on: true });
        save(KEYS.score, [0, 0]); save(KEYS.session, R.newSession());
        dispatch({ type: 'resetScore' });
      },
      openGroup: (id) => { haptic('nav'); dispatch({ type: 'group', id }); },
      openCategory: (id) => { haptic('nav'); dispatch({ type: 'category', id }); },
      startRandom: () => {
        clearTimers();
        const pool = playableTopics(TOPICS, stateRef.current.owned);
        const targetId = pool.length ? pickTopicId(pool.map((t) => t.id), stateRef.current.recentTopics) : randomTopic().id;
        const target = TOPICS.find((t) => t.id === targetId) ?? randomTopic();
        const targetIdx = TOPICS.indexOf(target);
        const poolIdx = pool.map((t) => TOPICS.indexOf(t));
        if (rmRef.current) {
          dispatch({ type: 'spin', topicId: target.id, idx: targetIdx, landed: true });
          sfx('topic_land'); haptic('land');
          return;
        }
        dispatch({ type: 'spin', topicId: target.id, idx: poolIdx[Math.floor(Math.random() * poolIdx.length)] ?? targetIdx, landed: false });
        let t = 0, i = Math.floor(Math.random() * poolIdx.length);
        const steps = 16;
        for (let s = 0; s < steps; s++) {
          t += 45 + s * s * 1.5;
          const last = s === steps - 1;
          const idx = last ? targetIdx : poolIdx[(i = (i + 1) % poolIdx.length)] ?? targetIdx;
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
        const wanted = topicById(id);
        if (!topicUnlocked(wanted, stateRef.current.owned)) {
          haptic('nav');
          dispatch({ type: 'paywall', group: groupOfCategory(wanted.categoryId).id, back: stateRef.current.screen });
          return;
        }
        dispatch({ type: 'spin', topicId: id, idx: TOPICS.findIndex((t) => t.id === id), landed: true });
        sfx('reveal');
      },
      startRound: () => {
        clearTimers();
        const s = stateRef.current;
        const topic = topicById(s.topicId);
        const picked = pickItems(topic.items, R.ITEMS, s.seen);
        const items = picked.items;
        const recentTopics = remember(s.recentTopics, topic.id);
        dispatch({ type: 'history', seen: picked.seen, recentTopics });
        save(KEYS.seen, picked.seen); save(KEYS.recent, recentTopics);
        const opener: Player = (s.session.rounds % 2) as Player;
        dispatch({ type: 'round', round: R.startRound(topic.id, items, opener) });
        go('auction', 'auction');
      },
      tapCard: () => {
        const r = stateRef.current.round;
        if (!r || r.phase !== 'hidden') return;
        setRound(R.revealItem);
        sfx('reveal'); haptic('reveal');
      },
      startBidding: () => { setRound(R.startBidding); haptic('nav'); },
      bid: (p, amount) => {
        const before = stateRef.current.round;
        if (!before || !R.canBid(before, p)) return;
        const nr = setRound((r) => R.placeBid(r, p, amount));
        if (!nr || nr === before) return;
        sfx('lock'); haptic('lock');
        if (nr.phase === 'result') afterResolve(nr);
        else armGoing();
      },
      pass: (p) => {
        const before = stateRef.current.round;
        if (!before || before.phase !== 'auction' || before.turn !== p) return;
        const nr = setRound((r) => R.pass(r, p));
        if (!nr || nr === before) return;
        haptic('adjust');
        if (nr.phase === 'result') afterResolve(nr);
        else stopGoing();
      },
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
      toggleColl: () => dispatch({ type: 'coll', open: !stateRef.current.collOpen }),
      toggleMenu: () => dispatch({ type: 'menu', open: !stateRef.current.menu }),
      openPaywall: (group = null) => { haptic('nav'); dispatch({ type: 'paywall', group, back: stateRef.current.screen === 'paywall' ? stateRef.current.paywallBack : stateRef.current.screen }); },
      buyProduct: (id) => { haptic('lock'); store.buy(id); },
      restorePurchases: () => { store.restore(); },
      isUnlocked: (t) => topicUnlocked(t, stateRef.current.owned),
      quitRound: () => { clearTimers(); dispatch({ type: 'round', round: null }); go('home', 'home'); },
    };
  }, [later, clearTimers, setRound]);

  const names: Pair<string> = [state.names[0].trim() || 'Player 1', state.names[1].trim() || 'Player 2'];
  const topic = topicById(state.topicId);
  const value = useMemo<Game>(() => ({ ...api, state, topic, names, rm }), [api, state, topic, names[0], names[1], rm]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGame(): Game {
  const g = useContext(Ctx);
  if (!g) throw new Error('useGame must be used inside GameProvider');
  return g;
}
