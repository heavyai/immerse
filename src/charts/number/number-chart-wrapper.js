// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import createChartComponent from "charts/components/create-chart-component"

import { createNumberChartAsync, updateNumberChart } from "./number-chart"

export const NumberChart = createChartComponent(
  createNumberChartAsync,
  updateNumberChart
)

export default NumberChart
