// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as ActionTypes from "constants/action-types"
import { CHARTS, MULTISOURCE_CHART_TYPES } from "constants/charts"

import { initialChart } from "reducers/charts/helpers/initialChart"
import {
  enterMultiSourceMode,
  selectMultiSourcePanel
} from "actions/chart-editor-multisource-action-creators"
import { addSelector } from "actions/charts-action-creators"
import { customDimension, customMeasure } from "actions/custom-selector-thunks"
import { selectDataSource } from "actions/data-source-action-creators"
import {
  clearFilterByName,
  setChartFilter
} from "vega/actions/filter-action-creators"

import { getTrueSelectorIndex } from "reducers/charts/helpers/multi-source-helpers"

import { VegaComboChart } from "vega/charts/types"
import {
  DimensionExpression,
  MeasureExpression,
  TIME_LAG_EXPRESSION_TYPE
} from "vega/constants/data-selection-types"
import { ChartFilterMetadata } from "vega/constants/filter-metadata-types"

const migrateDimension = (
  chartId: string,
  chartType: string,
  dimensionIndex: number,
  multiSourceIndex: number,
  dim: DimensionExpression
) => {
  if (dim.type === "column") {
    return addSelector("dimensions")(
      chartId,
      chartType,
      dimensionIndex,
      {
        ...dim.column,
        label: dim.column.value
      },
      multiSourceIndex > 0 ? multiSourceIndex : undefined
    )
  } else if (dim.sharedCustom || dim.globalCustom) {
    const { name: _, ...newColumn } = dim.column
    return addSelector("dimensions")(
      chartId,
      chartType,
      dimensionIndex,
      {
        ...newColumn,
        label: dim.sql,
        value: dim.sql,
        sharedCustom: Boolean(dim.sharedCustom),
        globalCustom: Boolean(dim.globalCustom)
      },
      multiSourceIndex > 0 ? multiSourceIndex : undefined
    )
  } else {
    return customDimension(
      chartId,
      chartType,
      dimensionIndex,
      {
        custom: true,
        type: "CUSTOM",
        label: dim.name,
        value: dim.sql,
        isError: false
      },
      multiSourceIndex > 0 ? multiSourceIndex : undefined
    )
  }
}

const migrateMeasure = (
  chartId: string,
  chartType: string,
  measureIndex: number,
  multiSourceIndex: number,
  measure: MeasureExpression
) => {
  if (measure.type === "count") {
    return addSelector("measures")(
      chartId,
      chartType,
      measureIndex,
      {
        label: "# Records",
        value: "*",
        type: "SMALLINT"
      },
      multiSourceIndex > 0 ? multiSourceIndex : undefined
    )
  } else if (measure.type === "column_aggregate") {
    return addSelector("measures")(
      chartId,
      chartType,
      measureIndex,
      {
        ...measure.column,
        label: measure.column.value,
        aggType: measure.aggregate
      },
      multiSourceIndex > 0 ? multiSourceIndex : undefined
    )
  } else if (measure.sharedCustom || measure.globalCustom) {
    return addSelector("measures")(
      chartId,
      chartType,
      measureIndex,
      {
        ...measure.column,
        label: measure.sql,
        value: measure.sql,
        aggType: "Custom",
        custom: true,
        sharedCustom: Boolean(measure.sharedCustom),
        globalCustom: Boolean(measure.globalCustom)
      },
      multiSourceIndex > 0 ? multiSourceIndex : undefined
    )
  } else {
    return customMeasure(
      chartId,
      chartType,
      measureIndex,
      {
        custom: true,
        type: "CUSTOM",
        label: measure.name,
        value: measure.sql,
        isError: false
      },
      multiSourceIndex > 0 ? multiSourceIndex : undefined
    )
  }
}

export default (
  chartId: string,
  chartType: string,
  prevState: VegaComboChart,
  chartFilters: ChartFilterMetadata[]
) => {
  return async (dispatch, getState) => {
    const chartTypeMeta = CHARTS[chartType]

    // Nuke the state, then copy over the data selections - we're going to
    // pretend we're an old combo (line2)
    await dispatch({
      type: ActionTypes.SET_CHART_STATE,
      chartId,
      payload: {
        ...initialChart({ type: chartType }),
        type: chartType
      }
    })

    for (const filter of chartFilters) {
      await dispatch(clearFilterByName(filter.name))
    }

    let multiSourceIndex = 0
    let baseDimensionIndex = 0
    let baseMeasureIndex = 0
    for (const dataSelection of prevState.dataSelections) {
      if (dataSelection.table) {
        let dimensionIndex = 0
        let measureIndex = 0

        if (multiSourceIndex === 1) {
          await dispatch(enterMultiSourceMode(chartId))
        }
        if (multiSourceIndex > 0) {
          await dispatch(selectMultiSourcePanel(multiSourceIndex))

          const newState = getState().charts[chartId]
          baseDimensionIndex = Number(
            getTrueSelectorIndex(newState.dimensions, 0, multiSourceIndex)
          )
          baseMeasureIndex = Number(
            getTrueSelectorIndex(newState.measures, 0, multiSourceIndex)
          )
        }

        await dispatch(
          selectDataSource(
            { chartId },
            dataSelection.table.name,
            multiSourceIndex > 0 ? multiSourceIndex : undefined
          )
        )

        for (const xAxis of dataSelection.dimensions.xAxis) {
          await dispatch(
            migrateDimension(
              chartId,
              chartType,
              baseDimensionIndex + dimensionIndex,
              multiSourceIndex,
              xAxis
            )
          )

          dimensionIndex += 1
          if (dimensionIndex >= chartTypeMeta.maxDimensions) {
            break
          }
        }

        if (
          dataSelection.dimensions.color &&
          dimensionIndex < chartTypeMeta.maxDimensions
        ) {
          await dispatch(
            migrateDimension(
              chartId,
              chartType,
              baseDimensionIndex + dimensionIndex,
              multiSourceIndex,
              dataSelection.dimensions.color
            )
          )
          dimensionIndex += 1
        }

        for (const measure of dataSelection.measures.size.filter(
          ({ type }) => type !== TIME_LAG_EXPRESSION_TYPE
        )) {
          await dispatch(
            migrateMeasure(
              chartId,
              chartType,
              baseMeasureIndex + measureIndex,
              multiSourceIndex,
              measure
            )
          )

          measureIndex += 1
          if (measureIndex >= chartTypeMeta.maxMeasures) {
            break
          }
        }

        if (
          dataSelection.measures.color &&
          measureIndex < chartTypeMeta.maxMeasures
        ) {
          await dispatch(
            migrateMeasure(
              chartId,
              chartType,
              baseMeasureIndex + measureIndex,
              multiSourceIndex,
              dataSelection.measures.color
            )
          )
          measureIndex += 1
        }

        const layerFilters = chartFilters.filter(
          // eslint-disable-next-line no-loop-func
          (filter) =>
            filter.layerId === dataSelection.layerId ||
            (multiSourceIndex === 0 && !filter.layerId)
        )
        for (const filter of layerFilters) {
          await dispatch(
            setChartFilter(
              filter.filter,
              chartId,
              undefined,
              undefined,
              filter.enabled
            )
          )
        }

        if (!MULTISOURCE_CHART_TYPES.includes(chartType)) {
          // target chart type doesn't support multisource, so bail
          break
        }

        // there's always an extra, inactive dimension/measure per source
        multiSourceIndex += 1
      }
    }

    // TODO: binning?
    // TODO: other things?
  }
}
