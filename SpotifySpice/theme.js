/// <reference path="../types/spicetify.d.ts" />

'use strict';
(async function Turntable() {
  await new Promise((res) => Spicetify.Events.webpackLoaded.on(res));
  if (!Spicetify.Player.origin?._state) {
    setTimeout(Turntable, 100);
    return;
  }

  /** @type {React} */
  const react = Spicetify.React;
  const {
    Fragment,
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

  const { Player, SVGIcons, classnames } = Spicetify;
  const { origin: PlayerAPI, getHeart, toggleHeart } = Player;

  const BACKDROP_CONFIG_LABEL = 'Enable blur backdrop';

  const billboardModalStyle = document.createElement('style');
  billboardModalStyle.innerHTML = `.ReactModalPortal { display: none; }`;

  const HEART_STATUS = {
    DEFAULT: 0,
    COLLECTED: 1,
    DISABLED: 2,
  };

  let isFADReady = false;

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
    ({ initialConfig, containerClassName, mountPoints }) => {
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
        { className: classnames('song-preview', containerClassName) },
        config.map((item) => react.createElement(SVGButton, item))
      );
    }
  );

  const MainPortals = () => {
    const { portalsConfig, rootSelector, selectors } =
      useMainPortalsConfig();
    const containers = useDOMFinder({
      rootSelector,
      selectors,
    });

    return react.createElement(
      Fragment,
      null,
      selectors.map((selector) => {
        const container = containers[selector];
        if (!container) return null;
        return portalsConfig
          .get(selector)
          .map(({ id, Component, props }) =>
            createPortal(
              react.createElement(Component, props),
              container,
              id
            )
          );
      })
    );
  };

  const FADPortals = () => {
    const status = useFADStatus();

    const containers = useMemo(() => {
      if (!status) return null;
      const fad = document.querySelector('#full-app-display');
      return {
        fad,
        fadFg: fad.querySelector('#fad-foreground'),
      };
    }, [status]);

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
      createPortal(react.createElement(Heart), containers.fadFg)
    );
  };

  const PortalsRoot = () => {
    return react.createElement(
      Fragment,
      null,
      react.createElement(MainPortals),
      react.createElement(FADPortals)
    );
  };

  const initPortals = () => {
    const fragment = document.createDocumentFragment();
    const portalsRoot = createRoot(fragment);
    portalsRoot.render(react.createElement(PortalsRoot));
  };

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

  function handleTurntable() {
    const {
      _state: { item, isPaused, isBuffering },
    } = PlayerAPI;
    const playState = [!item, isPaused, isBuffering].some((el) => el)
      ? 'paused'
      : 'running';
    document.documentElement.style.setProperty(
      '--turntable-play-state',
      playState
    );
  }

  function handlePopupModalClick(event) {
    const { PopupModal } = Spicetify;
    const { target } = event;
    if (target.closest('.setting-row button.switch')) {
      PopupModal.hide();
    }
  }

  function handleFADBackdrop(event) {
    const { currentTarget } = event;
    const fullAppDisplay = document.querySelector('#full-app-display');
    if (!Number(localStorage.getItem('enableBlurFad'))) {
      fullAppDisplay.dataset.isBlurFad = 'true';
      currentTarget.classList.remove('disabled');
      localStorage.setItem('enableBlurFad', '1');
    } else {
      fullAppDisplay.dataset.isBlurFad = 'false';
      currentTarget.classList.add('disabled');
      localStorage.setItem('enableBlurFad', '0');
    }
  }

  function handleFADContextMenu() {
    const { PopupModal } = Spicetify;
    const configContainer = PopupModal.querySelector('main > div');
    const settingRow = document.createElement('div');
    settingRow.classList.add('setting-row');
    settingRow.innerHTML = `
<label class="col description">${BACKDROP_CONFIG_LABEL}</label>
<div class="col action">
  <button class="${Number(localStorage.getItem('enableBlurFad')) ? 'switch' : 'switch disabled'}" data-blur-fad>
    ${parseIcon('check')}
  </button>
</div>
`;
    configContainer.insertBefore(
      settingRow,
      configContainer.querySelector('.setting-row')
    );
    const backdropConfigBtn =
      configContainer.querySelector('[data-blur-fad]');
    backdropConfigBtn.addEventListener('click', handleFADBackdrop);
  }

  function handleFADDblClick(event) {
    const { target } = event;
    if (target.closest('button')) {
      event.stopPropagation();
    }
  }

  function handleFAD() {
    const fullAppDisplay = document.querySelector('#full-app-display');
    if (Number(localStorage.getItem('enableBlurFad')))
      fullAppDisplay.dataset.isBlurFad = 'true';
    document
      .querySelector('#fad-main')
      .addEventListener('contextmenu', handleFADContextMenu);
    fullAppDisplay.addEventListener('dblclick', handleFADDblClick);
  }

  function handleFADToggle() {
    const isFADActivated =
      document.body.classList.contains('fad-activated');
    if (!isFADActivated) {
      const billboard = document.querySelector('#view-billboard-ad');
      billboard?.closest('.ReactModalPortal').remove();
      billboardModalStyle.remove();
      isFADReady = false;
      return;
    }
    if (isFADReady) return;
    handleFAD();
    document.body.append(billboardModalStyle);
    isFADReady = true;
  }

  function init() {
    handleTurntable();
    initPortals();
  }

  function handleUpdateEvent() {
    handleTurntable();
  }

  init();

  PlayerAPI._events.addListener('update', handleUpdateEvent);

  Spicetify.PopupModal.addEventListener('click', handlePopupModalClick);

  window.addEventListener('fad-request', handleFADToggle);
})();
