# Spotify Spice

![Discord](https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/67ece93be2524af5cf14dc1c_Logo-black-bg.svg)

Join [Discord](https://discord.gg/UK84KCbNf6) for discussions and support.

For bugs or improvements, please open an issue or PR. ❤️

## Compatibility

Latest version of [Spotify](https://www.spotify.com/) and [Spicetify](https://github.com/spicetify/cli).

_Looking for older versions? Download legacy versions from the [Releases](https://github.com/grasonchan/spotify-spice/releases) page._

## Installation

Use [Spicetify Marketplace](https://github.com/spicetify/marketplace) to install.

## Extensions

### Vinyl

Transforms the album artwork into a spinning, lightness-adaptive vinyl driven by your playback state.

Supports both the **Now Playing View** and [**Full App Display**](#optional).

Open the profile menu to access the vinyl settings.

_Tip: Keep vinyl in Now Playing View by turning off `Settings` → `Display` → `Display short, looping visuals on tracks (Canvas)`._

![vinyl](screenshots/vinyl.png)

![vinyl-settings](screenshots/vinyl-settings.png)

### Track Peek

Peek into tracks without switching playback.

Right-click any track to access the audio preview.

![adjacent-tracks-peek](screenshots/adjacent-tracks-peek.png)

![audio-preview](screenshots/audio-preview.png)

## Theme

A seamless extension of the native Spotify aesthetic, featuring a native-quality Light Mode alongside an optimized Dark Mode.

![main](screenshots/main.png)
![full-app-display](screenshots/full-app-display.png)

## Optional

enable Spicetify's built-in extensions and custom apps for the complete experience:

```shell
spicetify config extensions fullAppDisplay.js
spicetify config custom_apps lyrics-plus
spicetify apply
```
