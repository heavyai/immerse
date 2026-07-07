// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  getLayerId,
  getSelectorIndex,
  migrateChartDimension,
  migrateMeasure,
  migrateSortColumn
} from "./migration-utils"
import { isXAxisDimension } from "../../../reducers/charts/helpers/multi-source-helpers"
import {
  setColorMeasureColorScheme,
  toggleColorMeasurePaletteReversal
} from "../../../vega/actions/scale-settings-action-creators"
import {
  setGroupingMode,
  setOrientation
} from "../../../vega/actions/presentation-settings-action-creators"
import { setNumberOfGroups } from "vega/actions/data-selection-action-creators"
import { migrateColorMeasureDomain } from "components/migration/chart-migrations/migration-utils"
import { setDimensionColumn } from "vega/actions/data-selection-thunks"
import { submitCustomSqlDimension } from "vega/actions/custom-sql-data-selection-thunks"
import { createCustomSqlExpression } from "vega/utils/data-selection"
import { topnSetColor } from "vega/actions/top-n-action-creators"
import { validColorSchemes } from "vega/charts/color-utils"
import { process } from "utils/ImmerseSQLPlusPlus/parser"

export const migrateBarChartColorPalette = (
  sourceChart,
  newChartId,
  multiSourceMap
) => async (dispatch, getState) => {
  const { color: colorPaletteConfig } = sourceChart
  if (colorPaletteConfig) {
    if (colorPaletteConfig.type === "custom") {
      const processedColumnValue = colorPaletteConfig.column
        ? process(colorPaletteConfig.column, { trackUsage: false })
        : colorPaletteConfig.column

      const dimColumn = getState().dashboard.dataSources[
        sourceChart.dataSource
      ]?.columnMetadata?.find((c) => c.value === processedColumnValue)
      // first set the color dimension, if it's a column
      if (dimColumn) {
        await dispatch(
          setDimensionColumn(
            newChartId,
            multiSourceMap.layerId,
            "color",
            null,
            { ...dimColumn, value: colorPaletteConfig.column }
          )
        )
      }
      // or if it's comething custom
      else {
        await dispatch(
          submitCustomSqlDimension(
            newChartId,
            multiSourceMap.layerId,
            "color",
            null,
            createCustomSqlExpression(
              sourceChart.dataSource,
              colorPaletteConfig.column,
              "color"
            )
          )
        )
      }
      // then, set the custom colors for everything.
      for (let i = 0; i < colorPaletteConfig.customDomain.length; i++) {
        const d = colorPaletteConfig.customDomain[i]
        const color = colorPaletteConfig.customRange[i]
        await dispatch(
          topnSetColor(
            newChartId,
            multiSourceMap.layerId,
            "topNoptions",
            d,
            color,
            false
          )
        )
      }
    } else if (
      colorPaletteConfig.key &&
      validColorSchemes.has(colorPaletteConfig.type)
    ) {
      const { type, key: name } = colorPaletteConfig
      await dispatch(setColorMeasureColorScheme(newChartId, { type, name }))
    }
    if ("reverse" in colorPaletteConfig) {
      await dispatch(
        toggleColorMeasurePaletteReversal(
          newChartId,
          colorPaletteConfig.reverse
        )
      )
    }
  }
}

const barMigrator = (sourceChartId, newChartId, multiSourceMap) => async (
  dispatch,
  getState
) => {
  const sourceChart = getState().charts[sourceChartId]
  await dispatch(setOrientation(newChartId, "row"))

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
    const isYAxis = measure.name !== "color"
    await dispatch(
      migrateMeasure(
        measure,
        newChartId,
        getLayerId(measure.multiSourceIndex, multiSourceMap),
        isYAxis
          ? getSelectorIndex(
              "measure",
              measure.multiSourceIndex,
              multiSourceMap
            )
          : null,
        sourceChart,
        isYAxis
      )
    )
  }
  await dispatch(migrateSortColumn(sourceChart, newChartId))
  await dispatch(setNumberOfGroups(newChartId, sourceChart.cap))
  if (sourceChart.colorDomain) {
    await dispatch(migrateColorMeasureDomain(sourceChartId, newChartId))
  }

  if (
    sourceChart.colorByDimension &&
    sourceChart.dimensions.some((d) => d.value === sourceChart.colorByDimension)
  ) {
    await dispatch(setGroupingMode(newChartId, "stacked"))
  }
}

export default barMigrator
