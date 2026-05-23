import { useMemo } from '@/lib/react.js';
import { createPortal } from '@/lib/react-dom.js';
import { classnames, SVGIcons } from '@/lib/spicetify.js';
import { TooltipWrapper } from '@/lib/host-components.js';
import { GREETING, NO_MORE_TRACKS } from '@/config/constants.js';
import { getAdjacentTracks } from '@/utils/track.js';
import { useDOMFinder } from '@/hooks/utils/use-dom-finder.js';
import { useQueue } from '@/hooks/host/use-queue.js';
import './song-preview-attacher.css';

const AttacherItem = ({
  metadata,
  className,
  style = {},
  tooltipProps = {},
}) => {
  const isEmpty = !metadata;
  const { title, artist_name, image_url } = metadata ?? {};

  return (
    <TooltipWrapper
      label={
        isEmpty ? (
          NO_MORE_TRACKS
        ) : (
          <>
            {title}
            {artist_name && (
              <span
                style={{ fontSize: 12, color: 'var(--spice-subtext)' }}
              >{` · ${artist_name}`}</span>
            )}
          </>
        )
      }
      placement="top"
      {...tooltipProps}
    >
      <div
        className={classnames('song-preview-attacher', className)}
        style={style}
      >
        {!image_url ? (
          <svg
            width={24}
            height={24}
            viewBox="0 0 16 16"
            fill={isEmpty ? 'var(--spice-button)' : 'currentColor'}
            dangerouslySetInnerHTML={{
              __html: SVGIcons.spotify,
            }}
          />
        ) : (
          <img
            src={image_url}
            alt="cover"
            width={24}
            height={24}
            className="attacher-track-image"
          />
        )}
        <span className="attacher-track-title">
          {isEmpty ? GREETING : title}
        </span>
      </div>
    </TooltipWrapper>
  );
};

const SongPreviewAttacher = ({
  containerSelector,
  prevSelector,
  nextSelector,
  className,
  style,
  tooltipProps = {},
}) => {
  const selectors = useMemo(
    () => [prevSelector, nextSelector],
    [prevSelector, nextSelector]
  );

  const queue = useQueue();
  const {
    [prevSelector]: prevMountPoint,
    [nextSelector]: nextMountPoint,
  } = useDOMFinder({ rootSelector: containerSelector, selectors });

  const { prevTrack, nextTrack } = getAdjacentTracks(
    queue,
    ({ contextTrack: { metadata } }) => metadata
  );

  const data = [
    {
      id: 'prev',
      mountPoint: prevMountPoint,
      metadata: prevTrack,
      defaultClassName: 'prev-attacher',
    },
    {
      id: 'next',
      mountPoint: nextMountPoint,
      metadata: nextTrack,
      defaultClassName: 'next-attacher',
    },
  ];

  return (
    <>
      {data.map(({ id, mountPoint, defaultClassName, metadata }) => {
        if (!mountPoint) return null;
        return createPortal(
          <AttacherItem
            className={classnames(defaultClassName, className)}
            style={style}
            tooltipProps={tooltipProps}
            metadata={metadata}
          />,
          mountPoint,
          id
        );
      })}
    </>
  );
};

export default SongPreviewAttacher;
