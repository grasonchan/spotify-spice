await new Promise((res) => Spicetify.Events.webpackLoaded.on(res));
await new Promise((res) => {
  const checkPlayerAPI = () => {
    if (Spicetify.Player.origin?._state) return res();
    setTimeout(checkPlayerAPI, 100);
  };
  checkPlayerAPI();
});

/** @type {React} */
const { createElement } = Spicetify.React;

/** @type {ReactDOM} */
const { createRoot } = Spicetify.ReactDOM;

const { default: App } = await import('./App.js');

const fragment = document.createDocumentFragment();
const root = createRoot(fragment);
root.render(createElement(App));
