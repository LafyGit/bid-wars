import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../store/GameContext';
import { Display } from './Txt';

type Props = React.ComponentProps<typeof Display> & {
  value: number;
  /** ms before the tween starts once `value` changes */
  delay?: number;
  duration?: number;
  prefix?: string;
};

/** Renders a number that tweens (ease-out cubic, integers) whenever `value` changes. */
export function CountingNumber({ value, delay = 0, duration = 600, prefix = '$', ...text }: Props) {
  const { rm } = useGame();
  const [shown, setShown] = useState(value);
  const shownRef = useRef(value);
  const raf = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value === shownRef.current) return;
    if (raf.current) cancelAnimationFrame(raf.current);
    if (timer.current) clearTimeout(timer.current);
    if (rm) { shownRef.current = value; setShown(value); return; }
    const from = shownRef.current;
    timer.current = setTimeout(() => {
      const t0 = Date.now();
      const step = () => {
        const k = Math.min(1, (Date.now() - t0) / duration);
        const e = 1 - Math.pow(1 - k, 3);
        const v = Math.round(from + (value - from) * e);
        shownRef.current = v;
        setShown(v);
        if (k < 1) raf.current = requestAnimationFrame(step);
      };
      raf.current = requestAnimationFrame(step);
    }, delay);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); if (timer.current) clearTimeout(timer.current); };
  }, [value, delay, duration, rm]);

  return <Display tabular {...text}>{prefix}{shown}</Display>;
}
