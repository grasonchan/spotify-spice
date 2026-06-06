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
   # watch theme changes only
   npm run watch:theme

   # watch all extensions changes only
   npm run watch:exts

   # watch everything
   npm run watch
   ```

1. edit source files in the **src/** directory and commit

   - use `Spicetify`, `Host Components`, etc. from **lib/**
   - import and use `React` just like standard npm packages
   - write JSX directly (**no need to manually import React**)
   - use `@/` for path aliases
   - may use node packages

1. run the build command and verify the output (**dist/**) in your Spotify client (this ensures your changes work correctly in the production environment)

   ```shell
   # build theme only
   npm run build:theme

   # build all extensions only
   npm run build:exts

   # build everything
   npm run build
   ```

### Notice

**Do NOT commit the build output.** The CI pipeline will automatically handle the production build and deployment upon merging
