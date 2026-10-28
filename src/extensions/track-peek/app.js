import { useEffect, useState } from 'react';
import { concernedCLIConfig } from '@/config/cli.js';
import { useDOMFinder } from '@/hooks/utils/use-dom-finder.js';
import { usePlayStatus } from '@/hooks/host/use-play-status.js';
import {
  ProfileMenu,
  showNotification,
  SVGIcons,
} from '@/lib/spicetify.js';
import {
  CONFIG_KEY,
  DEFAULT_SETTINGS,
  SETTINGS_NAME,
} from './constants.js';
import AdjacentTracksPeekNPB from './adjacent-tracks-peek-npb.js';
import AudioPreview from './audio-preview.js';
import FAD from './fad.js';
import Settings from './settings.js';

const { exts } = concernedCLIConfig;

const getInitialSettings = () => {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      Array.isArray(parsed)
    ) {
      return DEFAULT_SETTINGS;
    }

    return {
      audioPreviewEnabled:
        typeof parsed.audioPreviewEnabled === 'boolean'
          ? parsed.audioPreviewEnabled
          : DEFAULT_SETTINGS.audioPreviewEnabled,
      adjacentTracksEnabled:
        typeof parsed.adjacentTracksEnabled === 'boolean'
          ? parsed.adjacentTracksEnabled
          : DEFAULT_SETTINGS.adjacentTracksEnabled,
    };
  } catch (error) {
    console.warn('[Track Peek]: Failed to load settings.', error);
    return DEFAULT_SETTINGS;
  }
};

const rootSelector = '.G0r21Xb5HbCgpzJwqiev';
const prevSelector = '[data-testid="control-button-skip-back"]';
const nextSelector = '[data-testid="control-button-skip-forward"]';
const playerControlsSelector = '[data-testid="general-controls"]';

const selectors = [prevSelector, nextSelector, playerControlsSelector];

const App = () => {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [settings, setSettings] = useState(getInitialSettings);
  const [audioPreviewActive, setAudioPreviewActive] = useState(false);
  const playStatus = usePlayStatus({ includeBuffering: false });
  const {
    [prevSelector]: prevMountPoint,
    [nextSelector]: nextMountPoint,
    [playerControlsSelector]: playerControls,
  } = useDOMFinder({ rootSelector, selectors });

  useEffect(() => {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('[Track Peek]: Failed to save settings.', error);
      showNotification('[Track Peek]: Failed to save settings.', true);
    }
  }, [settings]);

  useEffect(() => {
    const menuItem = new ProfileMenu.Item(
      SETTINGS_NAME,
      false,
      () => setSettingsVisible(true),
      SVGIcons.nowPlaying
    );

    menuItem.register();
    return () => menuItem.deregister();
  }, []);

  return (
    <>
      {settings.adjacentTracksEnabled && (
        <AdjacentTracksPeekNPB
          prevMountPoint={prevMountPoint}
          nextMountPoint={nextMountPoint}
        />
      )}
      {settings.audioPreviewEnabled && (
        <AudioPreview
          container={playerControls}
          playStatus={playStatus}
          onPreviewStart={() => setAudioPreviewActive(true)}
          onPreviewEnd={() => setAudioPreviewActive(false)}
        />
      )}
      {exts.fullAppDisplay && (
        <FAD
          playerControls={playerControls}
          enabled={settings.adjacentTracksEnabled || audioPreviewActive}
        />
      )}
      {settingsVisible && (
        <Settings
          visible={settingsVisible}
          audioPreviewEnabled={settings.audioPreviewEnabled}
          adjacentTracksEnabled={settings.adjacentTracksEnabled}
          onAudioPreviewEnabledChange={(audioPreviewEnabled) =>
            setSettings((previousSettings) => ({
              ...previousSettings,
              audioPreviewEnabled,
            }))
          }
          onAdjacentTracksEnabledChange={(adjacentTracksEnabled) =>
            setSettings((previousSettings) => ({
              ...previousSettings,
              adjacentTracksEnabled,
            }))
          }
          onClose={() => setSettingsVisible(false)}
        />
      )}
    </>
  );
};

export default App;
