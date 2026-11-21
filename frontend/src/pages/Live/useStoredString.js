import {useCallback, useState} from 'react';

// Recent Changes preferences live in this browser. Storage may be blocked,
// so keep each control usable during the current visit regardless.
export default function useStoredString(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      return localStorage.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  });

  const update = useCallback(
    next => {
      setValue(next);
      try {
        localStorage.setItem(key, next);
      } catch {
        // The current view already reflects the preference.
      }
    },
    [key]
  );

  return [value, update];
}
