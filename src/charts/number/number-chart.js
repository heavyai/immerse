// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import colorChart from "charts/utils/color-chart"
import composeMeasures from "charts/utils/compose-measures"
import createUpdateFunctionForChart from "charts/utils/create-update-function-for-chart"
import dc from "services/dc"
import generalChartUpdate from "charts/utils/general-chart-update"
import promisifyChartCreation from "charts/utils/promisify-chart-creation"
import specificChartUpdates from "charts/utils/specific-chart-updates"
import { setValueFormatter } from "actions/charts-action-creators"
import { getTablesForDataSource } from "components/join-manager/utils"

export function createNumberChart(crossFilter) {
  return function Number(chartSpec, node, callback) {
    try {
      const tables = getTablesForDataSource(chartSpec.dataSource)
      const NumberChart = dc.numberChart(node, tables)
      NumberChart.width(chartSpec.width).height(chartSpec.height)
      const dimensions = crossFilter
      const measures = composeMeasures(
        dimensions,
        chartSpec.measures,
        "number",
        chartSpec
      )
      NumberChart.dimension(dimensions).group(measures)

      setValueFormatter(NumberChart, chartSpec.measures, chartSpec.type)

      colorChart(NumberChart, chartSpec, () => callback(null, NumberChart))
    } catch (e) {
      return callback(e)
    }
  }
}

const allUpdates = Object.assign({}, specificChartUpdates, {
  measures(chart, updates, chartSpec) {
    const measures = composeMeasures(
      chart.dimension(),
      updates.measures,
      chartSpec.type,
      chartSpec
    )
    chart.group(measures)
  }
})

export const createNumberChartAsync = promisifyChartCreation(createNumberChart)
export const updateNumberChart = createUpdateFunctionForChart(
  generalChartUpdate,
  allUpdates
)
