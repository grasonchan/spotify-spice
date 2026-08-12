import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ContextMenu,
  SVGIcons,
  URI,
  originPlayer,
  showNotification,
} from '@/lib/spicetify.js';
import { MEDIA_STATUS } from '@/config/constants.js';
import { getTrack, getAlbumFeed } from '@/services/index.js';
import { useMediaProgress } from '@/hooks/utils/use-media-progress.js';
import { useVolumeSync } from '@/hooks/host/use-volume-sync.js';

export const useAudioPreview = ({ playStatus, onStart, onEnd }) => {
  const [status, setStatus] = useState(MEDIA_STATUS.IDLE);
  const [track, setTrack] = useState(null);
  const audioRef = useRef(null);
  const isAudioActiveRef = useRef(false);
  const snapshotRef = useRef(null);
  const cacheMapRef = useRef(null);

  const onStartRef = useRef(onStart);
  const onEndRef = useRef(onEnd);
  onStartRef.current = onStart;
  onEndRef.current = onEnd;

  if (!audioRef.current) {
    audioRef.current = new Audio();
  }
  if (!cacheMapRef.current) {
    cacheMapRef.current = new Map();
  }

  const cleanAudio = () => {
    isAudioActiveRef.current = false;
    setStatus(MEDIA_STATUS.IDLE);
    setTrack(null);
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = '';
      audio.onended = null;
    }
    onEndRef.current?.();
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

  const exit = useCallback(() => {
    cleanAudio();
    resumePlayback();
  }, []);

  const progress = useMediaProgress(audioRef.current);

  useVolumeSync((volume) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  });

  useEffect(() => {
    const MENU_ITEM_NAME = 'Track peek';
    const MAX_CACHE_SIZE = 1000;
    let clickId = 0;

    const onMenuItemClick = async ([trackUri]) => {
      const currentClickId = ++clickId;
      interruptPlayback();
      cleanAudio();
      isAudioActiveRef.current = true;
      setStatus(MEDIA_STATUS.LOADING);
      onStartRef.current?.();

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
          exit();
          return;
        }
        setStatus(MEDIA_STATUS.PLAYING);
        setTrack({ trackUri, name, artists, coverUrl });
        audioRef.current.src = previewUrl;
        audioRef.current.onended = exit;
        await audioRef.current.play();
      } catch (error) {
        if (!(isAudioActiveRef.current && clickId === currentClickId))
          return;
        console.error('[Track Peek]:', error);
        showNotification(
          '[Track Peek]: Failed to load audio preview.',
          true
        );
        exit();
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
      exit();
    };
  }, [exit]);

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

  return {
    status,
    track,
    progress,
    exit,
  };
};
