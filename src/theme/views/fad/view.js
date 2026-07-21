import { useContext, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { THEMES } from '../../config/constants.js';
import ThemeContext from '../../context/theme.js';
import { useSideEffect } from './use-side-effect.js';
import TrackHeart from '@/components/host-aware/track-heart.js';

const View = () => {
  const { theme } = useContext(ThemeContext);
  useSideEffect();

  const containers = useMemo(() => {
    const fad = document.querySelector('#full-app-display');
    return {
      fad,
      fadFg: fad.querySelector('#fad-foreground'),
    };
  }, []);

  return (
    <>
      {createPortal(
        theme === THEMES.DARK && <div id="fad-mask" />,
        containers.fad
      )}
      {createPortal(
        <TrackHeart className="fad-track-heart" />,
        containers.fadFg
      )}
    </>
  );
};

export default View;
