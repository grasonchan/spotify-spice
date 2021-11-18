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

1. [install spicetify-cli](https://github.com/khanhas/spicetify-cli/wiki/Installation), then follow the [Basic Usage](https://github.com/khanhas/spicetify-cli/wiki/Basic-Usage)
2. add extension - [Full App Display](https://github.com/khanhas/spicetify-cli/wiki/Extensions#full-app-display)

```shell
spicetify config extensions fullAppDisplay.js
spicetify apply
```

3. clone the repository, then put **SpotifySpice** and **rotateTurntable.js** into the **spicetify_data**

```shell
cd spotify-spice
cp -r SpotifySpice ~/spicetify_data/Themes
cp rotateTurntable.js ~/spicetify_data/Extensions
```

4. select the theme and extension, then apply

```shell
spicetify config current_theme SpotifySpice
spicetify config extensions rotateTurntable.js
spicetify apply
```

## How to Uninstall

1. remove **SpotifySpice** and **rotateTurntable.js**

```shell
rm -r ~/spicetify_data/Themes/SpotifySpice
rm ~/spicetify_data/Extensions/rotateTurntable.js
```

2. config to spicetify default theme

```shell
spicetify config current_theme SpicetifyDefault
```

3. remove extension - Full App Display (optional)
```shell
spicetify config extensions fullAppDisplay.js-
```

4. apply
```shell
spicetify apply
```
