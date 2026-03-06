import webpack from 'webpack';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

export const THEME_NAME = 'SpotifySpice';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: './src/index.js',
  output: {
    filename: 'theme.js',
    path: path.resolve(__dirname, THEME_NAME),
    clean: true,
  },
  resolve: {
    alias: {
      '@/*': path.resolve(__dirname, 'src/*'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(?:js|mjs|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-react',
                  {
                    runtime: 'automatic',
                    importSource: '@/lib',
                  },
                ],
              ],
            },
          },
        ],
      },
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
    new CopyPlugin({
      patterns: ['src/color.ini'],
    }),
    new MiniCssExtractPlugin({
      filename: 'user.css',
    }),
  ],
};
