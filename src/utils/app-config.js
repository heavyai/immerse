// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { format } from "url"
import { cloneDeep } from "lodash"

// This parses the URL using the standard URL library, then converts the parsed components into the
// properties found in servers.json (i.e. separating `auth` into `username` & `password`, etc.)
function normalizeUrl(urlString) {
  if (typeof urlString === "object") {
    return urlString
  }
  if (typeof urlString !== "string" || !urlString) {
    return {}
  }

  let url = {}
  try {
    url = new URL(urlString)
  } catch (_) {
    // eslint-disable-next-line no-console
    console.error(
      "The 'url' field in servers.json is malformed and can not be parsed. Ignoring."
    )
    return {}
  }

  const normalized = {}

  if (url.protocol) {
    normalized.protocol = url.protocol ? url.protocol.replace(":", "") : "http"
  }

  if (url.hostname) {
    normalized.host = url.hostname
  }

  if (url.port) {
    const numericalPort = Number(url.port)
    normalized.port = numericalPort
  }

  if (typeof url.path === "string") {
    const database = url.path.replace("/", "")
    if (database) {
      normalized.database = database
    }
  }

  return normalized
}

// Since we can specify the backend URL in multiple ways, this creates a single URL object from
// the data in servers.json. The explicit address parts take precedence (host, port, protocol),
// then the `url` field. If both are specified, the inidividual parts overwrite the `url` string.
export const normalizeAppConfig = (serversJson) => {
  const serverConfig = Array.isArray(serversJson)
    ? cloneDeep(serversJson[0])
    : cloneDeep(serversJson || {})

  // Order of precedence (highest to lowest): url > components (host, port, etc) > window.location
  const windowUrl = normalizeUrl(window.location.toString())
  const serversUrl = normalizeUrl(serverConfig.url)

  const combinedUrl = {
    ...windowUrl,
    ...cloneDeep(serverConfig),
    ...serversUrl
  }

  if (!combinedUrl.protocol) {
    combinedUrl.protocol = "http"
  }

  if (!combinedUrl.port) {
    combinedUrl.port = combinedUrl.protocol === "http" ? 80 : 443
  }

  if (!combinedUrl.url) {
    try {
      // strip off any port if included in host
      const hostname = (combinedUrl.host || combinedUrl.hostname).replace(
        /:.+$/gi,
        ""
      )
      combinedUrl.url = format({
        protocol: combinedUrl.protocol,
        hostname,
        port: combinedUrl.port
      })
    } catch (e) {
      throw new Error(
        `Could not construct a server URL from the address information in servers.json: ${e.message}`
      )
    }
  } else {
    combinedUrl.url = format({
      protocol: combinedUrl.protocol,
      hostname: combinedUrl.host,
      port: combinedUrl.port
    })
  }

  return combinedUrl
}

export const hasCredentials = (appConfig) =>
  appConfig.username && appConfig.password && appConfig.database
