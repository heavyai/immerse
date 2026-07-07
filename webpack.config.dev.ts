// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// This is the "development" configuration for Webpack, for production use webpack.config.prod.js
import path from "path"
import fs from "fs"
import { merge } from "webpack-merge"
import { Configuration, WebpackError } from "webpack"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import CircularDependencyPlugin from "circular-dependency-plugin"
import { Configuration as DevConfig } from "webpack-dev-server"
import Dotenv from "dotenv-webpack"

import { commonConfig } from "./webpack.config.common"

import KNOWN_CIRCLES from "./circles.json"

let serversJSONPath = ""
try {
  serversJSONPath = require.resolve("./src/servers.local")
} catch (_e) {
  serversJSONPath = require.resolve("./src/servers")
}

let serversJSON = require(serversJSONPath)

// TODO: Remove this machinery to "accept" existing circular dependencies, once those are all fixed
const detectedCircles: any = {}

const DEFAULT_PORT = 3000
const IMMERSE_BUILD_MODE = process.env.IMMERSE_BUILD_MODE
const verboseMode = IMMERSE_BUILD_MODE !== "fast"

const IS_DEV_SERVER = process.env.WEBPACK_SERVE === "true"

const normalizeProtocol = (protocol: string) => {
  const foundColon = protocol.indexOf(":")
  return protocol
    ? protocol.substr(0, foundColon > -1 ? foundColon : protocol.length)
    : "http"
}

const getUrlFromConfig = ({
  protocol = "http:",
  host = "",
  port = DEFAULT_PORT
}) => {
  if (!host) {
    throw new Error("Domain required to build URL")
  }
  return `${normalizeProtocol(protocol)}://${host}${port ? `:${port}` : ""}`
}

const getProxyUrl = () => serversJSON[0].url || getUrlFromConfig(serversJSON[0])

// load a custom webpack config file if present
let custom = {}
try {
  // eslint-disable-next-line global-require
  custom = require("./webpack.config.custom.js")
} catch (error) {
  // swallow module not found error
  // if webpack.config.custom.js is not found
}

const isDevEnv = process.env.NODE_ENV === "development"
const devtool = isDevEnv && !verboseMode ? "eval" : "source-map"

const bundle = [
  ...(IS_DEV_SERVER ? ["./src/devserver-app-config-init.js"] : []),
  ...["react-hot-loader/patch", "./src/index.js"]
]

const devServerOptions: DevConfig = {
  port: process.env.PORT || DEFAULT_PORT, // what port on localhost content will be served from
  compress: true, // use compression
  // hot: true, // enables react-refresh
  historyApiFallback: true,
  client: {
    overlay: false
  },
  proxy: {
    "/": {
      // target must be set, but the value isn't actually used - the return value
      // from `router` is used instead
      target: getProxyUrl(),
      // since this function will be called on each request, as opposed to
      // `target` above, we can return the new value as serversJSON changes
      router: getProxyUrl,
      logLevel: "debug",
      secure: false,
      headers: { Connection: "keep-alive" },
      bypass: (req) => (req.headers.accept?.includes("html") ? "/" : null),
      ...(serversJSON[0].devProxyOptions || {})
    }
  },
  setupMiddlewares: (middlewares, { app }) => {
    if (!app) {
      throw new Error("webpack-dev-server is not defined")
    }

    // watch serversJSONPath for changes and reload
    fs.watch(serversJSONPath, () => {
      // clear node's cache of servers json
      delete require.cache[serversJSONPath]
      // eslint-disable-next-line global-require
      serversJSON = require(serversJSONPath)
      // eslint-disable-next-line no-console
      console.log("Now proxying to", getProxyUrl())
    })

    app.get("/servers.json", (_, res) => res.json(serversJSON))
    // resolve path to geojson files (this could be replaced with ES6 dynamic imports)
    app.get("/geojson/:json", (req, res) =>
      res.sendFile(
        path.join(__dirname, `/src/charts/geojson/${req.params.json}`)
      )
    )
    app.get("/app-config.js", (_, res) =>
      res.sendFile(path.join(__dirname, "/src/app-config.js"))
    )

    return middlewares
  }
}

export const devConfig = merge<Configuration>(
  commonConfig,
  {
    // specify the root module for our application aka entry point
    // the react-hot-loader/patch preceeds this bc react-hot-loader@beta.7
    entry: {
      polyfills: "./src/polyfills.js",
      bundle
    },

    // enables proxy logs in the terminal
    infrastructureLogging: {
      debug: [(name) => name.includes("webpack-dev-server")]
    },

    devtool,

    // Webpack 5 only invalidates module cache if package version changes; we
    // need to exclude heavyai path to pick up symlinked module changes
    snapshot: {
      managedPaths: [/^node_modules\/(?!@heavyai).*/]
    },

    // build stats to display while webpack is running: https://webpack.js.org/configuration/stats/
    stats: {
      assets: verboseMode,
      colors: true,
      children: verboseMode,
      chunks: false,
      chunkModules: false,
      chunkOrigins: false,
      errors: true,
      errorDetails: verboseMode,
      hash: verboseMode,
      modules: false,
      moduleTrace: verboseMode,
      performance: verboseMode,
      reasons: verboseMode,
      source: verboseMode,
      timings: true,
      version: verboseMode,
      warnings: true
    },

    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader
            },
            {
              loader: "css-loader",
              options: {
                sourceMap: true
              }
            }
          ]
        },
        {
          test: /\.scss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader
            },
            {
              loader: "css-loader",
              options: {
                sourceMap: true
              }
            },
            {
              loader: "sass-loader",
              options: {
                // eslint-disable-next-line global-require
                implementation: require("sass"),
                api: "legacy",
                sourceMap: true,
                sassOptions: {
                  silenceDeprecations: [
                    "import",
                    "color-functions",
                    "global-builtin",
                    "slash-div",
                    "legacy-js-api"
                  ],
                  quietDeps: true
                }
              }
            }
          ]
        }
      ]
    },

    // webpack dev-server configuration
    devServer: devServerOptions,

    plugins: [
      new CircularDependencyPlugin({
        // exclude detection of files based on a RegExp
        exclude: /node_modules/,
        // TODO: Replace below methods with just this line, once all circular dependencies are fixed
        // failOnError: true,
        onDetected: ({ paths, compilation }) => {
          const circle = `${paths.join(" -> ")}`

          detectedCircles[circle] = true

          if (!KNOWN_CIRCLES.find((knownCircle) => knownCircle === circle)) {
            // Fail the build if it's a new circle
            compilation.errors.push(
              new WebpackError(`New circular dependency detected:\n ${circle}`)
            )
          }
        },
        onEnd: () => {
          // Check if we've detected any circles yet - onEnd will be called many times before that, only once after
          if (Object.keys(detectedCircles).length) {
            const fixedCircles = KNOWN_CIRCLES.filter(
              (knownCircle) => !detectedCircles[knownCircle]
            )

            if (fixedCircles.length > 0) {
              // eslint-disable-next-line no-console
              console.log(
                "\x1b[32m",
                "These circular dependencies were not detected and may be removed:\n\n",
                fixedCircles.join("\n"),
                "\x1b[0m"
              )
            }
          }
        }
      }),
      new MiniCssExtractPlugin({
        filename: "[name].css",
        chunkFilename: "[id].css"
      }),
      new Dotenv({ expand: true })
    ],
    resolve: {
      alias: {
        "react-dom": "@hot-loader/react-dom"
      }
    }
  },
  custom
) // note that custom will override other settings

export default devConfig
