import { createPortal } from './lib/react-dom.js';
import {
  classnames,
  originPlayer,
  Player,
  queueGetter,
  SVGIcons,
} from './lib/spicetify.js';
import {
  CONFIG_KEY,
  THEMES,
  HEART_STATUS,
} from './config/constants.js';
import { concernedCLIConfig } from './config/cli.js';
import {
  getPlayStatus,
  getHeartStatus,
  getAdjacentTracks,
} from './utils/track.js';

/** @type {React} */
const {
  Fragment,
  forwardRef,
  createElement,
  createContext,
  memo,
  useState,
  useRef,
  useContext,
  useMemo,
  useCallback,
  useEffect,
  useSyncExternalStore,
} = Spicetify.React;

const ThemeContext = createContext(null);

const fadRequestEventSubscribe = (cb) => {
  window.addEventListener('fad-request', cb);
  return () => window.removeEventListener('fad-request', cb);
};

const updateEventSubscribe = (cb) => {
  const removeListener = originPlayer._events.addListener('update', cb);
  return removeListener;
};

const queueUpdateEventSubscribe = (cb) => {
  const removeListener = originPlayer._events.addListener(
    'queue_update',
    cb
  );
  return removeListener;
};

const useLegacyCleaner = () => {
  const LEGACY_CONFIG_KEY = 'enableBlurFad';

  useEffect(() => {
    localStorage.removeItem(LEGACY_CONFIG_KEY);
  }, []);
};

const useDOMFinder = ({
  rootSelector,
  selectors,
  findEnhancer,
  onFindEnhancerHit,
}) => {
  const [elements, setElements] = useState({});
  const elementsRef = useRef(elements);
  const finderRef = useRef(null);

  const root = useMemo(() => {
    if (!rootSelector) return document.body;
    const target = document.querySelector(rootSelector);
    if (!target)
      throw new Error(
        `Selector ${rootSelector} does not match any stable DOM element. Please provide a valid selector targeting a persistent root node.`
      );
    return target;
  }, [rootSelector]);

  const handleMutation = useCallback(
    (records) => {
      const delta = {};
      const enhancerResults = [];
      selectors.forEach((selector) => {
        const element = root.querySelector(selector);
        if (elementsRef.current[selector] !== element) {
          delta[selector] = element;
          return;
        }
        if (!element) return;
        const enhancerResult = findEnhancer?.({
          selector,
          element,
          records,
        });
        if (!enhancerResult) return;
        enhancerResults.push(enhancerResult);
      });
      if (enhancerResults.length) onFindEnhancerHit?.(enhancerResults);
      if (!Object.keys(delta).length) return;
      setElements({
        ...elementsRef.current,
        ...delta,
      });
    },
    [root, selectors, findEnhancer, onFindEnhancerHit]
  );

  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  useEffect(() => {
    const refreshedElements = Object.fromEntries(
      selectors.map((selector) => [
        selector,
        root.querySelector(selector),
      ])
    );
    setElements(refreshedElements);
  }, [root, selectors]);

  useEffect(() => {
    finderRef.current = new MutationObserver(handleMutation);
    finderRef.current.observe(root, {
      childList: true,
      subtree: true,
    });

    return () => {
      finderRef.current.disconnect();
      finderRef.current = null;
    };
  }, [root, handleMutation]);

  return elements;
};

const useFADStatus = () =>
  useSyncExternalStore(fadRequestEventSubscribe, () =>
    document.body.classList.contains('fad-activated')
  );

const usePlayStatus = () =>
  useSyncExternalStore(updateEventSubscribe, () =>
    getPlayStatus(originPlayer._state)
  );

const useHeartStatus = () =>
  useSyncExternalStore(updateEventSubscribe, () =>
    getHeartStatus(originPlayer._state)
  );

const useQueue = () =>
  useSyncExternalStore(queueUpdateEventSubscribe, queueGetter);

