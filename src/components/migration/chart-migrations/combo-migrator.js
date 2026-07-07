// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { isXAxisDimension } from "reducers/charts/helpers/multi-source-helpers"
import { setGroupingMode } from "vega/actions/presentation-settings-action-creators"
import { setRangeChartEnabled } from "vega/actions/data-selection-action-creators"
import {
  migrateChartDimension,
  migrateMeasure,
  sortByFirstDimension,
  getSelectorIndex,
  getLayerId,
  migrateChartBinningInfo,
  migrateTopN,
  migrateSelectorsTitle
} from "./migration-utils"
import {
  setMeasureAxis,
  setMeasureLineStyle,
  setMeasureMarkColor,
  setMeasureMarkType
} from "../../../vega/actions/mark-settings-action-creators"

const comboMigrator = (sourceChartId, newChartId, multiSourceMap) => async (
  dispatch,
  getState
) => {
  const sourceChart = getState().charts[sourceChartId]
  const newChart = () => getState().charts[newChartId]

  for (const dim of sourceChart.dimensions) {
    const isXAxis = isXAxisDimension(dim)
    await dispatch(
      migrateChartDimension(
        dim,
        sourceChart,
        newChartId,
        getLayerId(dim.multiSourceIndex, multiSourceMap),
        isXAxis
          ? getSelectorIndex("dimension", dim.multiSourceIndex, multiSourceMap)
          : null,
        isXAxis
      )
    )
    const colorBlock =
      dim.multiSourceIndex !== undefined
        ? sourceChart.color[dim.multiSourceIndex]
        : sourceChart.color

    if (dim.name === "Color") {
      await dispatch(
        migrateTopN(
          // Combo chart topN values could be either static or dynamic as a group
          colorBlock.domainIsDirty ? "allStatic" : "allDynamic",
          colorBlock,
          dim.showOther,
          newChartId,
          getLayerId(dim.multiSourceIndex, multiSourceMap)
        )
      )
    }
  }

  for (const [measureIndex, measure] of sourceChart.measures.entries()) {
    const layerId = getLayerId(measure.multiSourceIndex, multiSourceMap)
    const newMeasureIndex = getSelectorIndex(
      "measure",
      measure.multiSourceIndex,
      multiSourceMap
    )
    await dispatch(
      migrateMeasure(
        measure,
        newChartId,
        layerId,
        newMeasureIndex,
        sourceChart,
        true
      )
    )
    if (measure.value !== undefined) {
      await dispatch(
        setMeasureMarkType(
          newChartId,
          layerId,
          newMeasureIndex,
          sourceChart.markTypes[measureIndex] || "line"
        )
      )

      await dispatch(
        setMeasureMarkType(
          newChartId,
          layerId,
          newMeasureIndex,
          sourceChart.markTypes[measureIndex] || "line"
        )
      )
      const measureColor =
        measure.multiSourceIndex !== undefined
          ? sourceChart.color[measure.multiSourceIndex]
          : sourceChart.color

      await dispatch(
        setMeasureMarkColor(
          newChartId,
          layerId,
          newMeasureIndex,
          measureColor.customRange[newMeasureIndex]
        )
      )

      let lineStyle =
        measureColor.lineStyles[measureIndex] || measureColor.lineStyles[0]
      lineStyle = lineStyle === "dashes" ? "dashed" : lineStyle

      await dispatch(
        setMeasureLineStyle(newChartId, layerId, newMeasureIndex, lineStyle)
      )

      await dispatch(
        setMeasureAxis(
          newChartId,
          layerId,
          newMeasureIndex,
          measure.yAxisOrientation === "left" ? "primary" : "secondary"
        )
      )
    }
  }

  await dispatch(sortByFirstDimension(newChartId, newChart()))

  await dispatch(migrateChartBinningInfo(sourceChart, newChartId))

  if (sourceChart.percentageViewEnabled) {
    await dispatch(setGroupingMode(newChartId, "percent"))
  } else if (sourceChart.renderArea) {
    await dispatch(setGroupingMode(newChartId, "stacked"))
  }

  if (sourceChart.rangeChartEnabled) {
    await dispatch(setRangeChartEnabled(newChartId, true))
  }

  if (
    sourceChart.yAxisLabel ||
    sourceChart.y2AxisLabel ||
    sourceChart.customXDomainLabel
  ) {
    await dispatch(migrateSelectorsTitle(sourceChartId, newChartId))
  }
}

export default comboMigrator
