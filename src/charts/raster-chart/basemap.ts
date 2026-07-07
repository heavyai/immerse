// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import mapboxgl from "services/mapbox-gl"
import { contains } from "ramda"

import {
  OFFLINE_BASEMAP,
  BASEMAP_OPTIONS,
  BASEMAP_OPTIONS_3D,
  DEFAULT_BASEMAP,
  MINIMALIST_BASEMAP_STYLE,
  MINIMALIST_BASEMAP_VALUE,
  MINIMALIST_THEME_LABEL
} from "constants/charts"
import { currentTheme } from "utils/dark-mode-switcher"
import { Basemap, ChartState } from "reducers/charts/charts-reducer-types"
import { DARK_THEME } from "utils/theme/types"

let availableBasemaps: Basemap[] = BASEMAP_OPTIONS
const available3DBasemaps: Basemap[] = BASEMAP_OPTIONS_3D
let defaultBasemap: Basemap = DEFAULT_BASEMAP

const MAPBOX_URL = mapboxgl.baseApiUrl
const URL_REGEX = /^https?:\/\/[^/]+/
const CACHE_KEY = "knownBasemapHosts"

function isObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null
}

export function isLegacyMinimalistBasemapValue(value: unknown): boolean {
  if (!isObject(value)) {
    return false
  }

  const countriesSource = value.sources?.countries
  if (!isObject(countriesSource)) {
    return false
  }

  const hasCountriesLayer = Array.isArray(value.layers)
    ? value.layers.some(
        (layer) => layer?.id === "countries" && layer?.source === "countries"
      )
    : false

  return (
    countriesSource.type === "geojson" &&
    typeof countriesSource.data === "object" &&
    hasCountriesLayer
  )
}

export function normalizeBasemap(basemap?: Basemap): Basemap | undefined {
  if (!basemap) {
    return basemap
  }

  if (basemap.value === MINIMALIST_BASEMAP_VALUE) {
    return basemap
  }

  if (
    basemap.label === MINIMALIST_THEME_LABEL &&
    isLegacyMinimalistBasemapValue(basemap.value)
  ) {
    return {
      ...basemap,
      value: MINIMALIST_BASEMAP_VALUE
    }
  }

  return basemap
}

export function resolveBasemapValue(
  basemapValue: Basemap["value"]
): Basemap["value"] {
  return basemapValue === MINIMALIST_BASEMAP_VALUE
    ? ((MINIMALIST_BASEMAP_STYLE as unknown) as Basemap["value"])
    : basemapValue
}

/**
 * @param s A string that possibly contains a url
 * @returns the host in the string, if it's a url, or null otherwise
 */
function extractHost(s: string): string | null {
  if (s === "current" || s.startsWith("mapbox://")) {
    return MAPBOX_URL
  }

  const m = URL_REGEX.exec(s)
  if (m) {
    return m[0]
  }
  return null
}

/**
 * @param basemaps An array of basemaps
 * @returns a map of required hosts to correspoding basemap index
 */
function buildHostToIdx(basemaps: Basemap[]): Record<string, number[]> {
  const hostToIdx: Record<string, number[]> = {}
  const addHost = (s: string, idx: number) => {
    const host = extractHost(s)
    if (host) {
      if (host in hostToIdx) {
        hostToIdx[host].push(idx)
      } else {
        hostToIdx[host] = [idx]
      }
    }
  }
  basemaps.forEach(({ value }, idx) => {
    if (typeof value === "string") {
      addHost(value, idx)
    } else {
      if (value.sources) {
        Object.values(value.sources).forEach((source) => {
          if (source.tiles) {
            source.tiles.forEach((tile) => addHost(tile, idx))
          } else if (source.url) {
            addHost(source.url, idx)
          } else if (typeof source.data === "string") {
            addHost(source.data, idx)
          } else if (source.urls) {
            source.urls.forEach((url) => addHost(url, idx))
          }
        })
      }
      if (typeof value.sprite === "string") {
        addHost(value.sprite, idx)
      }
      if (typeof value.glyphs === "string") {
        addHost(value.glyphs, idx)
      }
    }
  })
  return hostToIdx
}

/** @returns a map of known good/bad hosts */
function getKnownHosts(): Record<string, boolean> {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY)
    if (cached) {
      return JSON.parse(cached) as Record<string, boolean>
    }
  } catch (_) {
    // ignore errors
  }
  return {}
}

/**
 * Cache known good/bad hosts to sessionStorage
 * @param knownHosts A map of host to true/false
 */
function saveKnownHosts(knownHosts: Record<string, boolean>) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(knownHosts))
  } catch (_) {
    // ignore errors
  }
}

/**
 * Initializes the list of available basemaps
 * @param user Information about the user
 */

function combineCustomBasemaps(
  customBasemaps: Basemap[] = [],
  immerseBasemaps: any[] = []
) {
  const customKeys = new Set(customBasemaps.map((b) => b.label))
  return [
    ...customBasemaps.filter((basemap) => basemap.value),
    ...immerseBasemaps.filter((basemap) => !customKeys.has(basemap.label))
  ]
}

