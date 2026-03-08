import { useEffect } from '@/lib/react.js';
import { usePlayStatus } from '../host/use-play-status.js';

export const useTurntablePlayState = () => {
  const playStatus = usePlayStatus();

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--turntable-play-state',
      playStatus ? 'running' : 'paused'
    );
  }, [playStatus]);
};
