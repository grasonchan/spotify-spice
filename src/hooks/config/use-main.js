import { useMemo } from '@/lib/react.js';
import ThemeSwitcher from '@/components/shared/theme-switcher.js';
import SongPreview from '@/components/host-aware/song-preview.js';

export const useMainConfig = () => {
  const portalsConfig = useMemo(
    () =>
      new Map([
        [
          '#global-nav-bar .main-actionButtons',
          [
            {
              id: 'theme-switcher',
              Component: ThemeSwitcher,
              props: {
                className: 'main-topBar-buddyFeed',
              },
            },
          ],
        ],
        [
          '[data-testid="now-playing-bar"]',
          [
            {
              id: 'main-song-preview',
              Component: SongPreview,
              props: {
                containerClassName: 'main-song-preview',
              },
            },
          ],
        ],
      ]),
    []
  );

  const rootSelector = '#main';
  const selectors = useMemo(
    () => Array.from(portalsConfig.keys()),
    [portalsConfig]
  );

  return {
    portalsConfig,
    rootSelector,
    selectors,
  };
};
