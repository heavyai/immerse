// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import LicenseCheckerWebpackPlugin, {
  Options
} from "license-checker-webpack-plugin"

const override = {
  /** License is spelled as UNLICENSE */
  "gif-encoder-2@^1.0.5": {
    licenseName: "Unlicense"
  },
  /** "Misspelled as 'Unlicense'" */
  "browser-cookies@^1.2.0": {
    licenseName: "Unlicense"
  },
  /** "License missing from package.json" */
  "component-indexof@^0.0.3": {
    licenseName: "MIT"
  },
  /** "License missing from package.json" */
  "flatbuffers@^1.11.0": {
    licenseName: "Apache-2.0"
  },
  /** "License missing from package.json" */
  "flatbuffers@^2.0.4": {
    licenseName: "Apache-2.0"
  },
  /** "License in package.json is SEE LICENSE IN LICENSE.txt" */
  "mapbox-gl@^1.5.0": {
    licenseName: "MIT AND BSD-3-Clause"
  },
  /** "License missing from package.json" */
  "onecolor@^2.5.0": {
    licenseName: "BSD-2-Clause"
  },
  /** "Invalid license format in package.json" */
  "rc-animate@^2.10.2": {
    licenseName: "MIT"
  },
  /** "Invalid license format in package.json" */
  "rc-trigger@^2.6.5": {
    licenseName: "MIT"
  },
  /** "Invalid license format in package.json" */
  "rc-util@^4.15.7": {
    licenseName: "MIT"
  },
  /** "License missing from package.json" */
  "react-selectize@^3.0.1": {
    licenseName: "Apache-2.0"
  },
  /** "License missing from package.json" */
  "@rooks/use-outside-click@^3.6.0": {
    licenseName: "MIT"
  },

  /** "License missing from package.json" */
  "@rooks/use-key@^3.6.0": {
    licenseName: "MIT"
  },
  /** "License missing from package.json" */
  "text-encoding-utf-8@^1.0.1": {
    licenseName: "MIT"
  },
  /** "License is mistagged as BSD (not a valid license type, and included LICENSE file is ISC)" */
  "wellknown@^0.5.0": {
    licenseName: "ISC"
  },
  /** "License missing from package.json" */
  "wildemitter@^1.2.1": {
    licenseName: "MIT"
  },
  /** "License in package.json is SEE LICENSE IN LICENSE" */
  "posthog-js@^1.38.0": {
    licenseName: "Apache-2.0"
  }
}

const approvedLicenses = `(${[
  "0BSD",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "ISC",
  "MIT",
  "Unlicense",
  "Zlib"
].join(" OR ")})`

export const licenseCheckerOptions: Partial<Options> = {
  allow: approvedLicenses,
  emitError: true,
  override,
  outputFilename: "licenses.txt"
}

export default new LicenseCheckerWebpackPlugin(licenseCheckerOptions)
