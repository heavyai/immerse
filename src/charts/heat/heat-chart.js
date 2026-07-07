// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import defaultListeners, {
  createAxisDomainUpdateFunction,
  heatElasticXListener,
  heatElasticYListener
} from "charts/utils/event-listeners"
import addChartEventListeners from "charts/utils/add-chart-event-listeners"
import colorChart from "charts/utils/color-chart"
import composeDimensions from "charts/utils/compose-dimensions"
import composeMeasures from "charts/utils/compose-measures"
import { createSetter } from "utils/helpers"
import createUpdateFunctionForChart from "charts/utils/create-update-function-for-chart"
import dc from "services/dc"
import generalChartUpdate from "charts/utils/general-chart-update"
import { mapBinnedDimensions } from "utils/map-binned-dimensions"
import { merge } from "lodash"
import promisifyChartCreation from "charts/utils/promisify-chart-creation"
import specificChartUpdates from "charts/utils/specific-chart-updates"
import {
  setDateFormatter,
  setValueFormatter
} from "actions/charts-action-creators"
import {
  setInitXDomain,
  setInitYDomain
} from "actions/init-domain-action-creators"
import d3 from "services/d3"
import {
  formatNumber,
  getD3Scale,
  xAxisTickFormat,
  xDomain
} from "charts/utils/coordinate-helpers"
import {
  HEAT_DIMENSION_X_AXIS_NAME,
  HEAT_DIMENSION_Y_AXIS_NAME
} from "charts/heat/constants"
import { getTablesForDataSource } from "components/join-manager/utils"

const setHeatMapScales = (chart, type, initXDomain, initYDomain, chartId) => (
  dispatch,
  getState
) => {
  chart.on(type, () => {
    const xDom = chart.x() && chart.x().domain()
    const yDom = chart.y() && chart.y().domain()
    const { charts } = getState()
    const chartState = charts[chartId]
    const xDim = chartState.dimensions.find(
      (d) => d.name === HEAT_DIMENSION_X_AXIS_NAME
    )
    const yDim = chartState.dimensions.find(
      (d) => d.name === HEAT_DIMENSION_Y_AXIS_NAME
    )

    // This is what we get when we mutate app state w/ third-party lib events
    // - Mea culpa, mea culpa - mmarcus
    if (initXDomain && chartState && !xDim.initDomain) {
      dispatch(setInitXDomain(initXDomain, chartId, HEAT_DIMENSION_X_AXIS_NAME))
    }
    if (initYDomain && chartState && !yDim.initDomain) {
      dispatch(setInitYDomain(initYDomain, chartId, HEAT_DIMENSION_Y_AXIS_NAME))
    }

    if (chart.elasticX() || (chartState && chartState.elasticX)) {
      const xAxisMin = chart.xAxisMin()
      const xAxisMax = chart.xAxisMax()
      const xInitDomain = !xDim.extract
        ? xDim.initDomain || [
            d3.min(chart.data(), chart.keyAccessorNoFormat()),
            d3.max(chart.data(), chart.keyAccessorNoFormat(true))
          ]
        : xDomain(xDim)
      xInitDomain[0] = xInitDomain[0] > xAxisMin ? xAxisMin : xInitDomain[0]
      xInitDomain[1] = xInitDomain[1] < xAxisMax ? xAxisMax : xInitDomain[1]
      if (!xDom) {
        chart.x(getD3Scale(xDim).domain(xInitDomain))
      } else {
        chart.x().domain(xInitDomain)
      }

      chart.xAxis().scale(chart.x()).tickFormat(xAxisTickFormat({}))
    } else if (chartState && !chartState.elasticX) {
      const xDimension = chartState.dimensions.find(
        (d) => d.name === HEAT_DIMENSION_X_AXIS_NAME
      )
      chart.x(
        getD3Scale(xDim).domain(xDimension.minMax || xDimension.initDomain)
      )
      chart.xAxis().scale(chart.x()).tickFormat(xAxisTickFormat({}))
    }

    if (chart.elasticY() || (chartState && chartState.elasticY)) {
      chart.y(
        getD3Scale(yDim).domain([
          d3.min(chart.data(), chart.valueAccessorNoFormat()),
          d3.max(chart.data(), chart.valueAccessorNoFormat(true))
        ])
      )
      chart.yAxis().scale(chart.y()).tickFormat(formatNumber)
    } else if (
      (initYDomain && !yDom) ||
      (initYDomain && yDom && initYDomain.every((v, i) => v === yDom[i]))
    ) {
      chart.y(getD3Scale(yDim).domain(initYDomain))
    }
  })
}

