import { join } from 'path'
import { lib } from 'serverless-webpack'
import { Configuration } from 'webpack'

// [TEMPLATE] if using prisma
const CopyPlugin = require('copy-webpack-plugin')
const nodeExternals = require('webpack-node-externals')

const config: Configuration = {
  entry: lib.entries,
  target: 'node',
  mode: lib.webpack.isLocal ? 'development' : 'production',
  optimization: {
    minimize: false, // Optionally, set to true if you want to minify your code
    nodeEnv: false, // prevent overriding NODE_ENV
  },
  performance: {
    hints: false, // Turn off size warnings for entry points
  },
  devtool: 'source-map',
  resolve: {
    alias: {
      '@': join(__dirname, 'src'),
    },
    mainFields: ['main'], // used to prevent ethers from bundling into the web version
    extensions: ['.js', '.mjs', '.json', '.ts'],
    symlinks: false,
    cacheWithContext: false,
    aliasFields: ['tsconfig.json'], // Added this line to read alias configuration from tsconfig.json
  },
  externals: [nodeExternals()],
  output: {
    libraryTarget: 'commonjs',
    filename: '[name].js',
    path: join(__dirname, '.webpack'),
    sourceMapFilename: '[file].map',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: [
          /node_modules/,
          // Exclude other unnecessary files or directories
        ],
      },
    ],
  },
  // [TEMPLATE] if using prisma
  plugins: [
    new CopyPlugin({
      patterns: [{ from: './node_modules/.prisma/client/schema.prisma', to: './prisma/schema.prisma' }],
    }),
  ],
}

export default config
