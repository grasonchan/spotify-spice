import { merge } from 'webpack-merge';
import SpicetifyDeployPlugin from './spicetify-deploy-webpack-plugin.js';
import common, { THEME_NAME } from './webpack.common.js';

const [themeCommon, extensionsCommon] = common;

const baseConfig = {
  mode: 'development',
  devtool: 'eval-source-map',
};

export default [
  merge(themeCommon, baseConfig, {
    plugins: [
      new SpicetifyDeployPlugin({
        mode: 'theme',
        theme: THEME_NAME,
        scheme: 'spotify-spice',
      }),
    ],
  }),
  merge(extensionsCommon, baseConfig, {
    plugins: [
      new SpicetifyDeployPlugin({
        mode: 'extensions',
      }),
    ],
  }),
];
