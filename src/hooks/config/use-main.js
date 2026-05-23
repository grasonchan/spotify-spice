import { useMemo } from '@/lib/react.js';
import ThemeSwitcher from '@/components/shared/theme-switcher.js';
import SongPreviewAttacher from '@/components/host-aware/song-preview-attacher.js';

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
          '[data-testid="general-controls"]',
          [
            {
              id: 'main-song-preview',
              Component: SongPreviewAttacher,
              props: {
                containerSelector: '[data-testid="general-controls"]',
                prevSelector:
                  '[data-testid="control-button-skip-back"]',
                nextSelector:
                  '[data-testid="control-button-skip-forward"]',
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
