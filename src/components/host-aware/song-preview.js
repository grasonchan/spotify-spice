import {
  Fragment,
  createElement,
  forwardRef,
  memo,
} from '../../lib/react.js';
import { createPortal } from '../../lib/react-dom.js';
import { classnames, originPlayer } from '../../lib/spicetify.js';
import { useQueue } from '../../hooks/host/use-queue.js';
import { useSongPreviewConfig } from '../../hooks/config/use-song-preview.js';
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

        return createElement(
          Fragment,
          null,
          mountPoints.prev &&
            createPortal(
              createElement('span', prevConfigItem, prevTrack),
              mountPoints.prev
            ),
          mountPoints.next &&
            createPortal(
              createElement('span', nextConfigItem, nextTrack),
              mountPoints.next
            )
        );
      }

      return createElement(
        'div',
        {
          ref,
          className: classnames('song-preview', containerClassName),
        },
        config.map((item) => createElement(SVGButton, item))
      );
    }
  )
);

export default SongPreview;
