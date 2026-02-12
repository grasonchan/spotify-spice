import { useSyncExternalStore } from '../../lib/react.js';
import { originPlayer } from '../../lib/spicetify.js';
import { getHeartStatus } from '../../utils/track.js';
import { playerUpdate } from '../../subscribe/host.js';

export const useHeartStatus = () =>
  useSyncExternalStore(playerUpdate, () =>
    getHeartStatus(originPlayer._state)
  );
