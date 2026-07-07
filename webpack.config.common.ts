// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// webpack configuration common to both production and development
// const metadata = require("./package.json")
import metadata from "./package.json"
import { resolve } from "path"
import webpack, { Configuration, ResolveOptions } from "webpack"
import HTMLWebpackPlugin from "html-webpack-plugin"
import { GitRevisionPlugin } from "git-revision-webpack-plugin"
import NodePolyfillPlugin from "node-polyfill-webpack-plugin"

import licensePlugin from "./webpack.license-plugin"
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//   .BundleAnalyzerPlugin

const webpackModule = {
  include: [
    resolve(__dirname, "./src"),
    resolve(__dirname, "./node_modules/@heavyai/charting"),
    resolve(__dirname, "./node_modules/@heavyai/connector/src")
  ],
  exclude: [
    resolve(__dirname, "./node_modules/@heavyai/charting/node_modules/"),
    resolve(__dirname, "./node_modules/@heavyai/connector/node_modules/"),
    /(node_modules\/[^(@heavyai)]+)/
  ]
}

const webpackResolve: ResolveOptions = {
  extensions: [".js", ".jsx", ".ts", ".tsx", ".json", ".geojson"],
  symlinks: false,
  // modules: [resolve(__dirname, 'src'), '..', 'node_modules'],
  modules: [resolve(__dirname, "src"), "node_modules"],
  alias: {
    base: resolve(__dirname, "src", "styles", "base"),
    themes: resolve(__dirname, "src", "styles", "themes"),
    vendor: resolve(__dirname, "src", "styles", "vendor"),
    "@heavyai/connector/dist/browser-connector": resolve(
      __dirname,
      "node_modules/@heavyai/connector/dist/browser-connector"
    ),
    "@heavyai/charting": resolve(__dirname, "./node_modules/@heavyai/charting"),
    "@heavyai/connector": resolve(
      __dirname,
      "./node_modules/@heavyai/connector/src"
    ),
    "d3-combo-chart": resolve(
      __dirname,
      "./node_modules/@heavyai/d3-combo-chart"
    ),
    react: resolve(__dirname, "./node_modules/react"),
    "@heavyai/data-layer": resolve(
      __dirname,
      "./node_modules/@heavyai/data-layer/packages/data-layer/dist/heavyai-data-layer.js"
    )
  }
}

export const commonConfig: Configuration = {
  // specify where the compiled code is placed
  output: {
    path: resolve(__dirname, "dist"),
    filename: "[name].[git-revision-hash].js",
    publicPath: "/"
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          name: "vendor",
          test: /node_modules.*(?<!\.css)(?<!\.scss)(?<!\.less)$/,
          chunks: "all"
        }
      }
    }
  },

  resolve: webpackResolve,

  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        include: webpackModule.include,
        exclude: webpackModule.exclude,
        use: [
          {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
              configFile: resolve(__dirname, "./babel.config.js")
            }
          }
        ]
      },
      // Minimal babel transpilation for vega packages ES2021/ES2022 syntax
      {
        test: /\.js$/,
        include: /node_modules\/(vega-lite|vega-util|vega-encode|vega-scale|vega-runtime|vega)/,
        exclude: /node_modules\/(vega-lite|vega-util|vega-encode|vega-scale|vega-runtime|vega)\/node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: { chrome: "52" },
                  modules: false,
                  useBuiltIns: false
                }
              ]
            ],
            plugins: ["@babel/plugin-proposal-logical-assignment-operators"],
            babelrc: false,
            configFile: false
          }
        }
      },
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false
        }
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        type: "asset/inline", // url-loader equivalent,
        parser: {
          dataUrlCondition: {
            maxSize: 8192
          }
        }
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        type: "asset/resource", // file-loader equivalent
        generator: {
          filename: "fonts/[name][ext]"
        }
      }
    ]
  },

  plugins: [
    // TODO: replace w/ProvidePlugin + individual polyfills?
    new NodePolyfillPlugin(),

    ...(process.env.WEBPACK_SERVE ? [] : [licensePlugin as any]),

    new GitRevisionPlugin(),

    // new BundleAnalyzerPlugin(),
    // set environment variables which can be used in source code
    new webpack.DefinePlugin({
      "process.env.IMMERSE_BUILD_MODE": JSON.stringify(
        process.env.IMMERSE_BUILD_MODE
      ),
      "process.env.APP_VERSION": JSON.stringify(metadata.version),
      "process.env.GOOGLE_API_KEY": JSON.stringify(process.env.GOOGLE_API_KEY),
      "process.env.ENABLE_CONTROL_PANEL": JSON.stringify(
        process.env.ENABLE_CONTROL_PANEL
      ),
      "process.env.DEFAULT_DATA_CATALOG_MANIFEST_URL": JSON.stringify(
        process.env.DEFAULT_DATA_CATALOG_MANIFEST_URL
      ),
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development"
      ),
      "process.env.HEAVY_ECO": JSON.stringify(process.env.HEAVY_ECO)
    }),

    // allows for appending script and link tags for bundled JS and CSS
    new HTMLWebpackPlugin({
      template: "src/index.html",
      minify: false,
      favicon: "src/favicon.ico",
      inject: false,
      // FIXME: replace with templateContent+templateParameters
      environment: process.env.LINK_OVERRIDE_CSS
    })
  ]
}

export default commonConfig
