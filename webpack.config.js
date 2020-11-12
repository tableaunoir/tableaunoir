const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

const path = require('path');

module.exports = {
  entry: {
    tableaunoir: [
      "./src/main.ts",
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "tableaunoir.js",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"]
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: ["ts-loader"], exclude: /node_modules/ },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      DEBUG: false
    }),
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'index.html', to: 'index.html' }, // Use html webpack ?
        { from: 'style.css', to: 'style.css' }, // Use css loader ?
        { from: 'img', to: 'img' }, // Use image loader ?
        { from: 'lib', to: 'lib' }, // Use imports ;)
      ],
    })
  ]
};
