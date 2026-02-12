import {
  Fragment,
  createElement,
  useRef,
  useCallback,
  useEffect,
} from '../../lib/react.js';
import { createPortal } from '../../lib/react-dom.js';
import { useDOMFinder } from '../../hooks/utils/use-dom-finder.js';
import { useMainConfig } from '../../hooks/config/use-main.js';
import './main.css';

const Main = () => {
  const portalsMapRef = useRef(null);

  const getPortalsMap = useCallback(() => {
    if (portalsMapRef.current !== null) {
      return portalsMapRef.current;
    }
    const portalsMap = new Map();
    portalsMapRef.current = portalsMap;
    return portalsMap;
  }, []);

  const findEnhancer = useCallback(
    ({ selector, element: container, records }) => {
      const isConcernedMutation = records.some(
        ({ target, removedNodes }) =>
          target.matches(selector) && removedNodes.length
      );
      if (!isConcernedMutation) return;
      const nodes = getPortalsMap().get(container);
      if (!nodes) return;
      const lostNodes = [...nodes].filter(
        (node) => !container.contains(node)
      );
      if (lostNodes.length)
        return {
          container,
          lostNodes,
        };
    },
    [getPortalsMap]
  );

  const handleFindEnhancerHit = useCallback((data) => {
    data.forEach(({ container, lostNodes }) => {
      container.append(...lostNodes);
    });
  }, []);

  const { portalsConfig, rootSelector, selectors } = useMainConfig();
  const containers = useDOMFinder({
    rootSelector,
    selectors,
    findEnhancer,
    onFindEnhancerHit: handleFindEnhancerHit,
  });

  useEffect(
    () => () => {
      portalsMapRef.current.clear();
      portalsMapRef.current = null;
    },
    []
  );

  return createElement(
    Fragment,
    null,
    selectors.map((selector) => {
      const container = containers[selector];
      if (!container) return null;
      const portalsMap = getPortalsMap();
      return portalsConfig
        .get(selector)
        .map(({ id, Component, props = {} }) =>
          createPortal(
            createElement(Component, {
              ...props,
              ref: (node) => {
                if (!node) {
                  portalsMap.delete(container);
                  return;
                }
                if (!portalsMap.has(container)) {
                  portalsMap.set(container, new Set());
                }
                portalsMap.get(container).add(node);
              },
            }),
            container,
            id
          )
        );
    })
  );
};

export default Main;
