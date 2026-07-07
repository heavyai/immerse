// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { SPECIAL } from "constants/chart-types"

import CountChart from "./count-chart-wrapper"

const countChartDefinition = {
  type: "count",
  typeConstant: "COUNT",
  chartTypeCategories: [SPECIAL],
  Component: CountChart,
  dimensionSettings: {},
  visible: true
}

export default countChartDefinition
