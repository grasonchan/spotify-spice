import { useContext } from 'react';
import { SVGIcons } from '@/lib/spicetify.js';
import { THEMES } from '../config/constants.js';
import ThemeContext from '../context/theme.js';
import SVGButton from '@/components/shared/svg-button.js';

const THEME_LABELS = {
  [THEMES.LIGHT]: 'Light',
  [THEMES.DARK]: 'Dark',
};

const ThemeSwitcher = ({ tooltipProps = {}, ...props } = {}) => {
  const { theme, setTheme } = useContext(ThemeContext);

  const nextTheme = theme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;

  return (
    <SVGButton
      icon={SVGIcons.brightness}
      {...props}
      onClick={() => setTheme(nextTheme)}
      tooltipProps={{
        label: `Switch to ${THEME_LABELS[nextTheme]} Mode`,
        placement: 'bottom',
        ...tooltipProps,
      }}
    />
  );
};

export default ThemeSwitcher;
