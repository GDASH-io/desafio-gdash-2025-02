import { useEffect, useRef } from 'react';

export function usePolling(
  fn: () => Promise<void>,
  interval = 30000,
  enabled = true
) {
  const timerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    if (!enabled) return;

    const tick = async () => {
      if (!mountedRef.current) return;
      try {
        await fn();
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    tick();
    timerRef.current = window.setInterval(tick, interval);

    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [fn, interval, enabled]);
}


