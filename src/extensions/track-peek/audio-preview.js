import { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { originPlayer, SVGIcons } from '@/lib/spicetify.js';
import { TooltipWrapper } from '@/lib/host-components.js';
import { MEDIA_STATUS } from '@/config/constants.js';
import { useAudioPreview } from './use-audio-preview.js';
import SVGButton from '@/components/shared/svg-button.js';
import { ProgressCircle } from '@/components/shared/progress/index.js';
import './audio-preview.css';

const activeClassName = 'tp-audio-preview-active';
const inClassName = 'tp-audio-preview-in';

const AudioPreview = ({ container, playStatus }) => {
  const [isRendered, setIsRendered] = useState(false);

  const { status, track, progress, exit } = useAudioPreview({
    playStatus,
    onStart: () => setIsRendered(true),
  });

  const handleTransitionEnd = (event) => {
    if (
      event.target !== event.currentTarget ||
      event.propertyName !== 'opacity' ||
      container.classList.contains(inClassName)
    ) {
      return;
    }
    setIsRendered(false);
    container.classList.remove(activeClassName);
  };

  useLayoutEffect(() => {
    if (!container || status === MEDIA_STATUS.IDLE) return;
    container.classList.add(activeClassName);
    const rafId = requestAnimationFrame(() =>
      container.classList.add(inClassName)
    );
    return () => {
      cancelAnimationFrame(rafId);
      container.classList.remove(inClassName);
    };
  }, [container, status]);

  const disabled = status !== MEDIA_STATUS.PLAYING;

  const generalControls = [
    {
      icon: 'addToQueue',
      label: 'Add to queue',
      onClick: async () => {
        await originPlayer.addToQueue([{ uri: track.trackUri }]);
        exit();
      },
      disabled,
    },
    {
      icon: 'play',
      label: 'Play now',
      onClick: async () => {
        await originPlayer.playAsNextInQueue([{ uri: track.trackUri }]);
      },
      disabled,
    },
  ];

  return (
    container &&
    isRendered &&
    createPortal(
      <div
        className="tp-audio-preview"
        onTransitionEnd={handleTransitionEnd}
      >
        <TooltipWrapper
          label={
            <>
              {track?.name}
              {track?.artists && (
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--spice-subtext)',
                  }}
                >{` · ${track.artists.join(', ')}`}</span>
              )}
            </>
          }
          placement="top"
          disabled={disabled}
        >
          <div className="tp-audio-preview-metadata">
            <div className="tp-audio-preview-cover">
              {track?.coverUrl && (
                <img
                  src={track.coverUrl}
                  alt="cover"
                  width={24}
                  height={24}
                />
              )}
            </div>
            <span className="tp-audio-preview-title">
              {track?.name ?? 'Loading...'}
            </span>
          </div>
        </TooltipWrapper>
        <div className="tp-audio-preview-controls">
          {generalControls.map(
            ({ icon, label, onClick, disabled = false }) => (
              <SVGButton
                key={label}
                icon={SVGIcons[icon]}
                tooltipProps={{ label }}
                disabled={disabled}
                onClick={onClick}
              />
            )
          )}
          <ProgressCircle size={26} progress={progress}>
            <SVGButton
              icon={SVGIcons.pause}
              svgProps={{ width: 12, height: 12 }}
              tooltipProps={{ label: 'Stop' }}
              onClick={exit}
            />
          </ProgressCircle>
        </div>
      </div>,
      container
    )
  );
};

export default AudioPreview;
