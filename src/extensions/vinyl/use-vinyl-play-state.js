import { useEffect } from 'react';
import { usePlayStatus } from '@/hooks/host/use-play-status.js';

const VINYL_PLAY_STATE = '--vinyl-play-state';

export const useVinylPlayState = () => {
  const playStatus = usePlayStatus();

  useEffect(() => {
    document.documentElement.style.setProperty(
      VINYL_PLAY_STATE,
      playStatus ? 'running' : 'paused'
    );
  }, [playStatus]);

  useEffect(
    () => () =>
      document.documentElement.style.removeProperty(VINYL_PLAY_STATE),
    []
  );
};
