import { useRef, useCallback } from 'react';

type Callback<T extends unknown[]> = (...args: T) => void;

const useDebounce = <T extends unknown[]>(callback: Callback<T>, delay: number) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFunction = useCallback((...args: T) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  const cancelDebounce = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return [debouncedFunction, cancelDebounce] as const;
};

export default useDebounce;