// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import createChartComponent from "charts/components/create-chart-component"

import {
  addRowChartEventListeners,
  createRowChartAsync,
  updateRowChart
} from "./row-chart"

export const RowChart = createChartComponent(
  createRowChartAsync,
  updateRowChart,
  addRowChartEventListeners
)

export default RowChart
