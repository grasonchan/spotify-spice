import { merge } from 'webpack-merge';
import MinimizerPlugin from 'minimizer-webpack-plugin';
import common from './webpack.common.js';

const [themeCommon, extensionsCommon] = common;

const baseConfig = {
  mode: 'production',
  devtool: 'hidden-source-map',
};

export default [
  merge(themeCommon, baseConfig, {
    optimization: {
      minimizer: [
        '...',
        new MinimizerPlugin({
          test: /\.css(\?.*)?$/i,
          minify: MinimizerPlugin.cssnanoMinify,
        }),
      ],
    },
  }),
  merge(extensionsCommon, baseConfig),
];
