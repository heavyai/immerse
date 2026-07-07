// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

import mockProxy from "utils/MockProxy"

function getMockMapKey(arg) {
  if (typeof arg === "string") {
    return arg
  } else if (arg === null) {
    return "null"
  } else if (arg === undefined) {
    return "undefined"
  } else {
    const json = JSON.stringify(arg)
    return json.replace(/\s*,?\s*"queryId":\d+\s*,?\s*/, "", "g")
  }
}

function insertIntoMockMap(args, res, map) {
  const key = getMockMapKey(args.shift())
  if (map[key] === undefined) {
    map[key] = {}
  }
  if (args.length) {
    return insertIntoMockMap(args, res, map[key])
  } else {
    map[key] = res
    return res
  }
}

function retrieveFromMockMap(args, queries) {
  if (queries === undefined) {
    return undefined
  } else {
    const key = getMockMapKey(args.shift())
    const subQueries = queries[key]
    if (args.length) {
      return retrieveFromMockMap(args, subQueries)
    } else {
      return subQueries
    }
  }
}

const methodsToSkip = new Set([
  "getSessionInfoAsync",
  "getHardwareInfoAsync",
  "getStatusAsync"
])

const methodsToInclude = new Set(["validateQuery"])
function shouldMockMethod(method) {
  return (
    typeof method === "string" &&
    (methodsToInclude.has(method) ||
      (method.match(/Async$/) && !methodsToSkip.has(method)))
  )
}

export function createMockableConnector(connector) {
  // first things first... if we're not using the mock connector, then do nothing.
  if (!getFeatureFlag(available_feature_flags.ENABLE_MOCK_CONNECTOR)) {
    return connector
  }
  // we're going to make any Async method mockable.

  window.mockMap = {}

  let useMocks = false

  const { proxy } = mockProxy(
    connector,
    shouldMockMethod,
    (c, method) => (...args) => {
      if (useMocks) {
        const res = retrieveFromMockMap([method, ...args], window.mockedQueries)
        if (res) {
          return Promise.resolve(res)
        } else {
          // eslint-disable-next-line
          console.error(
            `Could not retrieve results for ${method} with ${JSON.stringify(
              args
            )}`
          )
          throw new Error(
            `Could not retrieve results for ${method} with ${JSON.stringify(
              args
            )}`
          )
        }
      } else {
        return c[method](...args).then((res) => {
          insertIntoMockMap([method, ...args], res, window.mockMap)
          return res
        })
      }
    }
  )

  proxy.clearMockedQueries = () => {
    window.mockMap = {}
  }

  proxy.unmockConnection = () => {
    useMocks = false
  }

  proxy.mockConnection = (cachedQueries) => {
    window.mockedQueries = cachedQueries
    useMocks = true
  }

  return proxy
}
