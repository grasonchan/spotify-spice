import {
  Fragment,
  createElement,
  useContext,
  useMemo,
} from '../../lib/react.js';
import { createPortal } from '../../lib/react-dom.js';
import { THEMES } from '../../config/constants.js';
import ThemeContext from '../../context/theme.js';
import { useFADSideEffect } from '../../hooks/features/use-fad-side-effect.js';
import TrackHeart from '../host-aware/track-heart.js';
import SongPreview from '../host-aware/song-preview.js';

const FADView = () => {
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

export default FADView;
