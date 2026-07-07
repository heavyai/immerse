// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { metersPerPixelAtZoom } from "utils/geo"
import mapboxgl from "services/mapbox-gl"
import { useChart } from "./useChart"
import { useDispatch } from "react-redux"
import { setSelectorError } from "actions/selector-action-creators"

export const useMetersPerPixel = (chartId) => {
  const chart = useChart(chartId)
  const dispatch = useDispatch()
  const { mapZoomCenter = {} } = chart
  const { zoom, center = {} } = mapZoomCenter

  if (center?.lat && zoom) {
    // If we have map information, use the easy calculation using latitude and zoom level
    return metersPerPixelAtZoom(center.lat, zoom)
  } else {
    // Otherwise take a "best guess" using the chart container dimensions + data dimensions
    const chartSelector = `.chart-container.chart-type-${chart.type}`
    const node = document.querySelector(chartSelector)
    const lonDim = chart?.dimensions?.find((d) => d.name === "Lon")
    const latDim = chart?.dimensions?.find((d) => d.name === "Lat")
    const [minLon, maxLon] = lonDim?.minMax ?? []
    const [minLat, maxLat] = latDim?.minMax ?? []
    const nodeValid = node?.clientWidth >= 0 && node?.clientHeight >= 0
    const dimsValid =
      minLat &&
      maxLat &&
      minLon &&
      maxLon &&
      chart?.dimensions?.every((d) => !d.isError)

    if (!dimsValid || !nodeValid) {
      return null
    }

    // TODO: This needs to account for the meridian
    // Figure out which side is longer (portrait or landscape)
    const useLat = maxLat - minLat > maxLon - minLon

    let start = null
    let end = null
    try {
      // If lat/lng are not valid values this will throw
      start = new mapboxgl.LngLat(minLon, minLat)
      // Choose which corner of the box to measure to (horizontal or vertical)
      end = useLat
        ? new mapboxgl.LngLat(minLon, maxLat)
        : new mapboxgl.LngLat(maxLon, minLat)
    } catch (e) {
      const index = e.message?.includes("latitude") ? 1 : 0
      dispatch(setSelectorError(chartId, { index, type: "dimensions" }))
      return null
    }
    const metersRange = start.distanceTo(end)
    const divisor = useLat ? node.clientHeight : node.clientWidth
    const metersPerPixel = Math.round(metersRange / divisor)
    return metersPerPixel
  }
}