export async function initializeAvailableBasemaps(user) {
  if (user.offline) {
    availableBasemaps = OFFLINE_BASEMAP
    defaultBasemap = availableBasemaps[0]
    return
  }

  // build complete list of basemap options
  const basemaps: Basemap[] = combineCustomBasemaps(
    user.mapboxCustomStyles,
    BASEMAP_OPTIONS
  )

  if (process.env.NODE_ENV === "test") {
    availableBasemaps = basemaps
    defaultBasemap = DEFAULT_BASEMAP
    return
  }

  // compile a list of hosts to check and the corresponding basemaps
  const hostToIdx = buildHostToIdx(basemaps)
  const hosts = Object.keys(hostToIdx)
  if (hosts.length === 0) {
    availableBasemaps = basemaps
    defaultBasemap = DEFAULT_BASEMAP
    return
  }

  // check if there are any hosts we cannot reach
  const knownHosts = getKnownHosts()
  const unreachable = await Promise.all(
    hosts.map((host) =>
      host in knownHosts
        ? Promise.resolve(!knownHosts[host])
        : fetch(host, { method: "HEAD", mode: "no-cors" })
            .then(() => false)
            .catch(() => true)
    )
  )

  // compile a list of indexes to bad basemaps
  const unreachableIdxs = new Set<number>()
  unreachable.forEach((isUnreachable, hostIdx) => {
    if (isUnreachable) {
      hostToIdx[hosts[hostIdx]].forEach((i) => unreachableIdxs.add(i))
    }
    knownHosts[hosts[hostIdx]] = !isUnreachable
  })

  // update cache
  saveKnownHosts(knownHosts)

  // cull basemaps and set available/default
  availableBasemaps = basemaps.filter((_, i) => !unreachableIdxs.has(i))
  if (availableBasemaps.find(({ value }) => value === "current")) {
    defaultBasemap = DEFAULT_BASEMAP
  } else {
    defaultBasemap = availableBasemaps[0]
  }
}

/**
 * FOR USE IN TESTS ONLY!
 * @param custom Custom basemap options - prepended to `base`, default []
 * @param def Set the default basemap - default DEFAULT_BASEMAP
 * @param base Base options - appended to `custom`, default BASEMAP_OPTIONS
 */
export function initializeBasemapsForTests(
  custom: Basemap[] = [],
  def: Basemap = null,
  base: Basemap[] = BASEMAP_OPTIONS
) {
  availableBasemaps = custom.concat(base)
  if (def) {
    defaultBasemap = def
  } else if (availableBasemaps.find(({ value }) => value === "current")) {
    defaultBasemap = DEFAULT_BASEMAP
  } else {
    defaultBasemap = availableBasemaps[0]
  }
}

export function currentBasemapValue(chart: ChartState): Basemap["value"] {
  let basemap = normalizeBasemap(chart.basemap)
  if (!basemap || !validBasemap(chart)) {
    basemap = getDefaultBasemap()
  }
  if (basemap.value === "current") {
    const theme = currentTheme()
    if (theme === DARK_THEME) {
      basemap = availableBasemaps.find(({ label }) => label === "Dark")
    } else {
      basemap = availableBasemaps.find(({ label }) => label === "Light")
    }
    if (!basemap) {
      basemap = OFFLINE_BASEMAP[0]
    }
  }
  return resolveBasemapValue(basemap.value)
}

export function getDefaultBasemap(): Basemap {
  // if the user has provided a default attribute in one of the mapboxCustomStyles, then then first default
  // becomes our new default.
  const defaultBasemapOverride = availableBasemaps.find(
    (b) => b.default === true
  )
  return defaultBasemapOverride || defaultBasemap
}

export function getAvailableBasemapsForChart(chart?: ChartState): Basemap[] {
  if (chart?.type === "deckgl") {
    return availableBasemaps.concat(available3DBasemaps)
  }
  return availableBasemaps
}

export function validBasemap(chart?: ChartState): boolean {
  const chartBasemap = normalizeBasemap(chart?.basemap)
  return (
    contains(chartBasemap, availableBasemaps) ||
    (chart?.type === "deckgl" && contains(chartBasemap, available3DBasemaps))
  )
}

/*
  a basemap is an object with { label, value }. If the user changed the value of the basemap,
  any pre-existing map would just go back to the system default. Now we allow the user to change the mapbox url
  but keep the theme name, and this will upgrade basemaps in place.

  If the user configures a basemap to now have a falsy value (i.e., empty string or undefiend, etc) then the
  map will go to the default (and this is not revertable)
*/

export function upgradeBasemap(chart: ChartState) {
  const chartBasemap = normalizeBasemap(chart?.basemap)
  const upgradedBasemap = availableBasemaps.find(
    (b) => b.label === chartBasemap?.label
  )

  if (upgradedBasemap?.value) {
    return upgradedBasemap
  } else {
    return getDefaultBasemap()
  }
}
