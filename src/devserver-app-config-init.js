// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const urlConfigKeys = ["url", "protocol", "host", "port"]
const getUrlFreeConfig = (config) =>
  Object.keys(config).reduce(
    (result, key) =>
      !urlConfigKeys.includes(key)
        ? {
            ...result,
            [key]: config[key]
          }
        : { ...result },
    {}
  )

// eslint-disable-next-line init-declarations
let config
try {
  // eslint-disable-next-line global-require
  config = require("./servers.local")
  // eslint-disable-next-line no-console
  console.log("APP_CONFIG using servers.local.json")
  // Remove url config items to app will default XHR urls to window.location
  config[0] = getUrlFreeConfig(config[0])
} catch {
  try {
    // eslint-disable-next-line global-require
    config = require("./servers")
    // eslint-disable-next-line no-console
    console.log("APP_CONFIG using servers.json")
  } catch (error) {
    const missingFile =
      error.name === "Error" && error.message.startsWith("Cannot find module")
    // Associated with a 404 response for /servers.json
    const webServerRelated =
      error.name === "SyntaxError" &&
      error.message.includes("Unexpected token < in JSON at position 0")

    if (missingFile) {
      // eslint-disable-next-line no-console
      console.error("File servers.json not found")
    } else if (webServerRelated) {
      // eslint-disable-next-line no-console
      console.error(
        "Check web server configuration for missing or invalid servers.json"
      )
    } else {
      // eslint-disable-next-line no-console
      console.error("Invalid servers.json")
    }
  }
}

window.APP_CONFIG = config
