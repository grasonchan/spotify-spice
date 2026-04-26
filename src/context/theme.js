import { createContext } from '@/lib/react.js';
import { THEMES } from '@/config/constants.js';

const ThemeContext = createContext(THEMES.DARK);

export default ThemeContext;
