import { useSyncExternalStore } from 'react';
import { queueGetter } from '@/lib/spicetify.js';
import { queueUpdate } from '@/subscribers/index.js';

export const useQueue = () =>
  useSyncExternalStore(queueUpdate, queueGetter);
