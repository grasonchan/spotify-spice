import {
  classnames,
  originPlayer,
  Player,
  SVGIcons,
} from '@/lib/spicetify.js';
import { getAdjacentTracks } from '@/utils/track.js';
import { useQueue } from '@/hooks/host/use-queue.js';
import SVGButton from '@/components/shared/svg-button.js';
import './adjacent-tracks-peek.standalone.css';

const AdjacentTracksPeekStandalone = ({ className, style }) => {
  const queue = useQueue();

  const { canSkipPrevious = true, canSkipNext = true } =
    originPlayer.getState().restrictions ?? {};

  const { prevTrack, nextTrack } = getAdjacentTracks(
    queue,
    ({ contextTrack: { metadata } }) => metadata.title
  );

  const data = [
    {
      id: 'prev',
      text: prevTrack,
      icon: SVGIcons['chevron-left'],
      onClick: Player.back,
      disabled: !canSkipPrevious,
    },
    {
      id: 'next',
      text: nextTrack,
      icon: SVGIcons['chevron-right'],
      svgPriority: false,
      onClick: Player.next,
      disabled: !canSkipNext,
    },
  ];

  return (
    <div
      className={classnames(
        'adjacent-tracks-peek-standalone',
        className
      )}
      style={style}
    >
      {data.map(({ id, ...restProps }) => (
        <SVGButton
          key={id}
          className="adjacent-tracks-peek-standalone__item"
          svgProps={{ width: 10, height: 10 }}
          {...restProps}
        />
      ))}
    </div>
  );
};

export default AdjacentTracksPeekStandalone;
