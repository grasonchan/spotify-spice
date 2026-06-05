import { merge } from 'webpack-merge';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import common from './webpack.common.js';

const [themeCommon, extensionsCommon] = common;

const baseConfig = {
  mode: 'production',
  devtool: 'hidden-source-map',
};

export default [
  merge(themeCommon, baseConfig, {
    optimization: {
      minimizer: ['...', new CssMinimizerPlugin()],
    },
  }),
  merge(extensionsCommon, baseConfig),
];
