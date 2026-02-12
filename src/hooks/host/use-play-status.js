import { useSyncExternalStore } from '../../lib/react.js';
import { originPlayer } from '../../lib/spicetify.js';
import { getPlayStatus } from '../../utils/track.js';
import { playerUpdate } from '../../subscribe/host.js';

export const usePlayStatus = () =>
  useSyncExternalStore(playerUpdate, () =>
    getPlayStatus(originPlayer._state)
  );
