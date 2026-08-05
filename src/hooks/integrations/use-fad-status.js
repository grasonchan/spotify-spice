import { useSyncExternalStore } from 'react';
import { fadRequest } from '@/subscribers/index.js';

export const useFADStatus = () =>
  useSyncExternalStore(fadRequest, () =>
    document.body.classList.contains('fad-activated')
  );
