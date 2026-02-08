const CONCERNED_CONFIG = {
  exts: ['fullAppDisplay'],
};

const { Config } = Spicetify;

function getConcernedConfig() {
  const { exts: concernedExts } = CONCERNED_CONFIG;
  const currentExtSet = new Set(Config.extensions);

  const exts = {};
  for (const concernedExt of concernedExts) {
    exts[concernedExt] = currentExtSet.has(`${concernedExt}.js`);
  }

  return { exts };
}

export const concernedCLIConfig = getConcernedConfig();
