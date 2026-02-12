import {
  Fragment,
  createElement,
  useState,
  useContext,
  useMemo,
  useEffect,
} from './lib/react.js';
import { createPortal } from './lib/react-dom.js';
import { CONFIG_KEY, THEMES } from './config/constants.js';
import { concernedCLIConfig } from './config/cli.js';
import ThemeContext from './context/theme.js';
import { useLegacyCleaner } from './hooks/utils/use-legacy-cleaner.js';
import { useFADStatus } from './hooks/host/use-fad-status.js';
import { useTurntablePlayState } from './hooks/features/use-turntable-play-state.js';
import { useFADSideEffect } from './hooks/features/use-fad-side-effect.js';
import TrackHeart from './components/host-aware/track-heart.js';
import SongPreview from './components/host-aware/song-preview.js';
import Main from './components/injected/main.js';

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
    createElement(Main),
    exts.fullAppDisplay && createElement(FADPortals)
  );
};

export default App;
