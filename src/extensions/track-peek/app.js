import { concernedCLIConfig } from '@/config/cli.js';
import { useDOMFinder } from '@/hooks/utils/use-dom-finder.js';
import { usePlayStatus } from '@/hooks/host/use-play-status.js';
import AdjacentTracksPeekNPB from './adjacent-tracks-peek-npb.js';
import AudioPreview from './audio-preview.js';
import FAD from './fad.js';

const { exts } = concernedCLIConfig;

const rootSelector = '.Root__now-playing-bar';
const prevSelector = "[data-testid='control-button-skip-back']";
const nextSelector = "[data-testid='control-button-skip-forward']";
const playerControlsSelector = '[data-testid="general-controls"]';

const selectors = [prevSelector, nextSelector, playerControlsSelector];

const App = () => {
  const playStatus = usePlayStatus({ includeBuffering: false });
  const {
    [prevSelector]: prevMountPoint,
    [nextSelector]: nextMountPoint,
    [playerControlsSelector]: playerControls,
  } = useDOMFinder({ rootSelector, selectors });

  return (
    <>
      <AdjacentTracksPeekNPB
        prevMountPoint={prevMountPoint}
        nextMountPoint={nextMountPoint}
      />
      <AudioPreview
        container={playerControls}
        playStatus={playStatus}
      />
      {exts.fullAppDisplay && <FAD playerControls={playerControls} />}
    </>
  );
};

export default App;
