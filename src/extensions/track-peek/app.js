import { useMemo } from 'react';
import { useDOMFinder } from '@/hooks/utils/use-dom-finder.js';
import { usePlayStatus } from '@/hooks/host/use-play-status.js';
import AdjacentTracksPeek from './adjacent-tracks-peek.js';
import AudioPreview from './audio-preview.js';

const App = () => {
  const rootSelector = '.Root__now-playing-bar';
  const prevSelector = "[data-testid='control-button-skip-back']";
  const nextSelector = "[data-testid='control-button-skip-forward']";

  const playStatus = usePlayStatus({ includeBuffering: false });
  const selectors = useMemo(() => [prevSelector, nextSelector], []);
  const {
    [prevSelector]: prevMountPoint,
    [nextSelector]: nextMountPoint,
  } = useDOMFinder({ rootSelector, selectors });

  return (
    <>
      <AdjacentTracksPeek
        prevMountPoint={prevMountPoint}
        nextMountPoint={nextMountPoint}
      />
      <AudioPreview playStatus={playStatus} />
    </>
  );
};

export default App;
