// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { useDispatch } from "react-redux"
import {
  setContourMajorIntervalSettings,
  setContourMinorIntervalSettings
} from "../raster-chart-actions"
import {
  CONTOUR_SETTINGS_KEYS,
  DEFAULT_MAJOR_COLOR,
  DEFAULT_MINOR_COLOR
} from "./constants"
import ContourDisplaySettings from "./contour-display-settings"

const ContourChartSettings = ({ chart, updateChart, id }) => {
  const dispatch = useDispatch()
  const { majorContourSettings, minorContourSettings } = chart
  const {
    NEIGHBORHOOD_FILL_RADIUS,
    FILL_ENABLED,
    FILL_OPACITY
  } = CONTOUR_SETTINGS_KEYS

  // Default the settings if we don't have any (chart just created)
  if (!majorContourSettings) {
    dispatch(
      setContourMajorIntervalSettings(id, {
        borderWidth: 2,
        borderColor: DEFAULT_MAJOR_COLOR,
        borderOpacity: 0.75
      })
    )
  }
  if (!minorContourSettings) {
    dispatch(
      setContourMinorIntervalSettings(id, {
        borderWidth: 1,
        borderColor: DEFAULT_MINOR_COLOR,
        borderOpacity: 0.5
      })
    )
  }
  if (!chart.hasOwnProperty(NEIGHBORHOOD_FILL_RADIUS)) {
    updateChart(id, {
      neighborhoodFillRadius: 1
    })
  }
  if (!chart.hasOwnProperty(FILL_ENABLED)) {
    updateChart(id, {
      fillEnabled: true
    })
  }
  if (!chart.hasOwnProperty(FILL_OPACITY)) {
    updateChart(id, {
      fillOpacity: 0.5
    })
  }

  return <ContourDisplaySettings chartId={id} />
}

export default ContourChartSettings
