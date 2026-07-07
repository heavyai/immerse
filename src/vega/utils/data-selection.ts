// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Utility functions to perform Vega-specific logic externally, for the current integration
import pushid from "pushid"

import {
  Aggregate,
  Column,
  ColumnAggregateExpression,
  ColumnExpression,
  ComboDataSelection,
  CountExpression,
  CountOption,
  CUSTOM_SQL_SELECTOR_TYPE,
  CustomSqlExpression,
  DimensionExpression,
  Expression,
  isGroupableNumeric,
  isGroupableTime,
  MarkSettings,
  MeasureExpression,
  MeasureOption,
  TIME_LAG_EXPRESSION_TYPE,
  VegaMarkTypes
} from "vega/constants/data-selection-types"
import { Chart, TimeLagSettings, VegaComboChart } from "vega/charts/types"
import { isVegaChart } from "constants/charts"
import { HEAVYAI_SOLID_COLORS } from "services/colors"

const dataSelectionHasXAxises = (dataSelection: ComboDataSelection) =>
  dataSelection.dimensions.xAxis && dataSelection.dimensions.xAxis.length

const dataSelectionHasMeasures = (dataSelection: ComboDataSelection) =>
  dataSelection.measures.size && dataSelection.measures.size.length

const dataSelectionValid = (dataSelection: ComboDataSelection): boolean =>
  Boolean(
    dataSelectionHasXAxises(dataSelection) &&
      dataSelectionHasMeasures(dataSelection)
  )

// This is meant to be used by the current chart-container and chart-editor
// components to decide whether to allow the chart to query and render,
// or to show a prompt for data selection requirements or errors
export const vegaChartHasError = (
  chart: Chart,
  returnErrors?: boolean
): boolean | ComboDataSelection[] => {
  if (isVegaChart(chart.type)) {
    const dataSelections: ComboDataSelection[] = chart.dataSelections

    const erroneousDataSelections = dataSelections.reduce(
      (errorDSs: ComboDataSelection[], dataSelection: ComboDataSelection) => {
        return !dataSelectionValid(dataSelection)
          ? [...errorDSs, ...[dataSelection]]
          : errorDSs
      },
      []
    )

    return returnErrors
      ? erroneousDataSelections
      : Boolean(erroneousDataSelections.length)
  } else {
    throw Error("Unsupported chart type in vegaChartHasError")
  }
}

export const vegaChartHasDataSource = (chart: Chart): boolean => {
  if (isVegaChart(chart.type)) {
    const dataSelections: ComboDataSelection[] = chart.dataSelections

    return dataSelections.every((dataSelection) => dataSelection.table)
  } else {
    throw Error("Unsupported chart type in vegaChartHasDataSource")
  }
}

export const vegaChartSelectorsEmpty = (chart: Chart): boolean => {
  if (isVegaChart(chart.type)) {
    const dataSelections: ComboDataSelection[] = chart.dataSelections

    return dataSelections.some(
      (dataSelection) =>
        !(
          dataSelection.dimensions.xAxis ||
          dataSelection.dimensions.color ||
          dataSelection.measures.size ||
          dataSelection.measures.color
        )
    )
  } else {
    throw Error("Unsupported chart type in vegaChartSelectorsEmpty")
  }
}

export const vegaChartSelectorsLoading = (chart: Chart): boolean => {
  if (isVegaChart(chart.type)) {
    return false
  } else {
    throw Error("Unsupported chart type in vegaChartSelectorsLoading")
  }
}

export const createVegaComboDataSelection = (
  layerId?: string
): ComboDataSelection => ({
  layerId: layerId || pushid(),
  table: null,
  dimensions: {
    xAxis: [],
    color: null
  },
  measures: {
    size: [],
    color: null
  }
})

export const isCountOption = (option: MeasureOption): option is CountOption =>
  (option as any).isCount

export const createCountMeasure = (table: string): CountExpression => ({
  type: "count",
  table
})

export const createAggregateMeasure = (
  table: string,
  column: Column,
  aggregate: Aggregate
): ColumnAggregateExpression => ({
  type: "column_aggregate",
  table,
  column,
  aggregate
})

export const createColumnExpression = (
  table: string,
  column: Column
): ColumnExpression => ({
  type: "column",
  table,
  column
})

export const createCustomSqlExpression = (
  table: string,
  sql: string,
  name: string
): CustomSqlExpression => ({
  type: CUSTOM_SQL_SELECTOR_TYPE,
  table,
  sql,
  name,
  column: null
})

export const getDimensionLabel = (dimension: DimensionExpression) => {
  if (dimension.sharedCustom || dimension.globalCustom) {
    return dimension.sql
  }

  switch (dimension.type) {
    case "column":
      return `${dimension.column.value}`
    case CUSTOM_SQL_SELECTOR_TYPE:
      return dimension.name
    default:
      throw new Error("Unsupported dimension expression type")
  }
}

