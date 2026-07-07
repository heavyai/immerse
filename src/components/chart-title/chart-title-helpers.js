// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { AGGTYPE_ALIASES } from "constants/agg-types"
import { isVegaChart } from "constants/charts"
import {
  getDimensionLabel,
  getMeasureLabel,
  flattenDimensionSelectorExpressions,
  flattenMeasureSelectorExpressions
} from "../../vega/utils/data-selection"
import { getIsNonGeoJoinedChoroplethColorMeasure } from "components/measure-selectors-popover/measure-selectors-popover-parent"
import { isGeoChart } from "charts/raster-chart/raster-utils"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import { toSmartTitleCase } from "utils/titlecase"
import { shouldShowAggType } from "utils/selector-helpers"
import { EndpointSelectorNames } from "charts/raster-chart/cross-section/constants"
import { isCrossSectionType } from "charts/raster-chart/cross-section/utils/is-cross-section-type"

const getDimensionsPart = (dimensions, chartType) => {
  const dimensionLabels = isVegaChart(chartType)
    ? dimensions.map((dimension) => getDimensionLabel(dimension))
    : dimensions
        .filter(
          (dimension) =>
            !dimension.inactive &&
            dimension.value &&
            !(isGeoChart(chartType) && ["Lon", "Lat"].includes(dimension.name))
        )
        .map((dimension) => dimension.label)

  return dimensionLabels.length ? `by ${dimensionLabels.join(", ")}` : ""
}

const getAggType = (measure, dimensionsLength, chart) => {
  // This is the same helper used to determine if we show the aggregate type in
  // the selector (see selector-pill-parent) so it should match in the chart title
  const showAggType = shouldShowAggType(
    chart.type,
    measure,
    dimensionsLength,
    measure.label,
    measure.aggType,
    getIsNonGeoJoinedChoroplethColorMeasure(chart, measure)
  )
  return showAggType ? `${AGGTYPE_ALIASES[measure.aggType]} ` : ""
}

const getMeasuresPart = (measures, dimensionsLength, dataSelections, chart) => {
  let measureLabels = measures
    .filter(
      (measure) =>
        !measure.inactive &&
        measure.value &&
        // For geo charts, we remove lat/lon/geo measures and include the data source
        !(isGeoChart(chart.type) && ["x", "y", "geo"].includes(measure.name)) &&
        !(
          isCrossSectionType(chart.type) &&
          Object.values(EndpointSelectorNames).includes(measure.name)
        )
    )
    .map(
      (measure) =>
        `${getAggType(measure, dimensionsLength, chart)}${
          measure.label === "*" ? "# Records" : measure.label
        }`
    )

  if (isVegaChart(chart.type)) {
    measureLabels = flattenMeasureSelectorExpressions(
      dataSelections
    ).map((measure) => getMeasureLabel(measure, chart.timeLagSettings))
  }

  return measureLabels.join(", ")
}

const composeTitle = (chart) => {
  const { dataSelections, dimensions, measures, type, dataSource } = chart

  // For geo charts, we remove lat/lon/geo measures and include the data source
  const titleParts = isGeoChart(type) ? [dataSource] : []

  const titleDimensions = isVegaChart(type)
    ? flattenDimensionSelectorExpressions(dataSelections)
    : dimensions.filter((d) => d.value && !d.inactive)

  titleParts.push(
    getMeasuresPart(measures, titleDimensions.length, dataSelections, chart)
  )
  titleParts.push(getDimensionsPart(titleDimensions, type))

  return (
    titleParts
      .join(" ")
      // I'm not sure where linebreaks would come from?
      // Keeping this because it was in the original code
      .replace(/\r?\n|\r/g, " ")
      .trim()
  )
}

export function createAutoTitle(chart) {
  const { copyNumber, currentLayer, layers } = chart
  let title = composeTitle(chart)

  if (currentLayer === "master" && layers.length) {
    title = layers.map((layer) => composeTitle(layer)).join(" / ")
  }

  if (copyNumber > 0) {
    title = `${title} (Copy${copyNumber > 1 ? ` ${copyNumber}` : ""})`
  }

  let parametersInAutoTitle = {}
  const titleWithParams = process(title, {
    useDisplayName: true,
    onProcessComplete: ({ processedParameterValues }) => {
      parametersInAutoTitle = processedParameterValues
    }
  })

  return {
    title: toSmartTitleCase(titleWithParams),
    parametersInAutoTitle
  }
}
