import { merge } from 'webpack-merge';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import common from './webpack.common.js';

export default merge(common, {
  mode: 'production',
  devtool: 'hidden-source-map',
  optimization: {
    minimizer: ['...', new CssMinimizerPlugin()],
  },
});
