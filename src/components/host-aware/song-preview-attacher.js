import { memo, useMemo } from '@/lib/react.js';
import { createPortal } from '@/lib/react-dom.js';
import { useDOMFinder } from '@/hooks/utils/use-dom-finder.js';
import { useQueue } from '@/hooks/host/use-queue.js';
import { useSongPreviewConfig } from '@/hooks/config/use-song-preview.js';

const SongPreviewAttacher = memo(
  ({
    initialConfig,
    containerSelector,
    prevSelector,
    nextSelector,
  }) => {
    const queue = useQueue();

    const [
      { text: prevTrack, ...prevConfig },
      { text: nextTrack, ...nextConfig },
    ] = useSongPreviewConfig({
      initialConfig,
      isControllable: false,
      queue,
    });

    const selectors = useMemo(
      () => [prevSelector, nextSelector],
      [prevSelector, nextSelector]
    );

    const {
      [prevSelector]: prevMountPoint,
      [nextSelector]: nextMountPoint,
    } = useDOMFinder({
      rootSelector: containerSelector,
      selectors,
    });

    return (
      <>
        {prevMountPoint &&
          createPortal(
            <span {...prevConfig}>{prevTrack}</span>,
            prevMountPoint
          )}
        {nextMountPoint &&
          createPortal(
            <span {...nextConfig}>{nextTrack}</span>,
            nextMountPoint
          )}
      </>
    );
  }
);

export default SongPreviewAttacher;
