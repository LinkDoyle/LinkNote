import { useRef, useEffect } from "react";

export const useInterval = (callback: () => void, ms: number): void => {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }
    const handle = setInterval(tick, ms);
    return () => clearInterval(handle);
  }, [ms]);
};
