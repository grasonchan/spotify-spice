import webpack from 'webpack';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'theme.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  resolve: {
    alias: {
      '@/*': path.resolve(__dirname, 'src/*'),
    },
  },
  optimization: {
    minimizer: ['...', new CssMinimizerPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
    new MiniCssExtractPlugin({
      filename: 'user.css',
    }),
  ],
};
