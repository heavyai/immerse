// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  PIE_EXTERNAL_RADIUS_PADDING,
  PIE_INNER_RADIUS_MULTIPLIER
} from "constants/magic-variables"
import colorChart from "charts/utils/color-chart"
import composeDimensions from "charts/utils/compose-dimensions"
import composeMeasures from "charts/utils/compose-measures"
import createUpdateFunctionForChart from "charts/utils/create-update-function-for-chart"
import dc from "services/dc"
import generalChartUpdate from "charts/utils/general-chart-update"
import { mapBinnedDimensions } from "utils/map-binned-dimensions"
import promisifyChartCreation from "charts/utils/promisify-chart-creation"
import specificChartUpdates from "charts/utils/specific-chart-updates"
import {
  setDateFormatter,
  setValueFormatter
} from "actions/charts-action-creators"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { getTablesForDataSource } from "components/join-manager/utils"
import addChartEventListeners from "charts/utils/add-chart-event-listeners"
import listeners, {
  createD3CustomDomainRangeUpdateListener
} from "charts/utils/event-listeners"
import { importableStore as store } from "store/importableStore"

const { UNRESTRICTED_PIE_PERCENTAGE } = available_feature_flags

// Normally, only # Records / Count is supported for 'summable' pie features -
// stuff like the percentage labels and the All Others value.
export const allOthersEnabledForPieMeasure = (measure) =>
  measure.aggType === "Count" || measure.aggType === "Sum"

// But allow percentage labels to be available always, if this feature flag's on.
export const percentageEnabledForPieMeasure = (measure) =>
  getFeatureFlag(UNRESTRICTED_PIE_PERCENTAGE) ||
  measure.aggType === "Count" ||
  measure.aggType === "Sum"

export function createPieChart(crossFilter) {
  // eslint-disable-next-line consistent-return
  return (chartSpec, node, callback) => {
    try {
      const innerRadius =
        Math.min(chartSpec.width, chartSpec.height) *
        PIE_INNER_RADIUS_MULTIPLIER
      const tables = getTablesForDataSource(chartSpec.dataSource)
      const PieChart = dc.pieChart(node, tables)

      PieChart.width(chartSpec.width)
        .height(chartSpec.height)
        .innerRadius(innerRadius)
        .cap(chartSpec.cap)
        .othersGrouper(false)
        .externalRadiusPadding(PIE_EXTERNAL_RADIUS_PADDING)
        .pieStyle(chartSpec.pieStyle || "donut")
        .ordering(chartSpec.sortColumn.order)
        .measureLabelsOn(true)

      const mapping = store
        .getState()
        .sharedSettings.mappings.find(
          (m) => m.id === chartSpec.color?.paletteMappingId
        )?.mapping
      if (
        (mapping ||
          (chartSpec.color?.customDomain && chartSpec.color?.customRange)) &&
        chartSpec.dimensions.length === 1
      ) {
        PieChart.customDomain(
          mapping?.customDomain ?? chartSpec.color.customDomain
        )
        PieChart.customRange(
          mapping?.customRange ?? chartSpec.color.customRange
        )
      }

      if (mapping) {
        PieChart.colorMappingDomain(mapping.customDomain)
        PieChart.colorMappingRange(mapping.customRange)
      }

      const dimensions = composeDimensions(crossFilter, chartSpec)
      const measures = composeMeasures(
        dimensions,
        chartSpec.measures,
        "pie",
        chartSpec
      )
      const sizeMeasure = chartSpec.measures[0]

      const percentageEnabled =
        sizeMeasure && percentageEnabledForPieMeasure(sizeMeasure)

      const showPercentValues = percentageEnabled && chartSpec.showPercentValues

      const showAllOthers =
        sizeMeasure &&
        allOthersEnabledForPieMeasure(sizeMeasure) &&
        chartSpec.showAllOthers

      measures.order(chartSpec.sortColumn.col.name)
      PieChart.dimension(dimensions).group(measures)
      PieChart.showNullDimensions(chartSpec.showNullDimensions)
      PieChart.showAbsoluteValues(chartSpec.showAbsoluteValues)
      PieChart.showPercentValues(showPercentValues)
      PieChart.showAllOthers(showAllOthers)
      PieChart.showPercentValuesInPopup(percentageEnabled)

      const allBinParams = mapBinnedDimensions(chartSpec.dimensions)
      PieChart.binParams(allBinParams)

      setValueFormatter(PieChart, chartSpec.measures, chartSpec.type)
      setDateFormatter(PieChart, chartSpec.dimensions, chartSpec.type)

      colorChart(PieChart, chartSpec, () => callback(null, PieChart), mapping)
    } catch (e) {
      return callback(e)
    }
  }
}

export const createPieChartAsync = promisifyChartCreation(createPieChart)

export const updatePieChart = createUpdateFunctionForChart(
  generalChartUpdate,
  specificChartUpdates
)

export const addPieEventListeners = addChartEventListeners(
  Object.assign({}, listeners, {
    postRedraw: createD3CustomDomainRangeUpdateListener(["postRedraw"])
  })
)
