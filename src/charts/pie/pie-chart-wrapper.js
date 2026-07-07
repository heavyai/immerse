// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import createChartComponent from "charts/components/create-chart-component"

import {
  createPieChartAsync,
  updatePieChart,
  addPieEventListeners
} from "./pie-chart"

const PieChart = createChartComponent(
  createPieChartAsync,
  updatePieChart,
  addPieEventListeners
)

export default PieChart
