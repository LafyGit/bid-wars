import * as Haptics from 'expo-haptics';

export type HapticEvent = 'adjust' | 'lock' | 'tick' | 'reveal' | 'win' | 'tie' | 'final' | 'land' | 'unclaimed' | 'nav';

let enabled = true;
export const setHapticsEnabled = (on: boolean) => { enabled = on; };

const run = (p: Promise<void>) => p.catch(() => {});
const later = (fn: () => void, ms: number) => setTimeout(fn, ms);

export function haptic(e: HapticEvent) {
  if (!enabled) return;
  switch (e) {
    case 'adjust': return run(Haptics.selectionAsync());
    case 'lock': return run(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
    case 'tick':
    case 'reveal':
    case 'nav':
    case 'unclaimed': return run(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
    case 'land': return run(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid));
    case 'win': return run(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    case 'tie':
      run(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
      later(() => run(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)), 120);
      return;
    case 'final':
      run(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
      later(() => run(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)), 90);
      return;
  }
}
