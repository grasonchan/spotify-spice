import { createElement, useState, useEffect } from './lib/react.js';
import { CONFIG_KEY, THEMES } from './config/constants.js';
import { concernedCLIConfig } from './config/cli.js';
import ThemeContext from './context/theme.js';
import { useLegacyCleaner } from './hooks/utils/use-legacy-cleaner.js';
import { useTurntablePlayState } from './hooks/features/use-turntable-play-state.js';
import Main from './components/injected/main.js';
import FAD from './components/injected/fad.js';

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
    exts.fullAppDisplay && createElement(FAD)
  );
};

export default App;
