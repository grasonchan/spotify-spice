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
  const { Fragment, useSyncExternalStore } = react;

  /** @type {ReactDOM} */
  const reactDOM = Spicetify.ReactDOM;
  const { createRoot, createPortal } = reactDOM;

  const { Player, SVGIcons, classnames } = Spicetify;
  const { origin: PlayerAPI, getHeart, toggleHeart } = Player;

  const BACKDROP_CONFIG_LABEL = 'Enable blur backdrop';

  const billboardModalStyle = document.createElement('style');
  billboardModalStyle.innerHTML = `.ReactModalPortal { display: none; }`;

  const songPreviewContainer = document.createElement('div');
  const previousSong = document.createElement('button');
  const nextSong = document.createElement('button');
  songPreviewContainer.classList.add('song-preview');
  songPreviewContainer.append(previousSong, nextSong);

  const HEART_STATUS = {
    DEFAULT: 0,
    COLLECTED: 1,
    DISABLED: 2,
  };

  let isFADReady = false;
  let fadRoot = null;

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

  const useHeartStatus = () =>
    useSyncExternalStore(updateEventSubscribe, getHeartStatus);

  const useQueue = () =>
    useSyncExternalStore(
      queueUpdateEventSubscribe,
      () => Spicetify.Queue
    );

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

  const FADComponents = () =>
    react.createElement(
      Fragment,
      null,
      createPortal(
        react.createElement(Heart),
        document.querySelector('#fad-foreground')
      )
    );

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

  function getAdjacentTracks(mapper) {
    const {
      Queue: { prevTracks, nextTracks },
    } = Spicetify;
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

  function handleTracksNamePreview() {
    const prevTracks = Spicetify.Queue.prevTracks;
    const currentTrack = Spicetify.Queue.track;
    const nextTracks = Spicetify.Queue.nextTracks;

    const trackCondition = (element) =>
      !element.contextTrack.metadata.hidden &&
      element.provider !== 'ad';

    const prevTrack = prevTracks.slice().reverse().find(trackCondition);
    const nextTrack = nextTracks.find(trackCondition);

    const prevTrackTitle = prevTrack.contextTrack.metadata.title;
    const currentTrackTitle = currentTrack.contextTrack.metadata.title;
    const nextTrackTitle = nextTrack.contextTrack.metadata.title;

    if (
      currentTrackTitle === prevTrackTitle &&
      currentTrackTitle === nextTrackTitle
    ) {
      previousSong.innerHTML = '';
      nextSong.innerHTML = '';
    } else {
      previousSong.innerHTML = `&lt; ${prevTrackTitle}`;
      nextSong.innerHTML = `${nextTrackTitle} &gt;`;
    }
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
    fullAppDisplay.appendChild(songPreviewContainer);
    if (Number(localStorage.getItem('enableBlurFad')))
      fullAppDisplay.dataset.isBlurFad = 'true';
    document
      .querySelector('#fad-main')
      .addEventListener('contextmenu', handleFADContextMenu);
    fullAppDisplay.addEventListener('dblclick', handleFADDblClick);
    renderFADComponents();
  }

  function handleFADToggle() {
    const isFADActivated =
      document.body.classList.contains('fad-activated');
    if (!isFADActivated) {
      const billboard = document.querySelector('#view-billboard-ad');
      billboard?.closest('.ReactModalPortal').remove();
      billboardModalStyle.remove();
      unmountFADComponents();
      isFADReady = false;
      return;
    }
    if (isFADReady) return;
    handleFAD();
    document.body.append(billboardModalStyle);
    isFADReady = true;
  }

  function renderFADComponents() {
    const fragment = document.createDocumentFragment();
    fadRoot = createRoot(fragment);
    fadRoot.render(react.createElement(FADComponents));
  }

  function unmountFADComponents() {
    fadRoot.unmount();
    fadRoot = null;
  }

  function init() {
    handleTurntable();
    handleTracksNamePreview();
  }

  function handleUpdateEvent() {
    handleTurntable();
  }

  init();

  PlayerAPI._events.addListener('update', handleUpdateEvent);
  PlayerAPI._events.addListener(
    'queue_update',
    handleTracksNamePreview
  );

  Spicetify.PopupModal.addEventListener('click', handlePopupModalClick);

  window.addEventListener('fad-request', handleFADToggle);

  previousSong.addEventListener(
    'click',
    Spicetify.Player.origin.skipToPrevious
  );
  nextSong.addEventListener(
    'click',
    Spicetify.Player.origin.skipToNext
  );
})();
