// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-sync */

import "core-js/stable"
import { JSDOM } from "jsdom"
import atob from "atob"
import btoa from "btoa"
import url from "url"

const exposedProperties = ["window", "navigator", "document"]

global.window = new JSDOM(`<!doctype html><html><body></body></html>`, {
  resources: "usable",
  runScripts: "dangerously",
  url: "http://localhost"
}).window
global.document = global.window.document
global.window.atob = atob
global.window.btoa = btoa
global.window.URL = url
global.window.IMMERSE_PATH_PREFIX = ""
global.window.TCopyParams = () => {}
global.window.TDatumType = {
  SMALLINT: 0,
  INT: 1,
  BIGINT: 2,
  FLOAT: 3,
  DECIMAL: 4,
  DOUBLE: 5,
  STR: 6,
  TIME: 7,
  TIMESTAMP: 8,
  DATE: 9,
  BOOL: 10,
  INTERVAL_DAY_TIME: 11,
  INTERVAL_YEAR_MONTH: 12
}
global.window.TEncodingType = {
  NONE: 0,
  FIXED: 1,
  RL: 2,
  DIFF: 3,
  DICT: 4,
  SPARSE: 5
}

Object.keys(global.window).forEach((property) => {
  if (typeof global[property] === "undefined") {
    exposedProperties.push(property)
    global[property] = global.window[property]
  }
})

global.navigator = {
  userAgent: "node.js"
}
require("mutationobserver-shim")
global.MutationObserver = global.window.MutationObserver
document.getSelection = () => {}
global.Node = global.window.Node
global.Text = global.window.Text
global.HTMLElement = global.window.HTMLElement
global.Event = global.window.Event
global.EventTarget = global.window.EventTarget
global.TextDecoder = TextDecoder

global.Element = () => {
  /* No op to fix what could be an issue in rmwc polyfills: https://github.com/jamesmfriedman/rmwc/issues/503 */
}

global.document.createRange = () => ({
  setEnd() {},
  setStart() {},
  getBoundingClientRect() {
    return { right: 0 }
  },
  getClientRects() {
    return {
      length: 0,
      left: 0,
      right: 0
    }
  }
})

global.requestAnimationFrame = (callback) => {
  // React 16+ depends on requestAnimationFrame (even in test environments)
  // https://reactjs.org/blog/2017/09/26/react-v16.0.html#javascript-environment-requirements
  setTimeout(callback, 0)
}

global.window.requestAnimationFrame = (callback) => {
  // React 16+ depends on requestAnimationFrame (even in test environments)
  // https://reactjs.org/blog/2017/09/26/react-v16.0.html#javascript-environment-requirements
  setTimeout(callback, 0)
}

// eslint-disable-next-line init-declarations
let config
try {
  // eslint-disable-next-line global-require
  config = require("../src/servers.local")
} catch {
  // eslint-disable-next-line global-require
  config = require("../src/servers")
}
global.window.APP_CONFIG = config
