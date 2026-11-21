import useStoredString from './useStoredString';

export default function useStoredBoolean(key) {
  const [value, setValue] = useStoredString(key, 'false');
  return [value === 'true', next => setValue(String(next))];
}
