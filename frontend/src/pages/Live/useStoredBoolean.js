import {useState} from 'react';

// Recent Changes preferences live in this browser. Storage may be blocked,
// so keep each control usable during the current visit regardless.
export default function useStoredBoolean(key) {
  const [value, setValue] = useState(() => {
    try {
      return localStorage.getItem(key) === 'true';
    } catch {
      return false;
    }
  });

  const update = next => {
    setValue(next);
    try {
      localStorage.setItem(key, String(next));
    } catch {
      // The current view already reflects the preference.
    }
  };

  return [value, update];
}
