import { memo } from '@/lib/react.js';
import { createPortal } from '@/lib/react-dom.js';
import { originPlayer } from '@/lib/spicetify.js';
import { useQueue } from '@/hooks/host/use-queue.js';
import { useSongPreviewConfig } from '@/hooks/config/use-song-preview.js';

const SongPreviewAttacher = memo(({ initialConfig, mountPoints }) => {
  const queue = useQueue();
  const config = useSongPreviewConfig({
    initialConfig,
    isControllable: false,
    queue,
    restrictions: originPlayer._state.restrictions,
  });

  const [
    { text: prevTrack, ...prevConfigItem },
    { text: nextTrack, ...nextConfigItem },
  ] = config;

  return (
    <>
      {mountPoints.prev &&
        createPortal(
          <span {...prevConfigItem}>{prevTrack}</span>,
          mountPoints.prev
        )}
      {mountPoints.next &&
        createPortal(
          <span {...nextConfigItem}>{nextTrack}</span>,
          mountPoints.next
        )}
    </>
  );
});

export default SongPreviewAttacher;
