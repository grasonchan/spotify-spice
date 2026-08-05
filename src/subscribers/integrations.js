export const fadRequest = (cb) => {
  window.addEventListener('fad-request', cb);
  return () => window.removeEventListener('fad-request', cb);
};
