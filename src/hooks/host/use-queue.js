import { useSyncExternalStore } from 'react';
import { queueGetter } from '@/lib/spicetify.js';
import { queueUpdate } from '@/subscribe/host.js';

export const useQueue = () =>
  useSyncExternalStore(queueUpdate, queueGetter);
