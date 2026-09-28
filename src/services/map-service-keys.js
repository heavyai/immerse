// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Mapbox and Google keys can be compiled in (MAPBOX_TOKEN / GOOGLE_API_KEY) or
// supplied after install on the first servers.json entry. The web server injects
// that file as window.APP_CONFIG before this bundle runs, so a product tarball
// recipient can edit servers.json without rebuilding Immerse.
// servers.json wins when both are set, so an install can override a build token.

function serversJsonEntry() {
  const raw = typeof window !== "undefined" ? window.APP_CONFIG : undefined
  const entry = Array.isArray(raw) ? raw[0] : raw
  return entry && typeof entry === "object" ? entry : {}
}

function firstNonEmpty(values) {
  for (let i = 0; i < values.length; i += 1) {
    const value = values[i]
    if (typeof value === "string" && value.trim()) {
      return value
    }
  }
  return undefined
}

export function getMapboxToken() {
  const config = serversJsonEntry()
  return firstNonEmpty([
    config.mapboxToken,
    config.MAPBOX_TOKEN,
    process.env.MAPBOX_TOKEN
  ])
}

export function getGoogleApiKey() {
  const config = serversJsonEntry()
  return firstNonEmpty([
    config.googleApiKey,
    config.GOOGLE_API_KEY,
    process.env.GOOGLE_API_KEY
  ])
}
