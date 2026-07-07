// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import ChoroplethDisplaySettings from "./choropleth-display-settings"

import dimensionSettings from "./dimension-settings"

const ChoroplethChartSettings = (props) => {
  if (!props.chart.polyCap) {
    props.updateChart(props.id, {
      polyCap: dimensionSettings.defaultCap
    })
  }
  return <ChoroplethDisplaySettings chartId={props.id} />
}

export default ChoroplethChartSettings
