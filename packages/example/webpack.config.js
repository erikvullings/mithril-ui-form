const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = (env) => {
  const isProduction = env.production;
  const outputPath = path.resolve(__dirname, isProduction ? '../../docs' : 'dist');
  const publicPath = isProduction ? 'https://erikvullings.github.io/mithril-ui-form/' : '/';

  console.log(`Running in ${isProduction ? 'production' : 'development'} mode, output directed to ${outputPath}.`);

  return {
    mode: isProduction ? 'production' : 'development',
    entry: './src/app.ts',
    devtool: isProduction ? 'source-map' : 'inline-source-map',
    devServer: {
      liveReload: true,
      port: 1233,
      watchFiles: ['../mithril-ui-form/lib/**/*'],
    },
    watchOptions: {
      followSymlinks: true,
      ignored: /node_modules\/(?!mithril-ui-form)/,
    },
    plugins: [
      new Dotenv(),
      new HtmlWebpackPlugin({
        title: 'Mithril UI Form',
        favicon: './src/favicon.ico',
        meta: { viewport: 'width=device-width, initial-scale=1' },
      }),
      new HtmlWebpackTagsPlugin({
        metas: [
          {
            attributes: { property: 'og:title', content: 'Mithril UI Form' },
          },
          {
            attributes: {
              property: 'og:description',
              content: "Specify your organization's capabilities, assess, and develop them.",
            },
          },
          {
            attributes: {
              property: 'og:url',
              content: 'https://erikvullings.github.io/mithril-ui-form/',
            },
          },
          {
            path: './src/assets/logo.svg',
            attributes: {
              property: 'og:image',
            },
          },
          {
            attributes: { property: 'og:locale', content: 'en_UK' },
          },
          {
            attributes: { property: 'og:site_name', content: 'Mithril UI Form' },
          },
          {
            attributes: { property: 'og:image:alt', content: 'Mithril UI Form' },
          },
          {
            attributes: {
              property: 'og:image:type',
              content: 'image/svg',
            },
          },
          {
            attributes: {
              property: 'og:image:width',
              content: '200',
            },
          },
          {
            attributes: {
              property: 'og:image:height',
              content: '200',
            },
          },
        ],
      }),
      // new MiniCssExtractPlugin({
      //   filename: isProduction ? '[name].[contenthash].css' : '[name].css',
      //   chunkFilename: isProduction ? '[id].[contenthash].css' : '[id].css',
      // }),
    ],
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
        // {
        //   test: /\.css$/,
        //   use: [MiniCssExtractPlugin.loader, 'css-loader'],
        // },
        // {
        //   test: /\.(csv|tsv)$/i,
        //   use: ['csv-loader'],
        // },
        // {
        //   test: /\.xml$/i,
        //   use: ['xml-loader'],
        // },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
      alias: {
        mithril: path.resolve(__dirname, 'node_modules/mithril'),
      },
      symlinks: true,
    },
    optimization: {
      minimizer: [
        // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
        // `...`,
        new CssMinimizerPlugin(),
      ],
    },
    output: {
      filename: 'bundle.js',
      path: outputPath,
      publicPath,
    },
  };
};
