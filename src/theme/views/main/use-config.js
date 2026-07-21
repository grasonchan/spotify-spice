import { useMemo } from 'react';
import ThemeSwitcher from '../../components/theme-switcher.js';

let buddyFeedClassName = '';

export const useConfig = () => {
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
