# Contributing

## Requirements

- **Node.js**: `>= v22.22.0`
- **editor extensions**: Prettier, ESLint, Stylelint

## Development

1. install dependencies

   ```shell
   npm ci
   ```

1. start the development watcher

   ```shell
   npm run watch
   ```

1. edit source files in the **src/** directory and commit

   - use `Spicetify`, `React`, etc. from **lib/**
   - write JSX directly (**no need to manually import lib/jsx-runtime.js**)
   - use `@/` for path aliases
   - may use node packages

1. when your changes are ready, build the production assets

   ```shell
   npm run build
   ```

1. commit the updated build output (**SpotifySpice/**) in a final separate commit
