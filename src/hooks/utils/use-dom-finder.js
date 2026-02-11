import {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from '../../lib/react.js';

export const useDOMFinder = ({
  rootSelector,
  selectors,
  findEnhancer,
  onFindEnhancerHit,
}) => {
  const [elements, setElements] = useState({});
  const elementsRef = useRef(elements);
  const finderRef = useRef(null);

  const root = useMemo(() => {
    if (!rootSelector) return document.body;
    const target = document.querySelector(rootSelector);
    if (!target)
      throw new Error(
        `Selector ${rootSelector} does not match any stable DOM element. Please provide a valid selector targeting a persistent root node.`
      );
    return target;
  }, [rootSelector]);

  const handleMutation = useCallback(
    (records) => {
      const delta = {};
      const enhancerResults = [];
      selectors.forEach((selector) => {
        const element = root.querySelector(selector);
        if (elementsRef.current[selector] !== element) {
          delta[selector] = element;
          return;
        }
        if (!element) return;
        const enhancerResult = findEnhancer?.({
          selector,
          element,
          records,
        });
        if (!enhancerResult) return;
        enhancerResults.push(enhancerResult);
      });
      if (enhancerResults.length) onFindEnhancerHit?.(enhancerResults);
      if (!Object.keys(delta).length) return;
      setElements({
        ...elementsRef.current,
        ...delta,
      });
    },
    [root, selectors, findEnhancer, onFindEnhancerHit]
  );

  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  useEffect(() => {
    const refreshedElements = Object.fromEntries(
      selectors.map((selector) => [
        selector,
        root.querySelector(selector),
      ])
    );
    setElements(refreshedElements);
  }, [root, selectors]);

  useEffect(() => {
    finderRef.current = new MutationObserver(handleMutation);
    finderRef.current.observe(root, {
      childList: true,
      subtree: true,
    });

    return () => {
      finderRef.current.disconnect();
      finderRef.current = null;
    };
  }, [root, handleMutation]);

  return elements;
};
