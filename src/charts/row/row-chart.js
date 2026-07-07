// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import defaultListeners, {
  createAxisDomainUpdateFunction,
  elasticXListener
} from "charts/utils/event-listeners"
import addChartEventListeners from "charts/utils/add-chart-event-listeners"
import colorChart from "charts/utils/color-chart"
import composeDimensions from "charts/utils/compose-dimensions"
import composeMeasures from "charts/utils/compose-measures"
import createUpdateFunctionForChart from "charts/utils/create-update-function-for-chart"
import d3 from "services/d3"
import dc from "services/dc"
import { formatNumber } from "charts/utils/coordinate-helpers"
import generalChartUpdate from "charts/utils/general-chart-update"
import { mapBinnedDimensions } from "utils/map-binned-dimensions"
import { merge } from "lodash"
import promisifyChartCreation from "charts/utils/promisify-chart-creation"
import specificChartUpdates from "charts/utils/specific-chart-updates"
import {
  setDateFormatter,
  setValueFormatter
} from "actions/charts-action-creators"
import { getTablesForDataSource } from "components/join-manager/utils"

export function createRowChart(crossFilter) {
  return function Row(chartSpec, node, callback) {
    try {
      const tables = getTablesForDataSource(chartSpec.dataSource)
      const RowChart = dc.rowChart(node, tables)

      RowChart.width(chartSpec.width)
        .height(chartSpec.height)
        .margins({ top: 4, right: 32, bottom: 52, left: 32 })
        .autoScroll(true)
        .measureLabelsOn(true)
        .elasticX(chartSpec.elasticX)
        .cap(chartSpec.cap)
        .othersGrouper(false)
        .ordering(chartSpec.sortColumn.order)
        .xAxis()
        .tickFormat(formatNumber)

      const dimensions = composeDimensions(crossFilter, chartSpec)
      const measures = composeMeasures(
        dimensions,
        chartSpec.measures,
        "row",
        chartSpec
      )
      measures.order(chartSpec.sortColumn.col.name)
      RowChart.dimension(dimensions).group(measures)
      RowChart.showNullDimensions(chartSpec.showNullDimensions)

      const allBinParams = mapBinnedDimensions(chartSpec.dimensions)
      RowChart.binParams(allBinParams)

      if (chartSpec.measures[0].minMax) {
        RowChart.x(d3.scale.linear().domain(chartSpec.measures[0].minMax))
      }

      setValueFormatter(RowChart, chartSpec.measures, chartSpec.type)
      setDateFormatter(RowChart, chartSpec.dimensions, chartSpec.type)

      colorChart(RowChart, chartSpec, () => callback(null, RowChart))
    } catch (e) {
      return callback(e)
    }
  }
}

const rowChartUpdateMethods = {
  height(chart, { height }) {
    if (height === 0) {
      chart.measureLabelsOn(false)
    } else if (height > 0) {
      chart.measureLabelsOn(true)
    }
    chart.height(height)
  },
  width(chart, { width }) {
    if (width === 0) {
      chart.measureLabelsOn(false)
    } else if (width > 0) {
      chart.measureLabelsOn(true)
    }
    chart.width(width)
  }
}

export const createRowChartAsync = promisifyChartCreation(createRowChart)
export const updateRowChart = createUpdateFunctionForChart(
  generalChartUpdate,
  Object.assign({}, specificChartUpdates, rowChartUpdateMethods)
)
export const addRowChartEventListeners = addChartEventListeners(
  Object.assign({}, defaultListeners, {
    elasticX: elasticXListener,
    xBounds: createAxisDomainUpdateFunction(
      "xDomain",
      "measures",
      0,
      (minMax) => (mes) => merge({}, mes, { minMax })
    )
  })
)
