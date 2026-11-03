import {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from 'react';

export const useDOMFinder = ({ rootSelector, selectors }) => {
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

  const handleMutation = useCallback(() => {
    const delta = {};
    selectors.forEach((selector) => {
      const element = root.querySelector(selector);
      if (elementsRef.current[selector] !== element) {
        delta[selector] = element;
      }
    });
    if (!Object.keys(delta).length) return;
    setElements({
      ...elementsRef.current,
      ...delta,
    });
  }, [root, selectors]);

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
