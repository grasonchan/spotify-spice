import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyFileSync, cpSync, readdirSync, rmSync } from 'node:fs';
import { rename, writeFile } from 'node:fs/promises';
import { spawn, execFileSync, execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const spicetify = {
  getPath(...params) {
    const cmd = `spicetify path ${params.join(' ')}`;
    return execSync(cmd, { encoding: 'utf-8' }).trim();
  },

  get(param = '') {
    const cmd = `spicetify config ${param}`;
    return execSync(cmd, { encoding: 'utf-8' }).trim();
  },

  set(...params) {
    console.log('>', 'spicetify', 'config', ...params);
    execFileSync('spicetify', ['config', ...params], {
      stdio: 'inherit',
    });
  },

  apply() {
    const cmd = 'spicetify apply';
    console.log('>', cmd);
    execSync(cmd, { stdio: 'inherit' });
  },

  watch(param = '-l') {
    const params = ['watch', param];
    console.log('>', 'spicetify', ...params);
    return spawn('spicetify', params, { stdio: 'inherit' });
  },
};

class SpicetifyPlugin {
  constructor(options = {}) {
    const supportedModes = Object.values(this.#MODES);
    if (!supportedModes.includes(options.mode)) {
      throw new Error('Invalid mode.');
    }
    if (
      options.mode === this.#MODES.THEME &&
      !(options.theme && options.scheme)
    ) {
      throw new Error('Theme and scheme need to be provided together.');
    }
    this.options = options;
  }

  static loader = path.resolve(
    __dirname,
    'spicetify-bootstrap-loader.js'
  );

  #MODES = {
    THEME: 'theme',
    EXTENSIONS: 'extensions',
  };

  #deployDir = spicetify.getPath('userdata');
  #srcDir = '';
  #targetDir = '';

  #watchProcess = null;
  #initialSetupCompleted = false;

  #strategies = {
    [this.#MODES.THEME]: () => {
      let originalTheme = '';
      let originalScheme = '';
      let shouldApply = false;
      return {
        getTargetDir: () =>
          path.resolve(this.#deployDir, 'Themes', this.options.theme),
        initialize: () => {
          originalTheme = spicetify.get('current_theme');
          originalScheme = spicetify.get('color_scheme');
        },
        beforeWatch: () => {
          rmSync(this.#targetDir, { recursive: true, force: true });
          cpSync(this.#srcDir, this.#targetDir, { recursive: true });
          shouldApply =
            originalTheme !== this.options.theme ||
            originalScheme !== this.options.scheme;
          if (!shouldApply) return;
          spicetify.set(
            'current_theme',
            this.options.theme,
            'color_scheme',
            this.options.scheme
          );
          spicetify.apply();
        },
        onExit: () => {
          if (!shouldApply) return;
          spicetify.set(
            'current_theme',
            originalTheme,
            'color_scheme',
            originalScheme
          );
          spicetify.apply();
        },
      };
    },

    [this.#MODES.EXTENSIONS]: () => {
      const diffExts = [];
      let originalExts = null;
      return {
        getTargetDir: () => path.resolve(this.#deployDir, 'Extensions'),
        initialize: () => {
          originalExts = new Set(
            spicetify.get('extensions').split(/\s+/)
          );
        },
        beforeWatch: () => {
          const dirents = readdirSync(this.#srcDir, {
            withFileTypes: true,
          });
          for (const dirent of dirents) {
            if (!dirent.isFile()) continue;
            copyFileSync(
              path.resolve(this.#srcDir, dirent.name),
              path.resolve(this.#targetDir, dirent.name)
            );
            if (!originalExts.has(dirent.name)) {
              diffExts.push(dirent.name);
            }
          }
          if (!diffExts.length) return;
          spicetify.set('extensions', diffExts.join('|'));
          spicetify.apply();
        },
        onExit: () => {
          if (!diffExts.length) return;
          spicetify.set(
            'extensions',
            diffExts.map((ext) => `${ext}-`).join('|')
          );
          spicetify.apply();
        },
      };
    },
  };

  apply(compiler) {
    const strategy = this.#strategies[this.options.mode]();

    const pluginName = SpicetifyPlugin.name;
    this.#srcDir = compiler.options.output.path;
    this.#targetDir = strategy.getTargetDir();

    compiler.hooks.environment.tap(pluginName, () =>
      strategy.initialize?.()
    );

    compiler.hooks.assetEmitted.tapPromise(
      pluginName,
      async (file, { content }) => {
        if (!this.#initialSetupCompleted) return;
        const tempFile = path.resolve(this.#targetDir, `.${file}`);
        const deployFile = path.resolve(this.#targetDir, file);
        await writeFile(tempFile, content);
        await rename(tempFile, deployFile);
      }
    );

    compiler.hooks.afterEmit.tap(pluginName, () => {
      if (this.#initialSetupCompleted) return;
      strategy.beforeWatch?.();
      const WATCH_MODES = {
        [this.#MODES.THEME]: '-s',
        [this.#MODES.EXTENSIONS]: '-e',
      };
      const watchProcess = spicetify.watch(
        WATCH_MODES[this.options.mode]
      );
      watchProcess.on('close', (code) => process.exit(code));
      this.#watchProcess = watchProcess;
      this.#initialSetupCompleted = true;
    });

    process.on('exit', () => {
      this.#watchProcess?.kill();
      strategy?.onExit();
    });
  }
}

export default SpicetifyPlugin;
