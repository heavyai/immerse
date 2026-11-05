// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const path = require("node:path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const root = path.resolve(__dirname, "../..")
module.exports = {
  mode: "development",
  entry: path.join(__dirname, "ui-harness.jsx"),
  output: {
    path: path.join(root, "test-results/ui-harness"),
    filename: "ui.js"
  },
  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      react: path.join(root, "node_modules/react"),
      "react-dom": path.join(root, "node_modules/react-dom")
    }
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: { configFile: path.join(root, "babel.config.js") }
        }
      },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      {
        test: /\.scss$/,
        use: [
          "style-loader",
          "css-loader",
          { loader: "sass-loader", options: { api: "modern" } }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      templateContent:
        '<!doctype html><html lang="en"><head><title>UI contract fixture</title></head><body><div id="root"></div></body></html>'
    })
  ],
  devServer: {
    host: "127.0.0.1",
    port: 8003,
    allowedHosts: ["127.0.0.1", "localhost"],
    hot: false
  }
}
