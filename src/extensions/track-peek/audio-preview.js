import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ContextMenu,
  originPlayer,
  showNotification,
  SVGIcons,
  URI,
} from '@/lib/spicetify.js';
import { TooltipWrapper } from '@/lib/host-components.js';
import { MEDIA_STATUS } from '@/config/constants.js';
import { getTrack, getAlbumFeed } from '@/services/index.js';
import { useVolumeSync } from '@/hooks/host/use-volume-sync.js';
import { useMediaProgress } from '../../hooks/utils/use-media-progress.js';
import SVGButton from '@/components/shared/svg-button.js';
import { ProgressCircle } from '@/components/shared/progress/index.js';
import './audio-preview.css';

const activeClassName = 'tp-audio-preview-active';
const inClassName = 'tp-audio-preview-in';

const AudioPreview = ({ container, playStatus }) => {
  const [status, setStatus] = useState(MEDIA_STATUS.IDLE);
  const [isRendered, setIsRendered] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const audioRef = useRef(null);
  const isAudioActiveRef = useRef(false);
  const snapshotRef = useRef(null);
  const cacheMapRef = useRef(null);

  const progress = useMediaProgress(audioRef.current);

  useVolumeSync((volume) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  });

  const cleanAudio = () => {
    isAudioActiveRef.current = false;
    setStatus(MEDIA_STATUS.IDLE);
    setCurrentTrack(null);
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = '';
    audio.onended = null;
  };

  const interruptPlayback = () => {
    if (snapshotRef.current) return;
    const mainPlaybackStatus = !originPlayer.getState().isPaused;
    if (mainPlaybackStatus) {
      originPlayer.pause();
    }
    const playingMedia = new Set();
    const mediaElements = document.querySelectorAll('video, audio');
    for (const element of mediaElements) {
      if (element.paused || element.ended) continue;
      playingMedia.add(element);
      element.pause();
    }
    snapshotRef.current = {
      mainPlaybackStatus,
      playingMedia,
    };
  };

  const resumePlayback = () => {
    const snapshot = snapshotRef.current;
    if (!snapshot) return;
    if (snapshot.mainPlaybackStatus) {
      originPlayer.resume();
    }
    for (const element of snapshot.playingMedia) {
      if (!element.isConnected) continue;
      element.play().catch(console.warn);
    }
    snapshotRef.current = null;
  };

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

  useEffect(() => {
    audioRef.current = new Audio();
    cacheMapRef.current = new Map();

    const MENU_ITEM_NAME = 'Track peek';
    const MAX_CACHE_SIZE = 1000;
    let clickId = 0;

    const onMenuItemClick = async ([trackUri]) => {
      const currentClickId = ++clickId;
      interruptPlayback();
      cleanAudio();
      isAudioActiveRef.current = true;
      setStatus(MEDIA_STATUS.LOADING);
      setIsRendered(true);

      try {
        if (!cacheMapRef.current.has(trackUri)) {
          const { album } = await getTrack(trackUri);
          const { tracks: feedTracks, album: feedAlbum } =
            await getAlbumFeed(album.uri, album.tracksCount);

          let previewOffset = 0;
          for (let i = 0; i < album.tracks.length; i++) {
            const { track } = album.tracks[i];
            const feedTrack = feedTracks[previewOffset];
            let name = '';
            let artists = [];
            let coverUrl = '';
            let previewUrl = '';
            if (
              previewOffset < feedTracks.length &&
              feedTrack.uri === track.uri
            ) {
              previewOffset++;
              name = feedTrack.name;
              artists = feedTrack.artists.map(({ name }) => name);
              coverUrl = feedAlbum.coverArt[0]?.url;
              const url = feedTrack.audioPreview.url;
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
          resumePlayback();
          return;
        }
        setStatus(MEDIA_STATUS.PLAYING);
        setCurrentTrack({ trackUri, name, artists, coverUrl });
        audioRef.current.src = previewUrl;
        audioRef.current.onended = () => {
          cleanAudio();
          resumePlayback();
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
        resumePlayback();
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
      resumePlayback();
    };
  }, []);

  useEffect(() => {
    if (!playStatus) return;
    snapshotRef.current = null;
    cleanAudio();
  }, [playStatus]);

  useEffect(() => {
    const handleMediaPlay = (event) => {
      if (event.target === audioRef.current) return;
      snapshotRef.current = null;
      cleanAudio();
    };

    document.addEventListener('play', handleMediaPlay, true);
    return () => {
      document.removeEventListener('play', handleMediaPlay, true);
    };
  }, []);

  const disabled = status !== MEDIA_STATUS.PLAYING;

  const generalControls = [
    {
      icon: 'addToQueue',
      label: 'Add to queue',
      onClick: async () => {
        await originPlayer.addToQueue([{ uri: currentTrack.trackUri }]);
        cleanAudio();
        resumePlayback();
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
              onClick={() => {
                cleanAudio();
                resumePlayback();
              }}
            />
          </ProgressCircle>
        </div>
      </div>,
      container
    )
  );
};

export default AudioPreview;
