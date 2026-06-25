import { useEffect, useState } from 'react';
import {
  GraphQL,
  originPlayer,
  Player,
  ProfileMenu,
  showNotification,
  SVGIcons,
  URI,
} from '@/lib/spicetify.js';
import {
  CONFIG_KEY,
  DEFAULT_SETTINGS,
  SETTINGS_NAME,
} from './constants.js';
import { useVinylPlayState } from './use-vinyl-play-state.js';
import Settings from './settings.js';

const VINYL_DURATION = '--vinyl-duration';
const COLORED_VINYL_C = '--colored-vinyl-c';
const COLORED_VINYL_H = '--colored-vinyl-h';

const getInitialSettings = () => {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const App = () => {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [settings, setSettings] = useState(getInitialSettings);
  useVinylPlayState();

  useEffect(() => {
    if (settings.rotationEnabled) {
      document.documentElement.style.setProperty(
        VINYL_DURATION,
        `${(60 / settings.rpm).toFixed(2)}s`
      );
    } else {
      document.documentElement.style.removeProperty(VINYL_DURATION);
    }
  }, [settings.rotationEnabled, settings.rpm]);

  useEffect(() => {
    if (!settings.coloredEnabled) return;
    const root = document.documentElement;
    const canvas = new OffscreenCanvas(1, 1);
    const ctx = canvas.getContext('2d');
    let isActive = true;

    const resetDOM = () => {
      root.style.removeProperty(COLORED_VINYL_C);
      root.style.removeProperty(COLORED_VINYL_H);
      delete root.dataset.coloredVinyl;
    };

    const syncColored = async () => {
      const { uri } = originPlayer.getState().item ?? {};
      try {
        if (!(uri && URI.isTrack(uri))) {
          resetDOM();
          return;
        }

        const {
          data: { trackUnion },
        } = await GraphQL.Request(
          GraphQL.Definitions.fetchExtractedColorForTrackEntity,
          { uri }
        );
        if (!(isActive && uri === originPlayer.getState().item?.uri)) {
          return;
        }

        const colors = trackUnion.albumOfTrack.coverArt.extractedColors;
        if (!colors?.colorDark?.hex) {
          showNotification('[Vinyl]: No color data available.');
          resetDOM();
          return;
        }

        ctx.fillStyle = `oklch(from ${colors.colorDark.hex} l c h)`;
        const oklchValue = ctx.fillStyle;
        const [, c, h] = oklchValue.slice(6, -1).split(' ');

        root.style.setProperty(COLORED_VINYL_C, c);
        root.style.setProperty(COLORED_VINYL_H, h);
        root.dataset.coloredVinyl = 'true';
      } catch (error) {
        if (!(isActive && uri === originPlayer.getState().item?.uri)) {
          return;
        }
        console.error('[Vinyl]:', error);
        showNotification('[Vinyl]: Failed to apply vinyl color.', true);
        resetDOM();
      }
    };

    Player.addEventListener('songchange', syncColored);
    syncColored();

    return () => {
      isActive = false;
      Player.removeEventListener('songchange', syncColored);
      resetDOM();
    };
  }, [settings.coloredEnabled]);

  useEffect(() => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const menuItem = new ProfileMenu.Item(
      SETTINGS_NAME,
      false,
      () => setSettingsVisible(true),
      SVGIcons.album
    );

    menuItem.register();
    return () => menuItem.deregister();
  }, []);

  return (
    settingsVisible && (
      <Settings
        visible={settingsVisible}
        rotationEnabled={settings.rotationEnabled}
        rpm={settings.rpm}
        coloredEnabled={settings.coloredEnabled}
        onRotateEnabledChange={(rotationEnabled) =>
          setSettings({ ...settings, rotationEnabled })
        }
        onRPMChange={(rpm) => setSettings({ ...settings, rpm })}
        onColoredEnabledChange={(coloredEnabled) =>
          setSettings({ ...settings, coloredEnabled })
        }
        onClose={() => setSettingsVisible(false)}
      />
    )
  );
};

export default App;