export const getMeasureLabel = (
  measure: MeasureExpression | ColumnExpression,
  timeLagSettings: TimeLagSettings | null = null
): string => {
  if (measure.sharedCustom || measure.globalCustom) {
    return measure.sql
  }

  switch (measure.type) {
    case "count":
      return "# Records"
    case "column":
      return measure.column.value
    case "column_aggregate":
      return `${measure.aggregate} ${measure.column.value}`
    case CUSTOM_SQL_SELECTOR_TYPE:
      return measure.name
    case TIME_LAG_EXPRESSION_TYPE:
      return `LAG(${timeLagSettings.label}): ${getMeasureLabel(
        measure.measure
      )}`
    default:
      throw new Error("Unsupported measure expression type")
  }
}

export const getSelectorLabel = (
  selector: Expression,
  timeLagSettings: TimeLagSettings | null = null
) => {
  if (selector.sharedCustom || selector.globalCustom) {
    return selector.sql
  }
  switch (selector.type) {
    case "count":
      return "# Records"
    case "column_aggregate":
      return `${selector.aggregate} ${selector.column.value}`
    case CUSTOM_SQL_SELECTOR_TYPE:
      return selector.name
    case TIME_LAG_EXPRESSION_TYPE:
      return `LAG(${timeLagSettings.label}): ${getMeasureLabel(
        selector.measure
      )}`
    case "column":
      return `${selector.column.value}`
    default:
      throw new Error("Unsupported measure expression type")
  }
}

export const createMarkSettings = (
  markType: VegaMarkTypes = VegaMarkTypes.BAR,
  markColor = HEAVYAI_SOLID_COLORS.blue[0]
): MarkSettings => ({
  markType,
  lineStyle: "solid",
  axis: "primary",
  markColor
})

export const getLayerIndex = (
  dataSelections: ComboDataSelection[],
  selectedLayerId: string
): number => dataSelections.findIndex((ds) => ds.layerId === selectedLayerId)

export const getLayerById = (
  dataSelections: ComboDataSelection[],
  layerId: string
): ComboDataSelection | undefined =>
  dataSelections.find((ds) => ds.layerId === layerId)

export const flattenDimensionSelectorExpressions = (ds: ComboDataSelection[]) =>
  ds.reduce(
    (
      expressions: DimensionExpression[],
      selection: ComboDataSelection
    ): DimensionExpression[] => [
      ...expressions,
      ...selection.dimensions.xAxis,
      ...(selection.dimensions.color ? [selection.dimensions.color] : [])
    ],
    []
  )

export const flattenMeasureSelectorExpressions = (ds: ComboDataSelection[]) =>
  ds.reduce(
    (
      expressions: MeasureExpression[],
      selection: ComboDataSelection
    ): MeasureExpression[] => [
      ...expressions,
      ...selection.measures.size,
      ...(selection.measures.color ? [selection.measures.color] : [])
    ],
    []
  )

// Requirements for binning are that every layer has only one base dimension and
// that all layers are the same type
export const supportsBinnedTimeScale = ({ dataSelections }: VegaComboChart) =>
  dataSelections.length > 0 &&
  dataSelections.every(({ dimensions: { xAxis } }) => {
    const firstDimension = xAxis[0]
    const timeOrNull = firstDimension?.column
      ? isGroupableTime(firstDimension.column)
      : true

    return xAxis.length <= 1 && timeOrNull
  })

// Requirements for binning are that every layer has only one base dimension and
// that all layers are the same type
export const supportsBinnedNumericScale = ({
  dataSelections
}: VegaComboChart) =>
  dataSelections.length > 0 &&
  dataSelections.every(({ dimensions: { xAxis } }) => {
    const firstDimension = xAxis[0]
    const numericOrNull = firstDimension?.column
      ? isGroupableNumeric(firstDimension.column)
      : true

    return xAxis.length <= 1 && numericOrNull
  })

export const dimensionToExprStr = (dimension: DimensionExpression): string => {
  switch (dimension.type) {
    case CUSTOM_SQL_SELECTOR_TYPE:
      return dimension.sql
    case "column":
      return dimension.column.value
    default:
      throw new Error("Unsupported dimension expression type")
  }
}
/**
 *
 * `AVG(${sizeMeasureExpr}) over (order by ${expr} range between interval ${
            querySpec.timeLagSettings.interval
          } preceding and interval ${
            querySpec.timeLagSettings.interval
          } preceding) as measure${sizeMeasureExprs.length + index}`
 */
export const measureToExprStr = (
  measure: Expression,
  aggregate = true
): string => {
  switch (measure.type) {
    case "count":
      return "count(*)"
    case "column":
      return measure.column.value
    case "column_aggregate":
      if (!aggregate) {
        return measure.column.value
      } else if (measure.aggregate === "# Unique") {
        return `approx_count_distinct(${measure.column.value})`
      } else if (measure.aggregate === "Median") {
        return `approx_median(${measure.column.value})`
      } else {
        return `${measure.aggregate.toUpperCase()}(${measure.column.value})`
      }
    case CUSTOM_SQL_SELECTOR_TYPE:
      return measure.sql
    default:
      throw new Error("Unsupported measure expression type")
  }
}
