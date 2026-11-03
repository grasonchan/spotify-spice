import { createPortal } from 'react-dom';
import { useDOMFinder } from '@/hooks/utils/use-dom-finder.js';
import { useConfig } from './use-config.js';

const Main = () => {
  const { portalsConfig, rootSelector, selectors } = useConfig();
  const containers = useDOMFinder({ rootSelector, selectors });

  return (
    <>
      {selectors.map((selector) => {
        const container = containers[selector];
        if (!container) return null;
        return portalsConfig
          .get(selector)
          .map(({ id, Component, props = {} }) =>
            createPortal(<Component {...props} />, container, id)
          );
      })}
    </>
  );
};

export default Main;
