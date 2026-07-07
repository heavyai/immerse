// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import createChartComponent from "charts/components/create-chart-component"

import {
  addHeatChartEventListeners,
  createHeatChartAsync,
  updateHeatChart
} from "./heat-chart"

export const HeatChart = createChartComponent(
  createHeatChartAsync,
  updateHeatChart,
  addHeatChartEventListeners
)

export default HeatChart
