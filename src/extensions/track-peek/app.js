import { concernedCLIConfig } from '@/config/cli.js';
import { useDOMFinder } from '@/hooks/utils/use-dom-finder.js';
import { usePlayStatus } from '@/hooks/host/use-play-status.js';
import AdjacentTracksPeek from './adjacent-tracks-peek.js';
import AudioPreview from './audio-preview.js';
import FAD from './fad.js';

const { exts } = concernedCLIConfig;

const rootSelector = '.Root__now-playing-bar';
const prevSelector = "[data-testid='control-button-skip-back']";
const nextSelector = "[data-testid='control-button-skip-forward']";
const generalControlsSelector = '[data-testid="general-controls"]';

const selectors = [prevSelector, nextSelector, generalControlsSelector];

const App = () => {
  const playStatus = usePlayStatus({ includeBuffering: false });
  const {
    [prevSelector]: prevMountPoint,
    [nextSelector]: nextMountPoint,
    [generalControlsSelector]: generalControls,
  } = useDOMFinder({ rootSelector, selectors });

  return (
    <>
      <AdjacentTracksPeek
        prevMountPoint={prevMountPoint}
        nextMountPoint={nextMountPoint}
      />
      <AudioPreview
        container={generalControls}
        playStatus={playStatus}
      />
      {exts.fullAppDisplay && <FAD />}
    </>
  );
};

export default App;
