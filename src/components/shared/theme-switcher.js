import { useContext } from '@/lib/react.js';
import { SVGIcons } from '@/lib/spicetify.js';
import { THEMES } from '@/config/constants.js';
import ThemeContext from '@/context/theme.js';
import SVGButton from './svg-button.js';

const ThemeSwitcher = (props = {}) => {
  const { LIGHT, DARK } = THEMES;

  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <SVGButton
      icon={SVGIcons.brightness}
      {...props}
      onClick={() => setTheme(theme === DARK ? LIGHT : DARK)}
    />
  );
};

export default ThemeSwitcher;
