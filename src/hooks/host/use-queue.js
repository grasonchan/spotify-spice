import { useSyncExternalStore } from '@/lib/react.js';
import { queueGetter } from '@/lib/spicetify.js';
import { queueUpdate } from '@/subscribe/host.js';

export const useQueue = () =>
  useSyncExternalStore(queueUpdate, queueGetter);
