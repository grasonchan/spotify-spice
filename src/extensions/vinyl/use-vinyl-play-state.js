import { useEffect } from 'react';
import { usePlayStatus } from '@/hooks/host/use-play-status.js';

export const useVinylPlayState = () => {
  const playStatus = usePlayStatus();

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--vinyl-play-state',
      playStatus ? 'running' : 'paused'
    );
  }, [playStatus]);
};
