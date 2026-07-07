// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import createChartComponent from "charts/components/create-chart-component"

import {
  addTableEventListeners,
  createTableChartAsync,
  updateTableChart
} from "./table-chart"

const TableChart = createChartComponent(
  createTableChartAsync,
  updateTableChart,
  addTableEventListeners
)

export default TableChart
