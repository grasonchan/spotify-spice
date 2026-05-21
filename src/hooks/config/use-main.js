import { useMemo } from '@/lib/react.js';
import ThemeSwitcher from '@/components/shared/theme-switcher.js';
import SongPreview from '@/components/host-aware/song-preview.js';

let buddyFeedClassName = '';

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
                plain: true,
                get className() {
                  if (!buddyFeedClassName) {
                    const buddyFeed = document.querySelector(
                      '.main-topBar-buddyFeed'
                    );
                    buddyFeedClassName =
                      buddyFeed?.className ?? buddyFeedClassName;
                  }
                  return buddyFeedClassName;
                },
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
