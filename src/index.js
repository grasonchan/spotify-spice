await new Promise((res) => Spicetify.Events.webpackLoaded.on(res));
await new Promise((res) => {
  const checkPlayerAPI = () => {
    if (Spicetify.Player.origin?._state) return res();
    setTimeout(checkPlayerAPI, 100);
  };
  checkPlayerAPI();
});

const { createElement } = await import('./lib/react.js');
const { createRoot } = await import('./lib/react-dom.js');

const { default: App } = await import('./app.js');

const fragment = document.createDocumentFragment();
const root = createRoot(fragment);
root.render(createElement(App));
