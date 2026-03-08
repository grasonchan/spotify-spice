import path from 'node:path';
import { cpSync, rmSync } from 'node:fs';
import { rename, writeFile } from 'node:fs/promises';
import { spawn, execSync } from 'node:child_process';

class SpicetifyDeployPlugin {
  constructor(options) {
    this.options = options;
  }

  #originalTheme = '';
  #originalScheme = '';
  #shouldApplyTheme = false;

  #watchProcess = null;

  #initialSetupCompleted = false;

  static deployDir = execSync('spicetify path userdata', {
    encoding: 'utf-8',
  }).trim();

  static VALID_THEME_FILES = new Set([
    'theme.js',
    'user.css',
    'color.ini',
  ]);

  static CONFIG_THEME_CMD = 'spicetify config current_theme';
  static CONFIG_SCHEME_CMD = 'spicetify config color_scheme';
  static APPLY_CMD = 'spicetify apply';

  static applyTheme(theme, scheme) {
    const { CONFIG_THEME_CMD, CONFIG_SCHEME_CMD, APPLY_CMD } =
      SpicetifyDeployPlugin;

    const configThemeCmd = `${CONFIG_THEME_CMD} ${theme}`;
    const configSchemeCmd = `${CONFIG_SCHEME_CMD} ${scheme}`;

    console.log(`> ${configThemeCmd}`);
    execSync(configThemeCmd, { stdio: 'inherit' });
    console.log(`> ${configSchemeCmd}`);
    execSync(configSchemeCmd, { stdio: 'inherit' });
    console.log(`> ${APPLY_CMD}`);
    execSync(APPLY_CMD, { stdio: 'inherit' });
  }

  static startWatch(param = '-s') {
    const params = ['watch', param];
    console.log(`> spicetify`, ...params);
    const watchProcess = spawn('spicetify', params, {
      stdio: 'inherit',
    });
    return watchProcess;
  }

  apply(compiler) {
    const {
      name: pluginName,
      deployDir,
      VALID_THEME_FILES,
      CONFIG_THEME_CMD,
      CONFIG_SCHEME_CMD,
      applyTheme,
    } = SpicetifyDeployPlugin;

    const srcDir = compiler.options.output.path;
    const themeDir = path.resolve(
      deployDir,
      'Themes',
      this.options.theme
    );

    compiler.hooks.environment.tap(pluginName, () => {
      this.#originalTheme = execSync(CONFIG_THEME_CMD, {
        encoding: 'utf-8',
      }).trim();
      this.#originalScheme = execSync(CONFIG_SCHEME_CMD, {
        encoding: 'utf-8',
      }).trim();

      this.#shouldApplyTheme =
        this.#originalTheme !== this.options.theme ||
        this.#originalScheme !== this.options.scheme;
    });

    compiler.hooks.assetEmitted.tapPromise(
      pluginName,
      async (file, { content }) => {
        if (
          this.#initialSetupCompleted &&
          VALID_THEME_FILES.has(file)
        ) {
          const tempFile = path.resolve(themeDir, `.${file}`);
          const deployFile = path.resolve(themeDir, file);
          await writeFile(tempFile, content);
          await rename(tempFile, deployFile);
        }
      }
    );

    compiler.hooks.afterEmit.tap(pluginName, () => {
      const { startWatch } = SpicetifyDeployPlugin;
      if (this.#initialSetupCompleted) return;

      rmSync(themeDir, { recursive: true, force: true });
      cpSync(srcDir, themeDir, { recursive: true });

      if (this.#shouldApplyTheme) {
        applyTheme(this.options.theme, this.options.scheme);
      }

      const watchProcess = startWatch();
      watchProcess.on('close', (code) => process.exit(code));
      this.#watchProcess = watchProcess;

      this.#initialSetupCompleted = true;
    });

    process.on('exit', () => {
      this.#watchProcess?.kill();
      if (this.#shouldApplyTheme) {
        applyTheme(this.#originalTheme, this.#originalScheme);
      }
    });
  }
}

export default SpicetifyDeployPlugin;
