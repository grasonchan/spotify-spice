import { createContext } from 'react';
import { THEMES } from '@/config/constants.js';

const ThemeContext = createContext(THEMES.DARK);

export default ThemeContext;
