import { forwardRef, memo } from 'react';
import { classnames, originPlayer } from '@/lib/spicetify.js';
import { useQueue } from '@/hooks/host/use-queue.js';
import { useAdjacentTracksPeekStandalone } from './use-adjacent-tracks-peek.standalone.js';
import SVGButton from '@/components/shared/svg-button.js';
import './adjacent-tracks-peek.standalone.css';

const AdjacentTracksPeekStandalone = memo(
  forwardRef(({ initialConfig, containerClassName }, ref) => {
    const queue = useQueue();
    const config = useAdjacentTracksPeekStandalone({
      initialConfig,
      queue,
      restrictions: originPlayer._state.restrictions,
    });

    return (
      <div
        ref={ref}
        className={classnames(
          'adjacent-tracks-peek-standalone',
          containerClassName
        )}
      >
        {config.map(({ key, ...restProps }) => (
          <SVGButton key={key} {...restProps} />
        ))}
      </div>
    );
  })
);

export default AdjacentTracksPeekStandalone;
