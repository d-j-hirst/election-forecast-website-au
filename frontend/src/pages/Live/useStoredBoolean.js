import useStoredString from './useStoredString';

export default function useStoredBoolean(key, defaultValue = false) {
  const [value, setValue] = useStoredString(key, String(defaultValue));
  return [value === 'true', next => setValue(String(next))];
}
