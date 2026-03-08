import { useEffect } from '@/lib/react.js';
import { LEGACY_CONFIG_KEY } from '@/config/constants.js';

export const useLegacyCleaner = () => {
  useEffect(() => {
    localStorage.removeItem(LEGACY_CONFIG_KEY);
  }, []);
};
