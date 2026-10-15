// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const path = require("path")

const repositoryRoot = path.resolve(__dirname, "../..")
const harnessNodeModules = path.resolve(__dirname, "node_modules")

module.exports = {
  rootDir: repositoryRoot,
  automock: false,
  displayName: "UI",
  moduleFileExtensions: ["js", "jsx", "json", "ts", "tsx"],
  moduleNameMapper: {
    "^puppeteer$": require.resolve("puppeteer")
  },
  modulePaths: ["<rootDir>/src/", "<rootDir>/test-config/", harnessNodeModules],
  preset: require.resolve("jest-puppeteer/jest-preset.js"),
  reporters: [
    "default",
    [
      require.resolve("jest-junit"),
      {
        outputDirectory: repositoryRoot,
        outputName: "jest-results.xml"
      }
    ]
  ],
  setupFiles: [
    require.resolve("jest-canvas-mock"),
    path.resolve(__dirname, "jest-shim.js")
  ],
  setupFilesAfterEnv: [path.resolve(__dirname, "setup-jest-ui.js")],
  testMatch: [
    "<rootDir>/src/**/?(*.)ui.test.js?(x)",
    "<rootDir>/src/**/?(*.)ui.test.ts?(x)"
  ],
  testPathIgnorePatterns: ["<rootDir>/src/ui-tests/playwright/"],
  transform: {
    "\\.[jt]sx?$": [
      require.resolve("babel-jest"),
      {
        configFile: path.resolve(__dirname, "babel.config.js")
      }
    ]
  }
}