export function createHeatChart(crossFilter, dispatch, chartId) {
  return function HeatMapChart(chartSpec, node, callback) {
    try {
      const tables = getTablesForDataSource(chartSpec.dataSource)
      const HeatMap = dc.heatMap(node, tables)
      HeatMap.width(chartSpec.width)
        .height(chartSpec.height)
        .xBorderRadius(0)
        .yBorderRadius(0)
        .xAxisLabel(
          chartSpec.dimensions[0].axisLabel || chartSpec.dimensions[0].label
        )
        .yAxisLabel(
          chartSpec.dimensions[1].axisLabel || chartSpec.dimensions[1].label
        )
        .elasticX(chartSpec.elasticX)
        .elasticY(chartSpec.elasticY)
      const dimensions = composeDimensions(crossFilter, chartSpec)
      const measures = composeMeasures(
        dimensions,
        chartSpec.measures,
        "heat",
        chartSpec
      )

      const xDimension = chartSpec.dimensions.find(
        (d) => d.name === HEAT_DIMENSION_X_AXIS_NAME
      )
      const yDimension = chartSpec.dimensions.find(
        (d) => d.name === HEAT_DIMENSION_Y_AXIS_NAME
      )
      const initXDomain = xDimension.minMax
        ? xDimension.minMax
        : [xDimension.min_val, xDimension.max_val]
      const initYDomain = yDimension.minMax
        ? yDimension.minMax
        : [yDimension.min_val, yDimension.max_val]

      dispatch(
        setHeatMapScales(
          HeatMap,
          "preRedraw",
          initXDomain,
          initYDomain,
          chartId
        )
      )
      HeatMap.dimension(dimensions).group(measures)
      HeatMap.showNullDimensions(chartSpec.showNullDimensions)

      const allBinParams = mapBinnedDimensions(chartSpec.dimensions)
      HeatMap.binParams(allBinParams)

      setValueFormatter(HeatMap, chartSpec.measures, chartSpec.type)
      setDateFormatter(HeatMap, chartSpec.dimensions, chartSpec.type)

      colorChart(HeatMap, chartSpec, () => callback(null, HeatMap))
      HeatMap.originalXMinMax = xDimension.initDomain
      HeatMap.originalYMinMax = yDimension.initDomain
    } catch (e) {
      return callback(e)
    }
  }
}

export const createHeatChartAsync = promisifyChartCreation(createHeatChart)

const heatUpdateMethods = {
  dimensions(chart, diff, chartSpec) {
    const allBinParams = mapBinnedDimensions(chartSpec.dimensions)
    chart.binParams(allBinParams)
    chart.expireCache()
    const xDimension = diff.dimensions.find(
      (d) => d.name === HEAT_DIMENSION_X_AXIS_NAME
    )
    const yDimension = diff.dimensions.find(
      (d) => d.name === HEAT_DIMENSION_Y_AXIS_NAME
    )
    if (allBinParams[0] === null && xDimension && xDimension.minMax) {
      chart.x().domain(xDimension.minMax)
    }
    if (allBinParams[1] === null && yDimension && yDimension.minMax) {
      chart.y().domain(yDimension.minMax)
    }

    chart
      .xAxisLabel(
        chartSpec.dimensions[0].axisLabel || chartSpec.dimensions[0].label
      )
      .yAxisLabel(
        chartSpec.dimensions[1].axisLabel || chartSpec.dimensions[1].label
      )
  }
}

const allUpdates = merge({}, specificChartUpdates, heatUpdateMethods)
export const updateHeatChart = createUpdateFunctionForChart(
  generalChartUpdate,
  allUpdates
)
export const addHeatChartEventListeners = addChartEventListeners(
  Object.assign({}, defaultListeners, {
    elasticX: heatElasticXListener,
    elasticY: heatElasticYListener,
    xBounds: createAxisDomainUpdateFunction(
      "xDomain",
      "dimensions",
      0,
      createSetter("minMax")
    ),
    yBounds: createAxisDomainUpdateFunction(
      "yDomain",
      "dimensions",
      1,
      createSetter("minMax")
    )
  })
)
