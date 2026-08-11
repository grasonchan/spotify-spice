import { useState, useEffect } from 'react';
import { calcProgress } from '@/utils/math.js';

export const useMediaProgress = (media) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!media) return;

    const handleProgress = () => {
      const { currentTime, duration } = media;
      const progress = calcProgress(currentTime, duration);
      setProgress(progress);
    };

    handleProgress();
    media.addEventListener('loadedmetadata', handleProgress);
    media.addEventListener('timeupdate', handleProgress);

    return () => {
      media.removeEventListener('loadedmetadata', handleProgress);
      media.removeEventListener('timeupdate', handleProgress);
    };
  }, [media]);

  return progress;
};
