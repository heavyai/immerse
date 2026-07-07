// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { VegaPointmapChart, VegaPointmapQuerySpec } from "../types"
import { Filter } from "vega/constants/filter-types"

export const pointmapChartToQuerySpec = (
  chartId: string,
  chart: VegaPointmapChart,
  appliedFilters: Filter[]
): VegaPointmapQuerySpec => {
  const { dataSource, measures } = chart

  // Assume just a single lon measure and lat measure for now, as also specified in
  // the chart type definition in src/constants/charts.js
  const querySpec = {
    type: "vega-pointmap" as const,
    table: dataSource,
    lonMeasure: measures[0],
    latMeasure: measures[1],
    appliedFilters
  }

  return querySpec
}
