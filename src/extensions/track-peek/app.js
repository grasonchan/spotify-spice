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

    const MENU_ITEM_NAME = 'Track peek';
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
        const {
          data: { trackUnion },
        } = await GraphQL.Request(GraphQL.Definitions.getTrack, {
          uri: trackUri,
        });

        const {
          data: { getWatchFeedForEntity },
        } = await GraphQL.Request(GraphQL.Definitions.watchFeedEntity, {
          watchFeedUri: `spotify:watch-feed:album:${trackUnion.albumOfTrack.id}`,
          limit: trackUnion.albumOfTrack.tracks?.totalCount,
          offset: 0,
        });

        if (!(isAudioActiveRef.current && clickId === currentClickId))
          return;
        const targetItem = getWatchFeedForEntity.items.find(
          ({ data }) => data.uri === trackUri
        );
        const src =
          targetItem?.data?.previews?.audioPreviews?.items?.[0]?.url;
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
