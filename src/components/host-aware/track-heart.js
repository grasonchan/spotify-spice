import { classnames, Player, SVGIcons } from '@/lib/spicetify.js';
import { HEART_STATUS } from '@/config/constants.js';
import { useHeartStatus } from '@/hooks/host/use-heart-status.js';
import SVGButton from '../shared/svg-button.js';
import './track-heart.css';

const TrackHeart = ({ className, ...restProps } = {}) => {
  const { COLLECTED, DISABLED } = HEART_STATUS;

  const status = useHeartStatus();

  return (
    <SVGButton
      icon={
        status === COLLECTED ? SVGIcons['heart-active'] : SVGIcons.heart
      }
      className={classnames('track-heart', className, {
        checked: status === COLLECTED,
      })}
      {...restProps}
      disabled={status === DISABLED}
      onClick={Player.toggleHeart}
    />
  );
};

export default TrackHeart;
