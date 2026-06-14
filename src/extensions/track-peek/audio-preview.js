import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  ContextMenu,
  GraphQL,
  originPlayer,
  showNotification,
  SVGIcons,
  URI,
} from '@/lib/spicetify.js';
import { TooltipWrapper } from '@/lib/host-components.js';
import { AUDIO_PREVIEW_STATUS } from '@/config/constants.js';
import SVGButton from '@/components/shared/svg-button.js';
import './audio-preview.css';

const activeClassName = 'tp-audio-preview-active';
const inClassName = 'tp-audio-preview-in';

const AudioPreview = ({ container, playStatus }) => {
  const [status, setStatus] = useState(AUDIO_PREVIEW_STATUS.IDLE);
  const [isRendered, setIsRendered] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const audioRef = useRef(null);
  const isAudioActiveRef = useRef(false);
  const shouldResumePlayRef = useRef(false);
  const cacheMapRef = useRef(null);

  const cleanAudio = useCallback(() => {
    isAudioActiveRef.current = false;
    setStatus(AUDIO_PREVIEW_STATUS.IDLE);
    setCurrentTrack(null);
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = '';
    audio.onended = null;
  }, []);

  const autoResumePlay = useCallback(() => {
    if (!shouldResumePlayRef.current) return;
    shouldResumePlayRef.current = false;
    originPlayer.resume();
  }, []);

  const handleTransitionEnd = useCallback(
    (event) => {
      if (
        event.target !== event.currentTarget ||
        event.propertyName !== 'opacity' ||
        container.classList.contains(inClassName)
      ) {
        return;
      }
      setIsRendered(false);
      container.classList.remove(activeClassName);
    },
    [container]
  );

  useLayoutEffect(() => {
    if (!container || status === AUDIO_PREVIEW_STATUS.IDLE) return;
    container.classList.add(activeClassName);
    const rafId = requestAnimationFrame(() =>
      container.classList.add(inClassName)
    );
    return () => {
      cancelAnimationFrame(rafId);
      container.classList.remove(inClassName);
    };
  }, [container, status]);

  useEffect(() => {
    audioRef.current = new Audio();
    cacheMapRef.current = new Map();

    const MENU_ITEM_NAME = 'Track peek';
    const MAX_CACHE_SIZE = 1000;
    let clickId = 0;

    const onMenuItemClick = async ([trackUri]) => {
      const currentClickId = ++clickId;
      if (!isAudioActiveRef.current && !originPlayer._state.isPaused) {
        shouldResumePlayRef.current = true;
        originPlayer.pause();
      }
      cleanAudio();
      isAudioActiveRef.current = true;
      setStatus(AUDIO_PREVIEW_STATUS.LOADING);
      setIsRendered(true);

      try {
        if (!cacheMapRef.current.has(trackUri)) {
          const {
            data: { trackUnion },
          } = await GraphQL.Request(GraphQL.Definitions.getTrack, {
            uri: trackUri,
          });

          const {
            data: { getWatchFeedForEntity },
          } = await GraphQL.Request(
            GraphQL.Definitions.watchFeedEntity,
            {
              watchFeedUri: `spotify:watch-feed:album:${trackUnion.albumOfTrack.id}`,
              limit: trackUnion.albumOfTrack.tracks?.totalCount,
              offset: 0,
            }
          );

          const albumTracks =
            trackUnion.albumOfTrack.tracks.items ?? [];
          const feedItems = getWatchFeedForEntity.items ?? [];
          let previewOffset = 0;
          for (let i = 0; i < albumTracks.length; i++) {
            const { track } = albumTracks[i];
            const feedData = feedItems[previewOffset]?.data;
            let name = '';
            let artists = [];
            let coverUrl = '';
            let previewUrl = '';
            if (
              previewOffset < feedItems.length &&
              feedData?.uri === track.uri
            ) {
              previewOffset++;
              name = feedData.name;
              artists = feedData.artists.items.map(
                ({ profile }) => profile.name
              );
              coverUrl = feedData.albumOfTrack.coverArt.sources[0].url;
              const url =
                feedData?.previews?.audioPreviews?.items?.[0]?.url;
              if (url) previewUrl = url;
            }
            cacheMapRef.current.set(track.uri, {
              name,
              artists,
              coverUrl,
              previewUrl,
            });
          }

          const overflowCount =
            cacheMapRef.current.size - MAX_CACHE_SIZE;
          if (overflowCount > 0) {
            const iterator = cacheMapRef.current.keys();
            for (let i = 0; i < overflowCount; i++) {
              cacheMapRef.current.delete(iterator.next().value);
            }
          }
        }

        if (!(isAudioActiveRef.current && clickId === currentClickId))
          return;
        const { name, artists, coverUrl, previewUrl } =
          cacheMapRef.current.get(trackUri) ?? {};
        if (!previewUrl) {
          showNotification('[Track Peek]: No audio preview available.');
          cleanAudio();
          autoResumePlay();
          return;
        }
        setStatus(AUDIO_PREVIEW_STATUS.PLAYING);
        setCurrentTrack({ trackUri, name, artists, coverUrl });
        audioRef.current.src = previewUrl;
        audioRef.current.onended = () => {
          cleanAudio();
          autoResumePlay();
        };
        await audioRef.current.play();
      } catch (error) {
        if (!(isAudioActiveRef.current && clickId === currentClickId))
          return;
        console.error('[Track Peek]:', error);
        showNotification(
          '[Track Peek]: Failed to load audio preview.',
          true
        );
        cleanAudio();
        autoResumePlay();
      }
    };

    const menuItem = new ContextMenu.Item(
      MENU_ITEM_NAME,
      onMenuItemClick,
      ([uri]) =>
        URI.isTrack(uri) &&
        !document.querySelector('[data-testid="watch-feed-view"]'),
      SVGIcons.nowPlaying
    );
    menuItem.register();

    return () => {
      menuItem.deregister();
      cleanAudio();
      autoResumePlay();
    };
  }, [autoResumePlay, cleanAudio]);

  useEffect(() => {
    if (!playStatus) return;
    shouldResumePlayRef.current = false;
    cleanAudio();
  }, [playStatus, cleanAudio]);

  useEffect(() => {
    const handleMediaPlay = (event) => {
      if (event.target === audioRef.current) return;
      shouldResumePlayRef.current = false;
      cleanAudio();
    };

    document.addEventListener('play', handleMediaPlay, true);
    return () => {
      document.removeEventListener('play', handleMediaPlay, true);
    };
  }, [cleanAudio]);

  const disabled = status !== AUDIO_PREVIEW_STATUS.PLAYING;

  const controlsData = [
    {
      icon: 'addToQueue',
      label: 'Add to queue',
      onClick: async () => {
        await originPlayer.addToQueue([{ uri: currentTrack.trackUri }]);
        cleanAudio();
        autoResumePlay();
      },
      disabled,
    },
    {
      icon: 'play',
      label: 'Play now',
      onClick: async () => {
        await originPlayer.playAsNextInQueue([
          { uri: currentTrack.trackUri },
        ]);
      },
      disabled,
    },
    {
      icon: 'pause',
      label: 'Stop',
      onClick: () => {
        cleanAudio();
        autoResumePlay();
      },
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
              {currentTrack?.name}
              {currentTrack?.artists && (
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--spice-subtext)',
                  }}
                >{` · ${currentTrack.artists.join(', ')}`}</span>
              )}
            </>
          }
          placement="top"
          disabled={disabled}
        >
          <div className="tp-audio-preview-metadata">
            <div className="tp-audio-preview-cover">
              {currentTrack?.coverUrl && (
                <img
                  src={currentTrack.coverUrl}
                  alt="cover"
                  width={24}
                  height={24}
                />
              )}
            </div>
            <span className="tp-audio-preview-title">
              {currentTrack?.name ?? 'Loading...'}
            </span>
          </div>
        </TooltipWrapper>
        <div className="tp-audio-preview-controls">
          {controlsData.map(
            ({ icon, label, onClick, disabled = false }) => (
              <SVGButton
                key={label}
                icon={SVGIcons[icon]}
                onClick={onClick}
                tooltipProps={{ label }}
                disabled={disabled}
              />
            )
          )}
        </div>
      </div>,
      container
    )
  );
};

export default AudioPreview;
