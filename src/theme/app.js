import { useState, useEffect } from 'react';
import { CONFIG_KEY, THEMES } from './config/constants.js';
import { concernedCLIConfig } from '@/config/cli.js';
import ThemeContext from './context/theme.js';
import { useLegacyCleaner } from './hooks/use-legacy-cleaner.js';
import Main from './views/main/index.js';
import FAD from './views/fad/index.js';

const App = () => {
  const { exts } = concernedCLIConfig;

  useLegacyCleaner();

  const [theme, setTheme] = useState(() => {
    const config = JSON.parse(localStorage.getItem(CONFIG_KEY)) ?? {};
    return config.theme ?? THEMES.DARK;
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

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      <Main />
      {exts.fullAppDisplay && <FAD />}
    </ThemeContext.Provider>
  );
};

export default App;
