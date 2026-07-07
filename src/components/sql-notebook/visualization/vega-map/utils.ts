// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { WebMercatorViewport } from "@deck.gl/core"
import {
  MAPBOX_LAT_MAX,
  MAPBOX_LAT_MIN,
  MAPBOX_LON_MAX,
  MAPBOX_LON_MIN
} from "constants/magic-variables"
import { clamp } from "lodash"
import { ViewState } from "react-map-gl"

export function getBounds(viewState: ViewState) {
  const viewport = new WebMercatorViewport(viewState)
  const nw = viewport.unproject([0, 0])
  const se = viewport.unproject([viewport.width, viewport.height])
  return [nw, se]
}

export const clampLon = (lon: number) => {
  return clamp(lon, MAPBOX_LON_MIN, MAPBOX_LON_MAX)
}
export const clampLat = (lat: number) => {
  return clamp(lat, MAPBOX_LAT_MIN, MAPBOX_LAT_MAX)
}
