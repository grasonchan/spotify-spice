import './index.css';

await new Promise((res) => Spicetify.Events.webpackLoaded.on(res));
await new Promise((res) => {
  const checkPlayerAPI = () => {
    if (Spicetify.Player.origin?._state) return res();
    setTimeout(checkPlayerAPI, 100);
  };
  checkPlayerAPI();
});

import('./root.js');
