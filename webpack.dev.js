import { merge } from 'webpack-merge';
import SpicetifyDeployPlugin from './spicetify-deploy-webpack-plugin.js';
import common, { THEME_NAME } from './webpack.common.js';

export default merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  plugins: [
    new SpicetifyDeployPlugin({
      theme: THEME_NAME,
      scheme: 'spotify-spice',
    }),
  ],
});
