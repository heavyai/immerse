// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  migrateChartDimension,
  migrateMeasure,
  getSelectorIndex,
  getLayerId,
  migrateTopN
} from "./migration-utils"
import { ChartState } from "reducers/charts/charts-reducer-types"
import { isGroupable } from "vega/constants/data-selection-types"

const chartSwitchMigrator = (
  prevChart: ChartState,
  chartId: string,
  multiSourceMap: any
) => async (dispatch) => {
  for (const dim of prevChart.dimensions) {
    const isXAxis = String(dim.name).toLowerCase() !== "color"
    await dispatch(
      migrateChartDimension(
        dim,
        prevChart,
        chartId,
        getLayerId(dim.multiSourceIndex, multiSourceMap),
        isXAxis
          ? getSelectorIndex("dimension", dim.multiSourceIndex, multiSourceMap)
          : null,
        isXAxis
      )
    )
    const colorBlock =
      dim.multiSourceIndex !== undefined
        ? prevChart.color[dim.multiSourceIndex]
        : prevChart.color

    if (String(dim.name).toLowerCase() === "color") {
      await dispatch(
        migrateTopN(
          // Combo chart topN values could be either static or dynamic as a group
          colorBlock.domainIsDirty ? "allStatic" : "allDynamic",
          colorBlock,
          dim.showOther,
          chartId,
          getLayerId(dim.multiSourceIndex, multiSourceMap)
        )
      )
    }
  }

  for (const measure of prevChart.measures.values()) {
    if (isGroupable(measure)) {
      const layerId = getLayerId(measure.multiSourceIndex, multiSourceMap)
      const isYAxis = String(measure.name).toLowerCase() !== "color"
      await dispatch(
        migrateMeasure(
          measure,
          chartId,
          layerId,
          isYAxis
            ? getSelectorIndex(
                "measure",
                measure.multiSourceIndex,
                multiSourceMap
              )
            : null,
          prevChart,
          isYAxis
        )
      )
    }
  }
}

export default chartSwitchMigrator
