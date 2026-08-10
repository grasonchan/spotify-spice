import { useEffect, useRef } from 'react';
import { volumeUpdate } from '@/subscribers/index.js';

export const useVolumeSync = (onChange) => {
  const callbackRef = useRef(onChange);
  callbackRef.current = onChange;

  useEffect(
    () =>
      volumeUpdate((event) => {
        const { isLocal, volume } = event.data;
        if (!isLocal) return;
        const clamped = Math.min(Math.max(volume, 0), 1);
        callbackRef.current?.(clamped);
      }),
    []
  );
};
