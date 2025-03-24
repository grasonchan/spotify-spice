/// <reference path="../types/spicetify.d.ts" />

window.addEventListener('load', function rotateTurntable() {
  /** @type {React} */
  // eslint-disable-next-line no-unused-vars
  const react = Spicetify.React;

  /** @type {ReactDOM} */
  // eslint-disable-next-line no-unused-vars
  const reactDOM = Spicetify.ReactDOM;

  const SpicetifyOrigin = Spicetify.Player.origin;

  if (!SpicetifyOrigin?._state) {
    setTimeout(rotateTurntable, 250);
    return;
  }

  const BACKDROP_CONFIG_LABEL = 'Enable blur backdrop';

  const billboardModalStyle = document.createElement('style');
  billboardModalStyle.innerHTML = `.ReactModalPortal { display: none; }`;

  const fadHeartContainer = document.createElement('div');
  const fadHeart = document.createElement('button');
  const fadHeartSvg = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg'
  );
  fadHeartContainer.classList.add('fad-heart-container');
  fadHeart.classList.add('fad-heart');
  fadHeartSvg.setAttribute('width', '16');
  fadHeartSvg.setAttribute('height', '16');
  fadHeartSvg.setAttribute('viewBox', '0 0 16 16');
  fadHeart.appendChild(fadHeartSvg);
  fadHeartContainer.appendChild(fadHeart);

  const songPreviewContainer = document.createElement('div');
  const previousSong = document.createElement('button');
  const nextSong = document.createElement('button');
  songPreviewContainer.classList.add('song-preview');
  songPreviewContainer.append(previousSong, nextSong);

  let isFADReady = false;

  function handleTurntable() {
    const { item, isPaused, isBuffering } =
      Spicetify.Player.origin._state;
    const playState = [!item, isPaused, isBuffering].some((el) => el)
      ? 'paused'
      : 'running';
    document.documentElement.style.setProperty(
      '--turntable-play-state',
      playState
    );
  }

  function handleFadHeart() {
    const isFadHeartContainer = document.querySelector(
      '.fad-heart-container'
    );

    const stateItem = SpicetifyOrigin._state.item;

    if (stateItem.isLocal || stateItem.type === 'ad') {
      isFadHeartContainer?.remove();
      return;
    }

    if (!isFadHeartContainer)
      document
        .querySelector('#fad-foreground')
        ?.appendChild(fadHeartContainer);

    if (Spicetify.Player.getHeart()) {
      fadHeartSvg.innerHTML = Spicetify.SVGIcons['heart-active'];
      fadHeart.classList.add('checked');
    } else {
      fadHeartSvg.innerHTML = Spicetify.SVGIcons.heart;
      fadHeart.classList.remove('checked');
    }
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
    handleFadHeart();
  }

  function handleFADToggle() {
    if (!document.body.classList.contains('fad-activated')) {
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
    handleTracksNamePreview();
  }

  function handleUpdateEvent() {
    handleTurntable();
    handleFadHeart();
  }

  init();

  Spicetify.Player.origin._events.addListener(
    'update',
    handleUpdateEvent
  );
  Spicetify.Player.origin._events.addListener(
    'queue_update',
    handleTracksNamePreview
  );

  Spicetify.PopupModal.addEventListener('click', handlePopupModalClick);

  window.addEventListener('fad-request', handleFADToggle);

  fadHeart.addEventListener('click', Spicetify.Player.toggleHeart);
  previousSong.addEventListener('click', () =>
    SpicetifyOrigin.skipToPrevious()
  );
  nextSong.addEventListener('click', () =>
    SpicetifyOrigin.skipToNext()
  );
});
