const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const config = require('./paths')
const path = require('path')

// This is the Webpack configuration.
// It is focused on developer experience and fast rebuilds.
module.exports = (options) => ({
  // Webpack can target multiple environments such as `node`,
  // `browser`, and even `electron`. Since Backpack is focused on Node,
  // we set the default target accordingly.
  target: 'node',
  // The benefit of Webpack over just using babel-cli or babel-node
  // command is sourcemap support. Although it slows down compilation,
  // it makes debugging dramatically easier.
  devtool: 'source-map',
  // Webpack allows you to define externals - modules that should not be
  // bundled. When bundling with Webpack for the backend - you usually
  // don't want to bundle its node_modules dependencies. This creates an externals
  // function that ignores node_modules when bundling in Webpack.
  // @see https://github.com/liady/webpack-node-externals
  externals: nodeExternals(),
  // As of Webpack 2 beta, Webpack provides performance hints.
  // Since we are not targeting a browser, bundle size is not relevant.
  // Additionally, the performance hints clutter up our nice error messages.
  performance: {
    hints: false
  },
  // Since we are wrapping our own webpack config, we need to properly resolve
  // Backpack's and the given user's node_modules without conflict.
  resolve: {
    extensions: ['.js', '.json'],
    modules: [config.userNodeModulesPath, path.resolve(__dirname, '../node_modules')]
  },
  resolveLoader: {
    modules: [config.userNodeModulesPath, path.resolve(__dirname, '../node_modules')]
  },
  node: {
    __filename: false,
    __dirname: false
  },
  entry: {
    main: [
      require.resolve('babel-polyfill'),
      `${config.serverSrcPath}/index.js`
    ],
  },
  // This sets the default output file path, name, and compile target
  // module type. Since we are focused on Node.js, the libraryTarget
  // is set to CommonJS2
  output: {
    path: config.serverBuildPath,
    filename: '[name].js',
    sourceMapFilename: '[name].map',
    publicPath: config.publicPath,
    libraryTarget: 'commonjs2'
  },
  // Define a few default Webpack loaders. Notice the use of the new
  // Webpack 2 configuration: module.rules instead of module.loaders
  module: {
    rules: [
      // This is the development configuration.
      // It is focused on developer experience and fast rebuilds.
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      // Process JS with Babel (transpiles ES6 code into ES5 code).
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        exclude: [
          /node_modules/,
          config.buildPath
        ],
        options: {
          // babel-preset-env is like autoprefixer, but for javascript.
          // It efficiently optimizes transpilation based on the specified
          // target environment. As a default, we set it to target the
          // user's currently installed Node.js version. We also turn off
          // ES Modules, and Webpack handles that for us.
          presets: [
            [require.resolve('babel-preset-env'), {
              target: {
                node: 'current'
              },
              modules: false
            }]
          ],
          // These are the default JavaScript language addons.
          plugins: [
            require.resolve('babel-plugin-transform-object-rest-spread'),
            require.resolve('babel-plugin-transform-class-properties')
          ]
        }
      }
    ]
  },
  plugins: [
    // We define some sensible Webpack flags. One for the Node environment,
    // and one for dev / production. These become global variables. Note if
    // you use something like eslint or standard in your editor, you will
    // want to configure __DEV__ as a global variable accordingly.
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(options.env),
      '__DEV__': options.env === 'development'
    }),
    // In order to provide sourcemaps, we automagically insert this at the
    // top of each file using the BannerPlugin.
    new webpack.BannerPlugin({
      raw: true,
      banner: 'require("source-map-support").install();'
    }),
    // The FriendlyErrorsWebpackPlugin (when combined with source-maps)
    // gives Backpack its human-readable error messages.
    new FriendlyErrorsWebpackPlugin(),
    // This plugin is awkwardly named. It does not actually swallow errors.
    // Instead, it just prevents Webpack from printing out compile time
    // stats to the console.
    new webpack.NoErrorsPlugin()
  ]
})
