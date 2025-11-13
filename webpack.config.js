const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const WebpackBundleAnalyzer = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
  
  

const path = require('path');

module.exports = {
  entry: {
    tableaunoir: [
      "./src/main.ts",
    ]
  },
  devtool: 'source-map',
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
    externals: [
    (function () {
      var IGNORES = [
        'electron'
      ];
      return function (context, request, callback) {
        if (IGNORES.indexOf(request) >= 0) {
          return callback(null, "require('" + request + "')");
        }
        return callback();
      };
    })()
  ],
  plugins: [
 //   new WebpackBundleAnalyzer(),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      DEBUG: false
    }),
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'src/index.html', to: 'index.html' },
        { from: 'src/style.css', to: 'style.css' }, // Use css loader ?
        { from: 'src/manifest.webmanifest', to: 'manifest.webmanifest' },
        { from: 'src/fr.json', to: 'fr.json' },
        { from: 'src/de.json', to: 'de.json' },
        { from: 'src/es.json', to: 'es.json' },
        { from: 'favicon.svg', to: 'favicon.svg'},
        { from: 'img', to: 'img'//, // Use image loader ?
         // globOptions: { ignore: [ "**/img/*.jpg", "**/img/*.gif", "**/simcitygraph.png" ]}} // remove from repository
        },
        {from:'sounds', to: 'sounds'}
      ],
    })
  ]
};
