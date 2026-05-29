import { forwardRef, memo } from 'react';
import { classnames, originPlayer } from '@/lib/spicetify.js';
import { useQueue } from '@/hooks/host/use-queue.js';
import { useSongPreviewConfig } from '@/hooks/config/use-song-preview.js';
import SVGButton from '../shared/svg-button.js';
import './song-preview.css';

const SongPreview = memo(
  forwardRef(({ initialConfig, containerClassName }, ref) => {
    const queue = useQueue();
    const config = useSongPreviewConfig({
      initialConfig,
      queue,
      restrictions: originPlayer._state.restrictions,
    });

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
  })
);

export default SongPreview;
