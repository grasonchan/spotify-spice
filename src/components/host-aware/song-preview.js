import { forwardRef, memo } from '@/lib/react.js';
import { createPortal } from '@/lib/react-dom.js';
import { classnames, originPlayer } from '@/lib/spicetify.js';
import { useQueue } from '@/hooks/host/use-queue.js';
import { useSongPreviewConfig } from '@/hooks/config/use-song-preview.js';
import SVGButton from '../shared/svg-button.js';
import './song-preview.css';

const SongPreview = memo(
  forwardRef(
    ({ initialConfig, containerClassName, mountPoints }, ref) => {
      const isControllable = !mountPoints;

      const queue = useQueue();
      const config = useSongPreviewConfig({
        initialConfig,
        isControllable,
        queue,
        restrictions: originPlayer._state.restrictions,
      });

      if (!isControllable) {
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
      }

      return (
        <div
          ref={ref}
          className={classnames('song-preview', containerClassName)}
        >
          {config.map(({ key, ...restProps }) => (
            <SVGButton key={key} {...restProps} />
          ))}
        </div>
      );
    }
  )
);

export default SongPreview;
