import { useSyncExternalStore } from '../../lib/react.js';
import { fadRequest } from '../../subscribe/host.js';

export const useFADStatus = () =>
  useSyncExternalStore(fadRequest, () =>
    document.body.classList.contains('fad-activated')
  );
