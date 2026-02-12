import {
  Fragment,
  createElement,
  useState,
  useRef,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from './lib/react.js';
import { createPortal } from './lib/react-dom.js';
import { CONFIG_KEY, THEMES } from './config/constants.js';
import { concernedCLIConfig } from './config/cli.js';
import ThemeContext from './context/theme.js';
import { useDOMFinder } from './hooks/utils/use-dom-finder.js';
import { useLegacyCleaner } from './hooks/utils/use-legacy-cleaner.js';
import { useFADStatus } from './hooks/host/use-fad-status.js';
import { useTurntablePlayState } from './hooks/features/use-turntable-play-state.js';
import { useFADSideEffect } from './hooks/features/use-fad-side-effect.js';
import ThemeSwitcher from './components/shared/theme-switcher.js';
import TrackHeart from './components/host-aware/track-heart.js';
import SongPreview from './components/host-aware/song-preview.js';

const useMainPortalsConfig = () => {
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

const MainPortals = () => {
  const portalsMapRef = useRef(null);

  const getPortalsMap = useCallback(() => {
    if (portalsMapRef.current !== null) {
      return portalsMapRef.current;
    }
    const portalsMap = new Map();
    portalsMapRef.current = portalsMap;
    return portalsMap;
  }, []);

  const findEnhancer = useCallback(
    ({ selector, element: container, records }) => {
      const isConcernedMutation = records.some(
        ({ target, removedNodes }) =>
          target.matches(selector) && removedNodes.length
      );
      if (!isConcernedMutation) return;
      const nodes = getPortalsMap().get(container);
      if (!nodes) return;
      const lostNodes = [...nodes].filter(
        (node) => !container.contains(node)
      );
      if (lostNodes.length)
        return {
          container,
          lostNodes,
        };
    },
    [getPortalsMap]
  );

  const handleFindEnhancerHit = useCallback((data) => {
    data.forEach(({ container, lostNodes }) => {
      container.append(...lostNodes);
    });
  }, []);

  const { portalsConfig, rootSelector, selectors } =
    useMainPortalsConfig();
  const containers = useDOMFinder({
    rootSelector,
    selectors,
    findEnhancer,
    onFindEnhancerHit: handleFindEnhancerHit,
  });

  useEffect(
    () => () => {
      portalsMapRef.current.clear();
      portalsMapRef.current = null;
    },
    []
  );

  return createElement(
    Fragment,
    null,
    selectors.map((selector) => {
      const container = containers[selector];
      if (!container) return null;
      const portalsMap = getPortalsMap();
      return portalsConfig
        .get(selector)
        .map(({ id, Component, props = {} }) =>
          createPortal(
            createElement(Component, {
              ...props,
              ref: (node) => {
                if (!node) {
                  portalsMap.delete(container);
                  return;
                }
                if (!portalsMap.has(container)) {
                  portalsMap.set(container, new Set());
                }
                portalsMap.get(container).add(node);
              },
            }),
            container,
            id
          )
        );
    })
  );
};

const FAD = () => {
  const { theme } = useContext(ThemeContext);
  useFADSideEffect();

  const containers = useMemo(() => {
    const fad = document.querySelector('#full-app-display');
    return {
      fad,
      fadFg: fad.querySelector('#fad-foreground'),
    };
  }, []);

  return createElement(
    Fragment,
    null,
    createPortal(
      createElement(
        Fragment,
        null,
        createElement(SongPreview, {
          containerClassName: 'fad-song-preview',
        }),
        theme === THEMES.DARK &&
          createElement('div', {
            id: 'fad-mask',
          })
      ),
      containers.fad
    ),
    createPortal(
      createElement(TrackHeart, {
        className: 'fad-track-heart',
      }),
      containers.fadFg
    )
  );
};

const FADPortals = () => {
  const status = useFADStatus();

  if (!status) return null;
  return createElement(FAD);
};

const App = () => {
  const { exts } = concernedCLIConfig;

  useLegacyCleaner();
  useTurntablePlayState();

  const [theme, setTheme] = useState(() => {
    const config = JSON.parse(localStorage.getItem(CONFIG_KEY)) ?? {};
    return config.theme ?? THEMES.LIGHT;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    const config = JSON.parse(localStorage.getItem(CONFIG_KEY)) ?? {};
    if (config.theme === theme) return;
    localStorage.setItem(
      CONFIG_KEY,
      JSON.stringify({ ...config, theme })
    );
  }, [theme]);

  return createElement(
    ThemeContext.Provider,
    {
      value: {
        theme,
        setTheme,
      },
    },
    createElement(MainPortals),
    exts.fullAppDisplay && createElement(FADPortals)
  );
};

export default App;
