/// <reference path="../types/spicetify.d.ts" />

'use strict';
(async function () {
  await new Promise((res) => Spicetify.Events.webpackLoaded.on(res));
  await new Promise((res) => {
    const checkPlayerAPI = () => {
      if (Spicetify.Player.origin?._state) return res();
      setTimeout(checkPlayerAPI, 100);
    };
    checkPlayerAPI();
  });

  /** @type {React} */
  const react = Spicetify.React;
  const {
    Fragment,
    forwardRef,
    memo,
    useState,
    useRef,
    useMemo,
    useCallback,
    useEffect,
    useSyncExternalStore,
  } = react;

  /** @type {ReactDOM} */
  const reactDOM = Spicetify.ReactDOM;
  const { createRoot, createPortal } = reactDOM;

  const { Config, Player, SVGIcons, classnames } = Spicetify;
  const { origin: PlayerAPI, getHeart, toggleHeart } = Player;

  const CONCERNED_CLI_CONFIG_MAP = {
    exts: ['fullAppDisplay.js'],
  };

  const HEART_STATUS = {
    DEFAULT: 0,
    COLLECTED: 1,
    DISABLED: 2,
  };

  const concernedCLIConfig = getConcernedCLIConfig();

  const fadRequestEventSubscribe = (cb) => {
    window.addEventListener('fad-request', cb);
    return () => window.removeEventListener('fad-request', cb);
  };

  const updateEventSubscribe = (cb) => {
    const removeListener = PlayerAPI._events.addListener('update', cb);
    return removeListener;
  };

  const queueUpdateEventSubscribe = (cb) => {
    const removeListener = PlayerAPI._events.addListener(
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
        if (enhancerResults.length)
          onFindEnhancerHit?.(enhancerResults);
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
    useSyncExternalStore(updateEventSubscribe, getPlayStatus);

  const useHeartStatus = () =>
    useSyncExternalStore(updateEventSubscribe, getHeartStatus);

  const useQueue = () =>
    useSyncExternalStore(
      queueUpdateEventSubscribe,
      () => Spicetify.Queue
    );

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
          ...createControlConfig(
            staticConfig.controls.next,
            canSkipNext
          ),
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
    return react.createElement(
      'button',
      {
        className: classnames('common-svg-button', className),
        style,
        disabled,
        onClick,
      },
      react.createElement('svg', {
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
        react.createElement(
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

  const Heart = () => {
    const { COLLECTED, DISABLED } = HEART_STATUS;

    const status = useHeartStatus();

    return react.createElement(SVGButton, {
      icon:
        status === COLLECTED
          ? SVGIcons['heart-active']
          : SVGIcons.heart,
      className: classnames('fad-heart', {
        checked: status === COLLECTED,
      }),
      disabled: status === DISABLED,
      onClick: toggleHeart,
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
          restrictions: PlayerAPI._state.restrictions,
        });

        if (!isControllable) {
          const [
            { text: prevTrack, ...prevConfigItem },
            { text: nextTrack, ...nextConfigItem },
          ] = config;

          return react.createElement(
            Fragment,
            null,
            mountPoints.prev &&
              createPortal(
                react.createElement('span', prevConfigItem, prevTrack),
                mountPoints.prev
              ),
            mountPoints.next &&
              createPortal(
                react.createElement('span', nextConfigItem, nextTrack),
                mountPoints.next
              )
          );
        }

        return react.createElement(
          'div',
          {
            ref,
            className: classnames('song-preview', containerClassName),
          },
          config.map((item) => react.createElement(SVGButton, item))
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

    return react.createElement(
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
              react.createElement(Component, {
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

  const FADPortals = () => {
    const billboardStyleRef = useRef(null);
    const status = useFADStatus();

    const containers = useMemo(() => {
      if (!status) return null;
      const fad = document.querySelector('#full-app-display');
      return {
        fad,
        fadFg: fad.querySelector('#fad-foreground'),
      };
    }, [status]);

    const handleDblClick = useCallback((event) => {
      const { target } = event;
      if (target.closest('button')) {
        event.stopPropagation();
      }
    }, []);

    useEffect(() => {
      const styleEle = document.createElement('style');
      styleEle.innerHTML = `.ReactModalPortal { display: none; }`;
      billboardStyleRef.current = styleEle;

      return () => billboardStyleRef.current.remove();
    }, []);

    useEffect(() => {
      const billboard = document.querySelector('#view-billboard-ad');
      billboard?.closest('.ReactModalPortal').remove();

      if (!status) {
        billboardStyleRef.current.remove();
        return;
      }
      document.body.append(billboardStyleRef.current);
    }, [status]);

    useEffect(() => {
      if (!containers) return;
      const { fad } = containers;
      fad.addEventListener('dblclick', handleDblClick);

      return () => fad.removeEventListener('dblclick', handleDblClick);
    }, [containers, handleDblClick]);

    if (!status) return null;

    return react.createElement(
      Fragment,
      null,
      createPortal(
        react.createElement(SongPreview, {
          containerClassName: 'fad-song-preview',
        }),
        containers.fad
      ),
      createPortal(react.createElement(Heart), containers.fadFg),
      createPortal(
        react.createElement('div', {
          id: 'fad-mask',
        }),
        containers.fad
      )
    );
  };

  const PortalsRoot = () => {
    const { exts } = concernedCLIConfig;

    useLegacyCleaner();
    useTurntablePlayState();

    return react.createElement(
      Fragment,
      null,
      react.createElement(MainPortals),
      exts.fullAppDisplay && react.createElement(FADPortals)
    );
  };

  const initPortals = () => {
    const fragment = document.createDocumentFragment();
    const portalsRoot = createRoot(fragment);
    portalsRoot.render(react.createElement(PortalsRoot));
  };

  function getConcernedCLIConfig() {
    const exts = {};
    const { exts: concernedExts } = CONCERNED_CLI_CONFIG_MAP;
    const currentExtSet = new Set(Config.extensions);
    for (let i = 0; i < concernedExts.length; i++) {
      const concernedExt = concernedExts[i];
      const key = concernedExt.replace('.js', '');
      exts[key] = currentExtSet.has(concernedExt);
    }
    return { exts };
  }

  function getPlayStatus() {
    const {
      _state: { item, isPaused, isBuffering },
    } = PlayerAPI;
    const playStatus = ![!item, isPaused, isBuffering].some((el) => el);
    return playStatus;
  }

  function getHeartStatus() {
    const { DEFAULT, COLLECTED, DISABLED } = HEART_STATUS;
    const status =
      PlayerAPI._state.item?.metadata['collection.can_add'] !== 'true'
        ? DISABLED
        : getHeart()
          ? COLLECTED
          : DEFAULT;
    return status;
  }

  function getAdjacentTracks(
    { prevTracks = [], nextTracks = [] } = {},
    mapper
  ) {
    const getTrack = (tracks) => {
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        const {
          provider,
          contextTrack: { metadata },
        } = track;
        if (provider === 'ad' || metadata.hidden) continue;
        return mapper ? mapper(track) : track;
      }
      return null;
    };
    return {
      prevTrack: getTrack([...prevTracks].reverse()),
      nextTrack: getTrack(nextTracks),
    };
  }

  initPortals();
})();
