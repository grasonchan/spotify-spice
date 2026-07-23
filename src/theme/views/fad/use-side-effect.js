import { useEffect } from 'react';

export const useSideEffect = () => {
  useEffect(() => {
    const removeBillboard = () => {
      const billboard = document.querySelector('#view-billboard-ad');
      billboard?.closest('.ReactModalPortal').remove();
    };

    const styleEle = document.createElement('style');
    styleEle.innerHTML = `.ReactModalPortal { display: none; }`;
    document.body.append(styleEle);
    removeBillboard();

    return () => {
      styleEle.remove();
      removeBillboard();
    };
  }, []);

  useEffect(() => {
    const handleDblClick = (event) => {
      const { target } = event;
      if (target.closest('button')) {
        event.stopPropagation();
      }
    };

    const fad = document.querySelector('#full-app-display');
    fad.addEventListener('dblclick', handleDblClick);

    return () => fad.removeEventListener('dblclick', handleDblClick);
  }, []);
};
