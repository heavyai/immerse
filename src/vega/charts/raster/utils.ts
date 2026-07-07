// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { VegaMapBounds } from "./types"

export const conv4326To900913 = (coord) => {
  const transCoord = [0.0, 0.0]
  transCoord[0] = coord[0] * 111319.49077777777778
  transCoord[1] =
    Math.log(Math.tan((90.0 + coord[1]) * 0.00872664625997)) *
    6378136.99911215736947
  return transCoord
}

export function debounce(func, wait, immediate) {
  let timeout = null
  return function debounced(...args) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this
    const later = () => {
      timeout = null
      if (!immediate) {
        func.apply(context, args)
      }
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) {
      func.apply(context, args)
    }
  }
}

export function valuesOb(obj) {
  return Object.keys(obj).map((key) => obj[key])
}

// Mapbox doesn't like coords being exactly on the edge.
const DELTA = 0.00001
const MAPBOX_LONMAX = 180
const MAPBOX_LONMIN = -180
const MAPBOX_LATMAX = 85
const MAPBOX_LATMIN = -85
const LONMAX = MAPBOX_LONMAX - DELTA
const LONMIN = MAPBOX_LONMIN + DELTA
const LATMAX = MAPBOX_LATMAX - DELTA
const LATMIN = MAPBOX_LATMIN + DELTA

export const cleanBounds = ({
  lonMin,
  lonMax,
  latMin,
  latMax
}: VegaMapBounds): VegaMapBounds | null => {
  const boundsAreValid =
    !isNaN(lonMin) &&
    !isNaN(lonMax) &&
    !isNaN(latMin) &&
    !isNaN(latMax) &&
    lonMax > lonMin &&
    latMax > latMin

  if (boundsAreValid) {
    return {
      lonMin: Math.max(lonMin, LONMIN),
      lonMax: Math.min(lonMax, LONMAX),
      latMin: Math.max(latMin, LATMIN),
      latMax: Math.min(latMax, LATMAX)
    }
  } else {
    return null
  }
}
