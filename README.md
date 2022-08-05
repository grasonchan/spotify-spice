# Spotify Spice

[Spicetify](https://github.com/khanhas/spicetify-cli) theme, to change Spotify client UI.

Based on Spotify original theme.

**Note:** Require Spicetify **v2.2.0** or higher! Otherwise, performance problems will happen when the turntable rotate!

Develop and test on macOS. If there's any problem, please open issue or PR.

## About Turntable

Use CSS to achieve, not picture. This means it can be scaled to any size, but make sure the album cover is not blurry.

Actually, the rotation of the turntable was created at spicetify v1, but in some cases, animation is affected by other factors. I think "fullAppDisplay.js high GPU usage" is the reason. Fortunately, it's normal now!

The turntable inspired by [Netease Music](https://music.163.com) and [Smartisan OS build-in Music Player](https://www.smartisan.com/os/#/beauty) (not include code).

## Screenshots

![spotify spice](screenshots/spotify_spice.png)
![fullAppDisplay](screenshots/fad.png)
![fullAppDisplay - vertical mode](screenshots/fad_vertical.png)
![blur fullAppDisplay](screenshots/blur_fad.png)
![blur fullAppDisplay - vertical mode](screenshots/blur_fad_vertical.png)

## Installation

1. [install spicetify-cli](https://spicetify.app/docs/getting-started/simple-installation), then follow the [Basic Usage](https://spicetify.app/docs/getting-started/basic-usage)

2. clone the repository, then put **SpotifySpice** and **spotifySpice.js** into the spicetify config folder
* Linux/maxOS: **~/.config/spicetify/**
* Windows Powershell: **$env:APPDATA/spicetify/Extensions/**

```shell
cd spotify-spice
cp -r SpotifySpice <config-folder-path>/Themes
cp spotifySpice.js <config-folder-path>/Extensions
```

3. select the theme and extensions ([Full App Display](https://spicetify.app/docs/advanced-usage/extensions#full-app-display))

```shell
spicetify config current_theme SpotifySpice
spicetify config extensions fullAppDisplay.js
spicetify config extensions spotifySpice.js
```

4. apply

```shell
spicetify apply
```

## How to Uninstall

1. remove **SpotifySpice** and **spotifySpice.js**

```shell
rm -r ~/.config/spicetify/Themes/SpotifySpice
rm ~/.config/spicetify/Extensions/spotifySpice.js
```

2. config to spicetify default theme

```shell
spicetify config current_theme SpicetifyDefault
```

3. remove extensions

```shell
spicetify config extensions spotifySpice.js-
spicetify config extensions fullAppDisplay.js-
```

4. apply

```shell
spicetify apply
```