const useSongPreviewConfig = ({
  initialConfig = {},
  isControllable = true,
  queue = {},
  restrictions: { canSkipPrevious = true, canSkipNext = true } = {},
}) => {
  const staticConfig = useMemo(() => {
    const {
      commonConfig: { className, ...restCommonConfig } = {},
      svgCommonConfig: { svgProps, ...restSvgCommonConfig } = {},
      svgConfig = { prev: {}, next: {} },
    } = initialConfig;

    const combinedCommonConfig = {
      className: classnames('song-preview-item', className),
      ...restCommonConfig,
    };

    const combinedSVGCommonConfig = {
      svgProps: { width: 10, height: 10, ...svgProps },
      ...restSvgCommonConfig,
    };

    const combinedBasicsConfig = {
      prev: { ...combinedCommonConfig, key: 'prev-track' },
      next: { ...combinedCommonConfig, key: 'next-track' },
    };

    const combinedControlsConfig = {
      prev: {
        ...combinedSVGCommonConfig,
        icon: SVGIcons['chevron-left'],
        ...svgConfig.prev,
        onClick: Player.back,
      },
      next: {
        ...combinedSVGCommonConfig,
        icon: SVGIcons['chevron-right'],
        svgPriority: false,
        ...svgConfig.next,
        onClick: Player.next,
      },
    };

    return {
      basics: combinedBasicsConfig,
      controls: combinedControlsConfig,
    };
  }, [initialConfig]);

  const createControlConfig = (controlConfig, isEnable) =>
    isControllable ? { ...controlConfig, disabled: !isEnable } : {};

  const injectDynamicData = () => {
    const { prevTrack, nextTrack } = getAdjacentTracks(
      queue,
      ({ contextTrack: { metadata } }) => metadata.title
    );

    return [
      {
        ...staticConfig.basics.prev,
        text: prevTrack,
        ...createControlConfig(
          staticConfig.controls.prev,
          canSkipPrevious
        ),
      },
      {
        ...staticConfig.basics.next,
        text: nextTrack,
        ...createControlConfig(staticConfig.controls.next, canSkipNext),
      },
    ];
  };

  return injectDynamicData();
};

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

const useTurntablePlayState = () => {
  const playStatus = usePlayStatus();

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--turntable-play-state',
      playStatus ? 'running' : 'paused'
    );
  }, [playStatus]);
};

const useFADSideEffect = () => {
  useEffect(() => {
    const removeBillboard = () => {
      const billboard = document.querySelector('#view-billboard-ad');
      billboard?.closest('.ReactModalPortal').remove();
    };

    const styleEle = document.createElement('style');
    styleEle.innerHTML = `.ReactModalPortal { display: none; }`;
    document.body.append(styleEle);
    removeBillboard();

    return () => {
      styleEle.remove();
      removeBillboard();
    };
  }, []);

  useEffect(() => {
    const handleDblClick = (event) => {
      const { target } = event;
      if (target.closest('button')) {
        event.stopPropagation();
      }
    };

    const fad = document.querySelector('#full-app-display');
    fad.addEventListener('dblclick', handleDblClick);

    return () => fad.removeEventListener('dblclick', handleDblClick);
  }, []);
};

const SVGButton = ({
  text,
  icon,
  svgPriority = true,
  svgProps = {},
  className,
  style = {},
  disabled = false,
  onClick,
}) => {
  return createElement(
    'button',
    {
      className: classnames('common-svg-button', className),
      style,
      disabled,
      onClick,
    },
    createElement('svg', {
      width: 16,
      height: 16,
      viewBox: '0 0 16 16',
      fill: 'currentColor',
      ...svgProps,
      dangerouslySetInnerHTML: {
        __html: icon,
      },
    }),
    text &&
      createElement(
        'span',
        {
          style: {
            order: svgPriority ? 0 : -1,
          },
        },
        text
      )
  );
};

const ThemeSwitcher = (props = {}) => {
  const { LIGHT, DARK } = THEMES;

  const { theme, setTheme } = useContext(ThemeContext);

  return createElement(SVGButton, {
    icon: SVGIcons.brightness,
    ...props,
    onClick: () => setTheme(theme === DARK ? LIGHT : DARK),
  });
};

const Heart = () => {
  const { COLLECTED, DISABLED } = HEART_STATUS;

  const status = useHeartStatus();

  return createElement(SVGButton, {
    icon:
      status === COLLECTED ? SVGIcons['heart-active'] : SVGIcons.heart,
    className: classnames('fad-heart', {
      checked: status === COLLECTED,
    }),
    disabled: status === DISABLED,
    onClick: Player.toggleHeart,
  });
};

const SongPreview = memo(
  forwardRef(
    ({ initialConfig, containerClassName, mountPoints }, ref) => {
      const isControllable = !mountPoints;

      const queue = useQueue();
      const config = useSongPreviewConfig({
        initialConfig,
        isControllable,
        queue,
        restrictions: originPlayer._state.restrictions,
      });

      if (!isControllable) {
        const [
          { text: prevTrack, ...prevConfigItem },
          { text: nextTrack, ...nextConfigItem },
        ] = config;

        return createElement(
          Fragment,
          null,
          mountPoints.prev &&
            createPortal(
              createElement('span', prevConfigItem, prevTrack),
              mountPoints.prev
            ),
          mountPoints.next &&
            createPortal(
              createElement('span', nextConfigItem, nextTrack),
              mountPoints.next
            )
        );
      }

      return createElement(
        'div',
        {
          ref,
          className: classnames('song-preview', containerClassName),
        },
        config.map((item) => createElement(SVGButton, item))
      );
    }
  )
);

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
    createPortal(createElement(Heart), containers.fadFg)
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
