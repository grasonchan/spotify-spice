import { useSyncExternalStore } from 'react';
import { originPlayer } from '@/lib/spicetify.js';
import { getPlayStatus } from '@/utils/track.js';
import { playerUpdate } from '@/subscribers/index.js';

export const usePlayStatus = ({ includeBuffering } = {}) =>
  useSyncExternalStore(playerUpdate, () =>
    getPlayStatus(originPlayer._state, includeBuffering)
  );
