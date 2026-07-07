// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// This is the "production" configuration for Webpack, for development use webpack.config.dev.ts
// Main differences from dev config:
// - no dev server
// - uglify & minify js bundles
// - minify css
// - use different type of source maps for production
import path from "path"
import webpack, { Configuration } from "webpack"
import { merge } from "webpack-merge"
import MinifierPlugin from "terser-webpack-plugin"
import CopyWebpackPlugin from "copy-webpack-plugin"
import MiniCssExtractPlugin from "mini-css-extract-plugin"

import { commonConfig } from "./webpack.config.common"

export const prodConfig = merge<Configuration>(commonConfig, {
  mode: "production",
  entry: {
    polyfills: "./src/polyfills.js",
    bundle: ["./src/index.js"]
  },

  // what type of source maps to use, for more options see: https://webpack.js.org/configuration/devtool/
  // nosources-source-map will create source maps in separate files
  devtool: "nosources-source-map",

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader"
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              // eslint-disable-next-line global-require
              implementation: require("sass"),
              api: "legacy",
              sassOptions: {
                silenceDeprecations: [
                  "import",
                  "color-functions",
                  "global-builtin",
                  "slash-div"
                ],
                quietDeps: true
              }
            }
          }
        ]
      }
    ]
  },

  // what to output to the console, for more see: https://webpack.js.org/configuration/stats/
  stats: "minimal",

  optimization: {
    minimize: true,
    minimizer: [
      new MinifierPlugin({
        test: /\.(js|jsx)$/,
        // cache: true, // not used
        parallel: true, // set this to false to debug minifier
        terserOptions: {
          sourceMap: false,
          ie8: false,
          ecma: 2017,
          compress: {
            dead_code: true,
            warnings: false, // Suppress uglification warnings
            comparisons: false // don't optimize comparisons
          },
          mangle: true,
          output: {
            ecma: 5
          }
        },
        exclude: [
          /\.min\.js$/gi // skip pre-minified libs
        ]
      })
    ]
  },

  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        // TODO: confirm if actually redundant? If enabled,
        // throws "duplicate index.html" error on build
        // {
        //   from: "./src/index.html",
        //   to: path.join(__dirname, "dist/index.html")
        // },
        {
          from: "./src/app-config.js",
          to: path.join(__dirname, "dist/app-config.js")
        },
        {
          from: "./src/styles/override.css",
          to: path.join(__dirname, "dist/override.css")
        }
      ]
    }),

    new MiniCssExtractPlugin({
      filename: "[name].[git-revision-hash].css",
      chunkFilename: "[id].[git-revision-hash].css"
    }),
    new webpack.DefinePlugin({
      "process.env.MAPBOX_TOKEN": JSON.stringify(process.env.MAPBOX_TOKEN)
    })
  ]
})

export default prodConfig
