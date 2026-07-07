// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { isMultiLayer } from "charts/raster-chart/raster-utils"

export function setChartZoom(chartId, mapZoomCenter) {
  return async (dispatch, getState, services) => {
    const chart = getState().charts[chartId]

    if (chart === undefined || !isMultiLayer(chart.type)) {
      return
    }

    const dcChart = services.get("dc").getChart(chart.dcFlag)

    if (dcChart) {
      if (mapZoomCenter !== undefined) {
        await dcChart.zoom(mapZoomCenter.zoom)
        await dcChart.center([
          mapZoomCenter.center.lng,
          mapZoomCenter.center.lat
        ])
      } else {
        await dcChart.zoom(0)
      }
    }
  }
}
