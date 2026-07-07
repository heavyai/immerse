// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  getLayerId,
  getSelectorIndex,
  migrateChartDimension,
  migrateMeasure,
  migrateSortColumn,
  migrateTopN,
  migrateSelectorsTitle
} from "./migration-utils"
import { isXAxisDimension } from "reducers/charts/helpers/multi-source-helpers"
import { Selector } from "constants/prop-types"
import {
  setOrientation,
  setGroupingMode
} from "vega/actions/presentation-settings-action-creators"
import { setNumberOfGroups } from "vega/actions/data-selection-action-creators"
import { isSelectorUsable } from "utils/selector-helpers"
import { setMeasureMarkColor } from "vega/actions/mark-settings-action-creators"

const stackedBarMigrator = (
  sourceChartId,
  newChartId,
  multiSourceMap
) => async (dispatch, getState) => {
  const sourceChart = getState().charts[sourceChartId]
  await dispatch(setOrientation(newChartId, "column"))

  for (const dimension of sourceChart.dimensions) {
    const isXAxis = !dimension.name || isXAxisDimension(dimension)
    const dimensionIndex = isXAxis
      ? getSelectorIndex(
          "dimension",
          dimension.multiSourceIndex,
          multiSourceMap
        )
      : null
    await dispatch(
      migrateChartDimension(
        dimension,
        sourceChart,
        newChartId,
        multiSourceMap.layerId,
        dimensionIndex,
        isXAxis
      )
    )
  }

  for (const measure of sourceChart.measures) {
    await dispatch(
      migrateMeasure(
        measure,
        newChartId,
        getLayerId(measure.multiSourceIndex, multiSourceMap),
        getSelectorIndex("measure", measure.multiSourceIndex, multiSourceMap),
        sourceChart,
        true
      )
    )
  }

  if (
    isSelectorUsable(sourceChart.dimensions.find((dim) => dim.name === "Color"))
  ) {
    // if color dimension is selected, migrate topN values with colors
    await dispatch(
      migrateTopN(
        "allStatic", // Stacked bar topN values are all static
        sourceChart.color,
        sourceChart.showOther,
        newChartId,
        getLayerId(undefined, multiSourceMap)
      )
    )
  } else {
    await dispatch(
      setMeasureMarkColor(
        newChartId,
        getLayerId(undefined, multiSourceMap),
        0,
        sourceChart.color.customRange[0]
      )
    )
  }

  await dispatch(migrateSortColumn(sourceChart, newChartId))
  await dispatch(setNumberOfGroups(newChartId, sourceChart.cap))

  if (sourceChart.percentageViewEnabled) {
    await dispatch(setGroupingMode(newChartId, "percent"))
  } else {
    await dispatch(setGroupingMode(newChartId, "stacked"))
  }

  if (
    sourceChart.dimensions.some((dim: Selector) => dim.axisLabel) ||
    sourceChart.measures.some((measure: Selector) => measure.axisLabel)
  ) {
    await dispatch(migrateSelectorsTitle(sourceChartId, newChartId))
  }
}

export default stackedBarMigrator
