import { useCallback, useEffect, useRef } from 'react';
import {
  ContextMenu,
  GraphQL,
  originPlayer,
  showNotification,
  SVGIcons,
  URI,
} from '@/lib/spicetify.js';
import { usePlayStatus } from '@/hooks/host/use-play-status.js';
import TrackPeek from '@/components/host-aware/track-peek.js';

const App = () => {
  const playStatus = usePlayStatus({ includeBuffering: false });
  const audioRef = useRef(null);
  const isAudioActiveRef = useRef(false);
  const shouldResumePlayRef = useRef(false);
  const cacheMapRef = useRef(null);

  const cleanAudio = useCallback(() => {
    isAudioActiveRef.current = false;
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

  useEffect(() => {
    audioRef.current = new Audio();
    cacheMapRef.current = new Map();

    const MENU_ITEM_NAME = 'Track peek';
    const MAX_CACHE_SIZE = 1000;
    let clickId = 0;

    const onMenuItemClick = async ([trackUri]) => {
      const currentClickId = ++clickId;
      if (!audioRef.current.onended && !originPlayer._state.isPaused) {
        shouldResumePlayRef.current = true;
        originPlayer.pause();
      }
      cleanAudio();
      isAudioActiveRef.current = true;

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
            let previewUrl = '';
            if (
              previewOffset < feedItems.length &&
              feedData?.uri === track.uri
            ) {
              previewOffset++;
              const url =
                feedData?.previews?.audioPreviews?.items?.[0]?.url;
              if (url) previewUrl = url;
            }
            cacheMapRef.current.set(track.uri, previewUrl);
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
        const src = cacheMapRef.current.get(trackUri);
        if (!src) {
          showNotification('[Track Peek]: No audio preview available.');
          cleanAudio();
          autoResumePlay();
          return;
        }
        audioRef.current.src = src;
        audioRef.current.onended = () => {
          cleanAudio();
          autoResumePlay();
        };
        audioRef.current.play().catch((error) => {
          console.warn('[Track Peek]:', error.message);
        });
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

  return (
    <TrackPeek
      containerSelector=".Root__now-playing-bar"
      prevSelector="[data-testid='control-button-skip-back']"
      nextSelector="[data-testid='control-button-skip-forward']"
    />
  );
};

export default App;
