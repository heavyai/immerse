// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import createChartComponent from "charts/components/create-chart-component"

import {
  addScatterChartEventListeners,
  createScatterChartAsync,
  updateScatterChart
} from "./scatter-chart"

export const ScatterChart = createChartComponent(
  createScatterChartAsync,
  updateScatterChart,
  addScatterChartEventListeners
)

export default ScatterChart
