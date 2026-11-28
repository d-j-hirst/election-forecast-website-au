import {useEffect, useState} from 'react';

// The public link opens half an hour before Victorian polls close. Use the
// Melbourne instant for readers in every time zone, including already-open tabs.
const opening = Date.parse('2026-11-28T17:30:00+11:00');

export default function useVictorianLiveOpening(enabled) {
  const [open, setOpen] = useState(() => Date.now() >= opening);
  useEffect(() => {
    if (!enabled) return undefined;
    let timer;
    const check = () => {
      clearTimeout(timer);
      const remaining = opening - Date.now();
      setOpen(remaining <= 0);
      if (remaining > 0) {
        // Long browser timers can overflow for visits weeks before the election.
        timer = setTimeout(check, Math.min(remaining, 24 * 60 * 60 * 1000));
      }
    };
    check();
    document.addEventListener('visibilitychange', check);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', check);
    };
  }, [enabled]);
  return enabled && open;
}
