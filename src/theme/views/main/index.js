import { createPortal } from 'react-dom';
import { useDOMFinder } from '@/hooks/utils/use-dom-finder.js';
import ThemeSwitcher from '../../components/theme-switcher.js';

const rootSelector = '#global-nav-bar';
const actionBtnsSelector = '.zCtF8mVXUNCbStNrzrkU';
const selectors = [actionBtnsSelector];

const Main = () => {
  const containers = useDOMFinder({ rootSelector, selectors });
  const actionBtns = containers[actionBtnsSelector];

  return (
    actionBtns &&
    createPortal(
      <ThemeSwitcher
        plain
        className={
          document.querySelector(
            '[data-restore-focus-key="buddy_feed"]'
          )?.className
        }
      />,
      actionBtns
    )
  );
};

export default Main;
