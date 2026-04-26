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

1. run the build command and verify the output (**SpotifySpice/**) in your Spotify client (this ensures your changes work correctly in the production environment)

   ```shell
   npm run build
   ```

### Notice

**Do NOT commit the build output.** The CI pipeline will automatically handle the production build and deployment upon merging
