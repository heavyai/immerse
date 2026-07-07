// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { CROSS_SECTION_SETTINGS_KEYS } from "./constants"
import CrossSectionDisplaySettings from "./cross-section-display-settings"

const TerrainChartSettings = ({ chart, updateChart, id }) => {
  const { SMOOTHING } = CROSS_SECTION_SETTINGS_KEYS

  if (!chart.hasOwnProperty(SMOOTHING)) {
    updateChart(id, {
      smoothing: 10
    })
  }

  return <CrossSectionDisplaySettings chartId={id} />
}

export default TerrainChartSettings
