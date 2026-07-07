// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          browsers: [
            "Chrome >= 52",
            "FireFox >= 44",
            "Safari >= 7",
            "Explorer 11",
            "last 4 Edge versions"
          ],
          node: "current"
        },
        useBuiltIns: "usage",
        corejs: "3",
        modules: "commonjs"
      }
    ],
    "@babel/preset-react",
    "@babel/preset-typescript"
  ],

  env: {
    test: {
      ignore: ["node_modules/mapbox-gl/dist/mapbox-gl.js"],
      plugins: [
        typeof process.env.JEST_WORKER_ID === undefined && [
          "istanbul",
          {
            exclude: ["**/*.spec.js", "**/*.test.{js,ts,jsx,tsx}"]
          }
        ],
        [
          "babel-plugin-transform-require-ignore",
          {
            extensions: [".less", ".sass", ".css", ".scss"]
          }
        ],
        ["@babel/plugin-transform-runtime"],
        ["babel-plugin-transform-object-hasown"]
      ].filter(Boolean)
    },
    development: {
      plugins: ["react-hot-loader/babel"]
    }
  },
  plugins: [
    "lodash",
    "@babel/plugin-proposal-export-namespace-from",
    "@babel/plugin-proposal-function-bind",
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-syntax-import-meta",
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-json-strings",
    [
      "@babel/plugin-proposal-decorators",
      {
        legacy: true
      }
    ],
    "@babel/plugin-proposal-function-sent",
    "@babel/plugin-proposal-numeric-separator",
    "@babel/plugin-proposal-throw-expressions",
    "@babel/plugin-proposal-export-default-from",
    "@babel/plugin-proposal-logical-assignment-operators",
    "@babel/plugin-proposal-optional-chaining",
    [
      "@babel/plugin-proposal-pipeline-operator",
      {
        proposal: "minimal"
      }
    ],
    "@babel/plugin-proposal-nullish-coalescing-operator",
    "@babel/plugin-proposal-do-expressions",
    "@babel/proposal-object-rest-spread",
    "@babel/plugin-syntax-import-attributes",
    "@babel/plugin-syntax-top-level-await"
  ]
}
