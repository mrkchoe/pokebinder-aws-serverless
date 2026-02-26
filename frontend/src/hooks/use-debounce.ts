import { useState, useEffect, useCallback } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

export function useDebouncedCallback<A extends unknown[]>(
  fn: (...args: A) => void,
  delay: number
): (...args: A) => void {
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);
  const callback = useCallback(
    (...args: A) => {
      if (timeoutId) clearTimeout(timeoutId);
      const t = setTimeout(() => {
        fn(...args);
        setTimeoutId(null);
      }, delay);
      setTimeoutId(t);
    },
    [fn, delay, timeoutId]
  );
  useEffect(() => () => { if (timeoutId) clearTimeout(timeoutId); }, [timeoutId]);
  return callback;
}
