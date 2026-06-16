import { merge } from 'webpack-merge';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

export const THEME_NAME = 'SpotifySpice';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseConfig = {
  optimization: {
    splitChunks: false,
  },
  externals: {
    react: 'Spicetify.React',
    'react/jsx-runtime': 'Spicetify.ReactJSX',
    'react-dom': 'Spicetify.ReactDOM',
    'react-dom/client': 'Spicetify.ReactDOM',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  module: {
    parser: {
      javascript: {
        dynamicImportMode: 'eager',
      },
    },
    rules: [
      {
        test: /\.(?:js|mjs|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-react', { runtime: 'automatic' }],
              ],
            },
          },
        ],
      },
    ],
  },
};

const themeCommon = merge(baseConfig, {
  name: 'theme',
  entry: './src/index.js',
  output: {
    filename: 'theme.js',
    path: path.resolve(__dirname, 'dist', THEME_NAME),
    clean: true,
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
    new CopyPlugin({
      patterns: ['src/color.ini'],
    }),
    new MiniCssExtractPlugin({
      filename: 'user.css',
    }),
  ],
});

const extensionsCommon = merge(baseConfig, {
  name: 'extensions',
  context: path.resolve(__dirname, 'src/extensions'),
  entry: {
    vinyl: './vinyl/index.js',
    'track-peek': './track-peek/index.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist', 'extensions'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
});

export default [themeCommon, extensionsCommon];
