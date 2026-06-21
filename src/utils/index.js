export async function waitHostReady() {
  const checkPlayerAPI = () => Spicetify.Player.origin?._state;

  const checkHostComponents = () =>
    ['Slider', 'Dropdown', 'Toggle', 'Cards'].every(
      (component) => Spicetify.ReactComponent?.[component]
    );

  await new Promise((res) => Spicetify.Events.webpackLoaded.on(res));
  await new Promise((res) => {
    const checkHostReady = () => {
      if (checkPlayerAPI() && checkHostComponents()) return res();
      setTimeout(checkHostReady, 50);
    };
    checkHostReady();
  });
}
