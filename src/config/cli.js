import { cliConfig } from '@/lib/spicetify.js';

const CONCERNED_CONFIG = {
  exts: ['fullAppDisplay'],
};

function getConcernedConfig() {
  const { exts: concernedExts } = CONCERNED_CONFIG;
  const currentExtSet = new Set(cliConfig.extensions);

  const exts = {};
  for (const concernedExt of concernedExts) {
    exts[concernedExt] = currentExtSet.has(`${concernedExt}.js`);
  }

  return { exts };
}

export const concernedCLIConfig = getConcernedConfig();
