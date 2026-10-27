import { useMemo } from 'react';
import ThemeSwitcher from '../../components/theme-switcher.js';

let buddyFeedClassName = '';

export const useConfig = () => {
  const portalsConfig = useMemo(
    () =>
      new Map([
        [
          '#global-nav-bar .zCtF8mVXUNCbStNrzrkU',
          [
            {
              id: 'theme-switcher',
              Component: ThemeSwitcher,
              props: {
                plain: true,
                get className() {
                  if (!buddyFeedClassName) {
                    const buddyFeed = document.querySelector(
                      '[data-restore-focus-key="buddy_feed"]'
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
