import { useEffect, useState } from 'react';
import { ProfileMenu, SVGIcons } from '@/lib/spicetify.js';
import {
  CONFIG_KEY,
  DEFAULT_SETTINGS,
  SETTINGS_NAME,
} from './constants.js';
import { useTurntablePlayState } from './use-turntable-play-state.js';
import Settings from './settings.js';

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
  useTurntablePlayState();

  useEffect(() => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(settings));

    const vinylDuration = settings.rotationEnabled
      ? (60 / settings.rpm).toFixed(2)
      : 0;
    document.documentElement.style.setProperty(
      '--vinyl-duration',
      `${vinylDuration}s`
    );
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
        onRotateEnabledChange={(rotationEnabled) =>
          setSettings({ ...settings, rotationEnabled })
        }
        onRPMChange={(rpm) => setSettings({ ...settings, rpm })}
        onClose={() => setSettingsVisible(false)}
      />
    )
  );
};

export default App;
