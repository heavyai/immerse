// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const baseConfig = {
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js", "jsx", "json", "ts", "tsx"],
  moduleNameMapper: {
    "\\.css$": "identity-obj-proxy",
    "\\.sass$": "identity-obj-proxy",
    "\\.scss$": "identity-obj-proxy",
    "^actions/(.*)$": "<rootDir>/src/actions/$1",
    "^constants/(.*)$": "<rootDir>/src/constants/$1",
    "^services/(.*)$": "<rootDir>/src/services/$1",
    "^utils/(.*)$": "<rootDir>/src/utils/$1",

    "^vega-lite$": "<rootDir>/node_modules/vega-lite/build/vega-lite.min.js",
    "^fs$": "<rootDir>/test-config/__mocks__/fs.js",
    "^node:fs$": "<rootDir>/test-config/__mocks__/fs.js"
  },
  modulePaths: ["<rootDir>/src/", "<rootDir>/test-config/"],
  transform: {
    "^.+\\.(png|jpg|svg)$": "jest-transform-stub",
    "\\.[jt]sx?$": "babel-jest"
  },
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(?!(@heavyai|robust-predicates|delaunator|d3-.*|axios|internmap|formdata-polyfill|fetch-blob|data-uri-to-buffer|node-fetch|vega|suneditor|legendables|@mapbox-controls|@mapbox|vega-.*|cheerio|cheerio-.*))"
  ],
  setupFiles: ["jest-canvas-mock", "<rootDir>/test-config/jest-shim"]
}

module.exports = {
  ...baseConfig,
  automock: false,
  snapshotSerializers: ["enzyme-to-json/serializer"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.test.{js,jsx,ts,tsx}",
    "!src/**/*.spec.{js,jsx,ts,tsx}",
    "!src/ui-tests/*.{js,jsx,ts,tsx}"
  ],
  coverageDirectory: "coverage_jest",
  coverageReporters: ["html", "text"],
  reporters: ["default", ["jest-junit", { outputName: "jest-results.xml" }]],
  testEnvironmentOptions: {
    url: "http://localhost/"
  },
  projects: [
    {
      ...baseConfig,
      displayName: "UNIT",
      testMatch: [
        "<rootDir>/src/**/?(*.)unit.test.js?(x)",
        "<rootDir>/src/**/?(*.)unit.test.ts?(x)"
      ],
      setupFilesAfterEnv: ["<rootDir>/test-config/setup-jest.js"]
    },
    {
      ...baseConfig,
      displayName: "COMPONENT",
      testMatch: [
        "<rootDir>/src/**/?(*.)component.test.js?(x)",
        "<rootDir>/src/**/?(*.)component.test.ts?(x)"
      ],
      setupFilesAfterEnv: ["<rootDir>/test-config/setup-jest.js"]
    },
    {
      ...baseConfig,
      // UI tests run under real Node + puppeteer; the fs mapper from
      // baseConfig breaks puppeteer's cosmiconfig (fs_1.default.statSync).
      moduleNameMapper: Object.fromEntries(
        Object.entries(baseConfig.moduleNameMapper).filter(
          ([key]) => key !== "^fs$" && key !== "^node:fs$"
        )
      ),
      displayName: "UI",
      preset: "jest-puppeteer",
      testEnvironment: "jest-environment-puppeteer",
      testMatch: [
        "<rootDir>/src/**/?(*.)ui.test.js?(x)",
        "<rootDir>/src/**/?(*.)ui.test.ts?(x)"
      ],
      setupFilesAfterEnv: [
        "expect-puppeteer",
        "<rootDir>/test-config/setup-jest-ui.js"
      ]
    }
  ]
}
