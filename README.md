# Spotify Spice

[Spicetify](https://github.com/khanhas/spicetify-cli) theme, to change Spotify client UI.

Based on Spotify original theme.

<div align="center">
  <img src="https://github.com/grasonchan/spotify-spice/raw/master/screenshots/spotify_spice.png" alt="spotify spice">
</div>
<div align="center">
  <img src="https://github.com/grasonchan/spotify-spice/raw/master/screenshots/full_app_display.png" alt="full app display">
</div>

## Installation

1. [install spicetify-cli](https://github.com/khanhas/spicetify-cli/wiki/Installation), then follow the [Basic Usage](https://github.com/khanhas/spicetify-cli/wiki/Basic-Usage)
2. add extension - [Full App Display](https://github.com/khanhas/spicetify-cli/wiki/Extensions#full-app-display)

```bash
spicetify config extensions fullAppDisplay.js
spicetify apply
```

3. clone the repository, then put **SpotifySpice** into the Themes folder

```bash
cd spotify-spice
cp -r SpotifySpice ~/spicetify_data/Themes
```

4. select the theme and apply

```bash
spicetify config current_theme SpotifySpice
spicetify apply
```