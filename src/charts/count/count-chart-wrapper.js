// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import createChartComponent from "charts/components/create-chart-component"

import { createCountChartAsync, updateCountChart } from "./count-chart"

export const CountChart = createChartComponent(
  createCountChartAsync,
  updateCountChart
)

export default CountChart
