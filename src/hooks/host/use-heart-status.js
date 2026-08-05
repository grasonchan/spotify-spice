import { useSyncExternalStore } from 'react';
import { originPlayer } from '@/lib/spicetify.js';
import { getHeartStatus } from '@/utils/track.js';
import { playerUpdate } from '@/subscribers/index.js';

export const useHeartStatus = () =>
  useSyncExternalStore(playerUpdate, () =>
    getHeartStatus(originPlayer._state)
  );
