// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { process } from "utils/ImmerseSQLPlusPlus/parser"
import {
  addDataSelection,
  getMeasureExpressionByLayerId,
  selectTable,
  setDimension,
  setDimensionColumn,
  setMeasure,
  setMeasureAggregate,
  setMeasureOption
} from "vega/actions/data-selection-thunks"
import {
  submitCustomSqlDimension,
  submitCustomSqlMeasure
} from "vega/actions/custom-sql-data-selection-thunks"
import { isChartMultiSource } from "../../../reducers/charts/helpers/multi-source-helpers"
import {
  buildSortByDimensions,
  buildSortByMeasures,
  createSortByOptions
} from "../../chart-settings-sort-by-dropdown/chart-settings-sort-by-helpers"
import { setBaseDimensionSortOptions } from "../../../vega/actions/data-selection-action-creators"
import { ASC } from "../../../vega/utils/sql-tag"
import {
  createCustomSqlExpression,
  getLayerById,
  supportsBinnedNumericScale,
  supportsBinnedTimeScale
} from "../../../vega/utils/data-selection"
import {
  topnLock,
  topnSetColor,
  topnToggleAllOthers,
  topnUpdateN
} from "../../../vega/actions/top-n-action-creators"
import { setChartBin } from "vega/actions/bin-settings-thunks"
import {
  createNumericScaleSettings,
  createExtractScaleSettings,
  createTimeScaleSettings
} from "vega/utils/binning"
import { comparableValue } from "../../../utils/helpers"
import {
  setBinningManualMax,
  setBinningManualMin,
  setBaseDimensionFormat,
  clearChartBinDirect
} from "../../../vega/actions/bin-settings-action-creators"
import {
  setManualPrimaryMeasureDomainMax,
  setManualPrimaryMeasureDomainMin,
  setManualSecondaryMeasureDomainMax,
  setManualSecondaryMeasureDomainMin,
  setPrimaryMeasureFormat,
  setSecondaryMeasureFormat,
  setBaseDimensionTitle,
  setPrimaryMeasureTitle,
  setSecondaryMeasureTitle
} from "../../../vega/actions/presentation-settings-action-creators"
import { isMultiLayer } from "../../../charts/raster-chart/raster-utils"
import { setChartFilter } from "../../../vega/actions/filter-action-creators"
import { Filter } from "../../../vega/constants/filter-types"
import {
  ChartFilterMetadata,
  FilterMetadata
} from "../../../vega/constants/filter-metadata-types"
import { ChartState } from "../../../reducers/charts/charts-reducer-types"
import {
  isSupportsNumericalScale,
  isSupportsTimeScale
} from "../../../vega/utils/data"
import { isNumericType, isDateType } from "constants/data-types"
import {
  BarDimensionName,
  Column,
  ComboDataSelection,
  DimensionExpression,
  CUSTOM_SQL_SELECTOR_TYPE,
  BarMeasureName
} from "../../../vega/constants/data-selection-types"
import { chartSupportsChartSpecificFilters } from "charts/utils/chart-type"
import { Selector } from "constants/prop-types"
import { setMeasureMarkColor } from "../../../vega/actions/mark-settings-action-creators"
import { setColorDomain } from "vega/actions/scale-settings-action-creators"
import { makeGetParameterValueObject } from "../../parameters/selectors"
import { varExtractRegex } from "../../parameters/validation"
import { CHART_DEFS } from "constants/charts"

export const getSelectorIndex = (
  type: string,
  multiSourceIndex: string,
  multiSourceMap
) => {
  return multiSourceIndex === undefined
    ? multiSourceMap[type]++
    : multiSourceMap[multiSourceIndex][type]++
}

export const migrateDataSelections = (
  sourceChart: ChartState,
  newChartId: string
) => async (dispatch: Function, getState: Function) => {
  const additionalMultiSourceMappings = {}
  const multiSourceIndexes = sourceChart.multiSources
    ? Object.keys(sourceChart.multiSources).filter((k) => k !== "0")
    : []
  for (const multiSourceIndex of multiSourceIndexes) {
    await dispatch(addDataSelection(newChartId))
    const nc = getState().charts[newChartId]
    additionalMultiSourceMappings[multiSourceIndex] = {
      layerId: nc.dataSelections[nc.dataSelections.length - 1].layerId,
      dimension: 0,
      measure: 0
    }
  }
  return additionalMultiSourceMappings
}

export const migrateSources = (
  newChartId: string,
  sourceChart: ChartState,
  multiSourceMap: any
) => async (dispatch: Function) => {
  for (const [multiSourceIndex, { layerId }] of Object.entries(
    multiSourceMap
  )) {
    const table =
      sourceChart.multiSources?.[multiSourceIndex]?.table ||
      sourceChart.dataSource
    if (table) {
      await dispatch(selectTable(newChartId, layerId, table))
    }
  }
}

export const getLayerId = (multiSourceIndex: string, multiSourceMap: any) => {
  return multiSourceIndex === undefined
    ? multiSourceMap.layerId
    : multiSourceMap[multiSourceIndex].layerId
}

export const migrateChartBinningInfo = (
  sourceChart: ChartState,
  newChartId: string
) => async (dispatch: Function, getState: Function) => {
  if (sourceChart.dimensions.length === 0) {
    return
  }

  const { elasticX, type } = sourceChart

  // Take the first X axis dimension as a litmus for the rest, since they're
  // set to share bin settings whenever they get changed, anyway
  const { isBinned, extract, timeBin, numOfBins } = sourceChart.dimensions[0]
  const isElastic = type === "bar" ? true : elasticX // Bar chart X-axis is measure selector, so doesn't set binning min/max
  const newChart = getState().charts[newChartId]

  if (isBinned) {
    if (extract) {
      // this issue is ancient (and I think it's been resolved at some point), but you can still have charts
      // with extract true and a timeBin of auto. Immerse implicitly sets the bin to isodow in that case to
      // keep the chart working, so we'll just explicitly set it here in the migration.
      const repairedTimeBin = timeBin === "auto" ? "isodow" : timeBin
      // Extract time
      await dispatch(
        setChartBin(newChartId, createExtractScaleSettings(repairedTimeBin))
      )
    } else if (timeBin && supportsBinnedTimeScale(newChart)) {
      // Binned time
      let minmax = [null, null]

      if (!isElastic) {
        minmax = sourceChart.dimensions.reduce(
          ([min, max], dim) => [
            ![undefined, null].includes(dim.currentLowValue)
              ? Math.min(dim.currentLowValue, min)
              : min,
            ![undefined, null].includes(dim.currentHighValue)
              ? Math.max(dim.currentHighValue, max)
              : max
          ],
          [Infinity, -Infinity]
        )
      }
      await dispatch(
        setChartBin(newChartId, {
          ...createTimeScaleSettings(timeBin),
          manualMin: comparableValue(minmax[0]),
          manualMax: comparableValue(minmax[1])
        })
      )
    } else if (supportsBinnedNumericScale(newChart)) {
      // Binned numeric

      let minmax = [null, null]

      if (!isElastic) {
        minmax = sourceChart.dimensions
          .filter((dim) => dim && dim.isBinnable)
          .reduce(
            ([min, max], dim) => [
              Math.min(dim.currentLowValue, min),
              Math.max(dim.currentHighValue, max)
            ],
            [Infinity, -Infinity]
          )
      }

      await dispatch(
        setChartBin(newChartId, {
          ...createNumericScaleSettings(),
          numOfBins,
          manualMin: comparableValue(minmax[0]),
          manualMax: comparableValue(minmax[1])
        })
      )
    }
  } else {
    /**
     *  the new combo binSettings is set based on dimension during migrateChartDimension,
     *  so if the binning is OFF, we need to wipe it out
     *  Note that the source chart binning requirements might differ from vega
     *  combo's requirements (e.g. bar supports binning when multiple base
     *  dimensions are set, vega currently doesn't)--so we also wipe binSettings
     *  in that case.
     */
    await dispatch(clearChartBinDirect(newChartId))
  }
}

export const migrateParameterizedCustomSqlDimension = (
  chartId: string,
  layerId: string,
  dimensionName: BarDimensionName,
  dimensionIndex: number | null,
  dimension,
  additionalMetadata = {}
) => async (dispatch, getState) => {
  const { charts } = getState()
  const chart = charts[chartId]
  const dataSelection = getLayerById(chart.dataSelections, layerId)
  const table = dataSelection?.table?.name
  const parameterName = dimension.value?.match(varExtractRegex)[1] || null

  if (table && parameterName) {
    const { columnMetadata } = makeGetParameterValueObject(getState())(
      parameterName
    )

    const expression: DimensionExpression = {
      type: CUSTOM_SQL_SELECTOR_TYPE,
      table,
      column: {
        ...columnMetadata,
        name: dimension.value
      },
      sql: dimension.value,
      ...additionalMetadata
    }

    await dispatch(
      setDimension(chartId, layerId, dimensionName, dimensionIndex, expression)
    )
  }
}

export const migrateChartDimension = (
  dimension: any,
  sourceChart: ChartState,
  newChartId: string,
  layerId: string,
  dimensionIndex: number,
  isXAxis: DimensionExpression
) => async (dispatch: Function, getState: Function) => {
  const table =
    dimension.multiSourceIndex !== undefined
      ? sourceChart.multiSources[dimension.multiSourceIndex].table
      : dimension.table || sourceChart.dataSource
  if (!table) {
    return
  }

  const xAxisOrColor = isXAxis ? "xAxis" : "color"

  if (dimension.sharedCustom || dimension.globalCustom) {
    await dispatch(
      migrateParameterizedCustomSqlDimension(
        newChartId,
        layerId,
        xAxisOrColor,
        dimensionIndex,
        dimension,
        {
          sharedCustom: Boolean(dimension.sharedCustom),
          globalCustom: Boolean(dimension.globalCustom)
        }
      )
    )
  } else if (dimension.custom) {
    await dispatch(
      submitCustomSqlDimension(
        newChartId,
        layerId,
        xAxisOrColor,
        dimensionIndex,
        createCustomSqlExpression(table, dimension.value, dimension.label),
        false
      )
    )
  } else {
    const processedDimensionValue = dimension.value
      ? process(dimension.value, { trackUsage: false })
      : dimension.value
    // copy a dimension
    const dimColumn = getState().dashboard.dataSources[
      table
    ]?.columnMetadata?.find((c: Column) => c.value === processedDimensionValue)
    if (dimColumn) {
      await dispatch(
        setDimensionColumn(newChartId, layerId, xAxisOrColor, dimensionIndex, {
          ...dimColumn,
          value: dimension.value
        })
      )
    }
  }
}

export const sortByFirstDimension = (
  chartId: string,
  chart: ChartState
) => async (dispatch: Function) => {
  const { dimensions, measures } = chart.dataSelections[0]
  const sortByDimensions = buildSortByDimensions(dimensions)
  const sortByMeasures = buildSortByMeasures(
    measures,
    CHART_DEFS[chart.type].defaultAggregation
  )
  const sortByOptions = createSortByOptions(
    sortByDimensions,
    sortByMeasures,
    "dimension"
  )
  const dimensionSortByOption = sortByOptions.find((option) =>
    option.value.startsWith("dimension")
  )
  if (dimensionSortByOption) {
    await dispatch(
      setBaseDimensionSortOptions(chartId, {
        col: { name: dimensionSortByOption.value },
        index: 0,
        label: dimensionSortByOption.label,
        order: ASC
      })
    )
  }
}

/**
 * Migrates topN selections of chart. TopN selections could be either static or dynamic
 * @param topNselection
 * @param colorBlock
 * @param showAllOthers
 * @param newChartId
 * @param layerId
 */
// Use chart type to detect whether the topN values are static or dynamic selection withing the chart
export const migrateTopN = (
  topNselectionType,
  colorBlock,
  showAllOthers,
  newChartId,
  layerId
) => async (dispatch: Function) => {
  if (
    colorBlock.column &&
    colorBlock.column !== "Measures" &&
    colorBlock.customDomain &&
    colorBlock.customDomain.length
  ) {
    await dispatch(
      topnUpdateN(
        newChartId,
        layerId,
        "topNoptions",
        topNselectionType === "allStatic" ? 0 : colorBlock.customDomain.length
      )
    )

    for (const [i, domain] of colorBlock.customDomain.entries()) {
      const color = colorBlock.customRange[i]
      if (topNselectionType === "allStatic") {
        await dispatch(
          topnLock(newChartId, layerId, "topNoptions", domain, color)
        )
      } else if (topNselectionType === "allDynamic") {
        await dispatch(
          topnSetColor(newChartId, layerId, "topNoptions", domain, color)
        )
      }
    }
    await dispatch(
      topnSetColor(
        newChartId,
        layerId,
        "topNoptions",
        "All Others",
        colorBlock.defaultOtherRange,
        true
      )
    )
    if (!showAllOthers) {
      await dispatch(topnToggleAllOthers(newChartId, layerId, "topNoptions"))
    }
  }
}

export const getLayerDataSelectionsForChart = (chart, layerId) =>
  chart.dataSelections.find((ds) => ds.layerId === layerId)

const migrateParameterizedCustomSqlMeasure = (
  measure: any,
  newChartId: string,
  layerId: string,
  newMeasureIndex: number | null,
  sourceChart: ChartState,
  measureName: BarMeasureName,
  additionalMetadata: Record<string, any> = {}
) => (dispatch, getState) => {
  const parameterName = measure.value?.match(varExtractRegex)[1] || null
  if (parameterName) {
    const { columnMetadata } = makeGetParameterValueObject(getState())(
      parameterName
    )

    const newMeasure = {
      sql: measure.value,
      type: CUSTOM_SQL_SELECTOR_TYPE,
      table: columnMetadata?.source,
      column: {
        ...columnMetadata,
        name: measure.value
      },
      ...additionalMetadata
    }

    dispatch(
      setMeasure(newChartId, layerId, measureName, newMeasureIndex, newMeasure)
    )
  }
}

export const migrateMeasure = (
  measure: any,
  newChartId: string,
  layerId: string,
  newMeasureIndex: number | null,
  sourceChart: ChartState,
  isYAxis: boolean
) => async (dispatch: Function, getState: Function) => {
  if (measure.value === undefined) {
    return
  }

  const measureName = isYAxis ? "size" : "color"
  const table = isChartMultiSource(sourceChart)
    ? sourceChart.multiSources[measure.multiSourceIndex].table
    : sourceChart.dataSource

  if (measure.sharedCustom || measure.globalCustom) {
    await dispatch(
      migrateParameterizedCustomSqlMeasure(
        measure,
        newChartId,
        layerId,
        newMeasureIndex,
        sourceChart,
        measureName,
        {
          sharedCustom: Boolean(measure.sharedCustom),
          globalCustom: Boolean(measure.globalCustom)
        }
      )
    )
  } else if (measure.custom) {
    await dispatch(
      submitCustomSqlMeasure(
        newChartId,
        layerId,
        measureName,
        newMeasureIndex,
        createCustomSqlExpression(table, measure.value, measure.label)
      )
    )
  } else {
    const processedMeasureValue = measure.value
      ? process(measure.value, { trackUsage: false })
      : measure.value
    const measureColumn = getState().dashboard.dataSources[
      table
    ]?.columnMetadata?.find((c: Column) => c.value === processedMeasureValue)
    const measureOption =
      measure.aggType !== "Count"
        ? {
            ...measureColumn,
            value: measure.value
          }
        : {
            value: "# Records",
            isCount: true,
            type: "INT"
          }

    // Migrate measure
    if (measureOption) {
      await dispatch(
        setMeasureOption(
          newChartId,
          layerId,
          measureName,
          newMeasureIndex,
          measureOption
        )
      )
      const measureExpression = dispatch(
        getMeasureExpressionByLayerId(
          newChartId,
          layerId,
          newMeasureIndex,
          measureName
        )
      )
      if (measure.aggType && measureExpression?.type === "column_aggregate") {
        await dispatch(
          setMeasureAggregate(
            newChartId,
            layerId,
            measureName,
            newMeasureIndex,
            measure.aggType
          )
        )
      }
    }
  }
  const measureColor =
    Array.isArray(sourceChart.color?.val) && sourceChart.color?.val[0]
  if (typeof newMeasureIndex === "number" && measureColor) {
    await dispatch(
      setMeasureMarkColor(newChartId, layerId, newMeasureIndex, measureColor)
    )
  }
}

export const migrateSortColumn = (
  sourceChart: ChartState,
  newChartId: string
) => async (dispatch: Function, getState: Function) => {
  const { dimensions, measures, type: chartType } = sourceChart
  let sourceSortColumn = sourceChart.sortColumn
  if (chartType === "histogram") {
    // histogram is always sorted by the first dimension
    sourceSortColumn = {
      col: { name: "key0" },
      index: 0,
      order: "asc"
    }
  }
  if (!sourceSortColumn || !dimensions.length || !measures.length) {
    return
  }
  const sourceSortByOptions = createSortByOptions(dimensions, measures)
  const newChart = getState().charts[newChartId] as VegaComboChart
  const {
    dimensions: newDimensions,
    measures: newMeasures
  } = newChart.dataSelections[0]
  const newSortByOptions = [
    ...createSortByOptions(
      buildSortByDimensions(newDimensions),
      [],
      "dimension"
    ),
    ...createSortByOptions(
      [],
      buildSortByMeasures(
        newMeasures,
        CHART_DEFS[newChart.type].defaultAggregation
      ),
      "measure"
    )
  ]
  const sourceSelectedOption =
    sourceSortByOptions.find(
      (option) => sourceSortColumn.col.name === option.value
    ) || sourceSortByOptions.find((option) => option.label === "# Records")

  const newSelectedOption = newSortByOptions.find(
    (option) =>
      option.label === sourceSelectedOption.label &&
      option.type === sourceSelectedOption.type
  )
  if (newSelectedOption) {
    await dispatch(
      setBaseDimensionSortOptions(newChartId, {
        col: { name: newSelectedOption.value },
        index: sourceSortColumn.index,
        order: sourceSortColumn.order
      })
    )
  }
}

export const migrateDimensionsExtents = (
  sourceChart: ChartState,
  newChartId: string
) => async (dispatch: Function) => {
  const { dimensions: sourceDimensions, elasticX, type } = sourceChart
  let lowestDimensionVal = null
  let highestDimensionVal = null

  for (const dimension of sourceDimensions) {
    highestDimensionVal =
      dimension.currentHighValue !== null &&
      (highestDimensionVal === null ||
        dimension.currentHighValue > highestDimensionVal)
        ? comparableValue(dimension.currentHighValue)
        : highestDimensionVal
    lowestDimensionVal =
      dimension.currentLowValue !== null &&
      (lowestDimensionVal === null ||
        dimension.currentLowValue < lowestDimensionVal)
        ? comparableValue(dimension.currentLowValue)
        : lowestDimensionVal
  }

  // elasticX value defines if the axis is locked or not
  // Can't rely on currentHighValue & currentLowValue values to determine locked state since these values always present
  const isElastic = type === "bar" ? true : elasticX // Bar chart X-axis is measure selector not dimension
  if (lowestDimensionVal && !isElastic) {
    await dispatch(setBinningManualMin(newChartId, lowestDimensionVal))
  }
  if (highestDimensionVal && !isElastic) {
    await dispatch(setBinningManualMax(newChartId, highestDimensionVal))
  }
}

export const migrateMeasuresExtents = (
  sourceChart: ChartState,
  newChartId: string
) => async (dispatch: Function) => {
  const { measures: sourceMeasures, elasticX, elasticY, type } = sourceChart
  type AxisExtents = {
    primary: number | null
    secondary: number | null
  }

  const highestMeasureVals: AxisExtents = {
    primary: null,
    secondary: null
  }
  const lowestMeasureVals: AxisExtents = {
    primary: null,
    secondary: null
  }

  for (const measure of sourceMeasures) {
    if (!measure.minMax || !measure.minMax.length) {
      // eslint-disable-next-line no-continue
      continue
    }
    const primaryOrSecondaryAxis =
      !measure.yAxisOrientation || measure.yAxisOrientation === "left"
        ? "primary"
        : "secondary"
    const measureMin = comparableValue(measure.minMax[0])
    const measureMax = comparableValue(measure.minMax[1])

    if (
      measureMax !== undefined &&
      (highestMeasureVals[primaryOrSecondaryAxis] === null ||
        measureMax > highestMeasureVals[primaryOrSecondaryAxis])
    ) {
      highestMeasureVals[primaryOrSecondaryAxis] = measureMax
    }
    if (
      measureMin !== undefined &&
      (lowestMeasureVals[primaryOrSecondaryAxis] === null ||
        measureMin < lowestMeasureVals[primaryOrSecondaryAxis])
    ) {
      lowestMeasureVals[primaryOrSecondaryAxis] = measureMin
    }
  }

  // elasticX and elasticY values define if the axis is locked or not
  // Can't rely on minMax value on measures to determine axis lock
  // since some charts don't set it to null when unlocked
  const isElastic = type === "row" ? elasticX : elasticY // Bar chart X-axis is measure selector

  if (highestMeasureVals.primary !== null && !isElastic) {
    await dispatch(
      setManualPrimaryMeasureDomainMax(newChartId, highestMeasureVals.primary)
    )
  }
  if (highestMeasureVals.secondary !== null && !isElastic) {
    await dispatch(
      setManualSecondaryMeasureDomainMax(
        newChartId,
        highestMeasureVals.secondary
      )
    )
  }
  if (lowestMeasureVals.primary !== null && !isElastic) {
    await dispatch(
      setManualPrimaryMeasureDomainMin(newChartId, lowestMeasureVals.primary)
    )
  }
  if (lowestMeasureVals.secondary !== null && !isElastic) {
    await dispatch(
      setManualSecondaryMeasureDomainMin(
        newChartId,
        lowestMeasureVals.secondary
      )
    )
  }
}

export const migrateChartExtents = (
  sourceChart: ChartState,
  newChartId: string
) => async (dispatch: Function, getState: Function) => {
  const newChart = getState().charts[newChartId]
  if (
    isSupportsTimeScale(newChart.dataSelections) ||
    isSupportsNumericalScale(newChart.dataSelections)
  ) {
    await dispatch(migrateDimensionsExtents(sourceChart, newChartId))
  }
  await dispatch(migrateMeasuresExtents(sourceChart, newChartId))
}

export const migrateSelectorsFormatting = (
  sourceChart: ChartState,
  newChartId: string
) => async (dispatch: Function) => {
  const {
    measures: sourceChartMeasures,
    dimensions: sourceChartDimensions,
    type: chartType
  } = sourceChart
  let fallbackDimensionNumberFormat = null
  let fallbackMeasureNumberFormat = null
  if (chartType === "row") {
    // Defaults to match old behavior
    fallbackDimensionNumberFormat = "custom-basic"
    fallbackMeasureNumberFormat = null
  }

  const axisFormats: Record<string, string | null> = {
    primary: null,
    secondary: null
  }

  for (const measure of sourceChartMeasures) {
    const isPrimaryAxis = ["left", undefined].includes(measure.yAxisOrientation)
    const isSecondaryAxis = measure.yAxisOrientation === "right"
    const format = isNumericType(measure.type)
      ? measure.numberFormat || fallbackMeasureNumberFormat
      : isDateType(measure.type)
      ? measure.dateFormat
      : null
    if (isPrimaryAxis && !axisFormats.primary) {
      axisFormats.primary = format
    } else if (isSecondaryAxis && !axisFormats.secondary) {
      axisFormats.secondary = format
    }
  }
  if (axisFormats.primary) {
    await dispatch(setPrimaryMeasureFormat(newChartId, axisFormats.primary))
  }
  if (axisFormats.secondary) {
    await dispatch(setSecondaryMeasureFormat(newChartId, axisFormats.secondary))
  }

  // Vega-combo currently doesn't support formatting of multiple dimensions so
  //  we'll only care about setting the first one for now.
  const firstDimension = sourceChartDimensions[0]
  if (isDateType(firstDimension?.type) && firstDimension?.dateFormat) {
    await dispatch(
      setBaseDimensionFormat(newChartId, firstDimension.dateFormat)
    )
  } else if (
    isNumericType(firstDimension?.type) &&
    (firstDimension?.numberFormat || fallbackDimensionNumberFormat)
  ) {
    await dispatch(
      setBaseDimensionFormat(
        newChartId,
        firstDimension.numberFormat || fallbackDimensionNumberFormat
      )
    )
  }
}

const getFilterMetasForChartId = (
  chartId: string,
  chart: ChartState,
  getState: Function
) => {
  const { omnifilters } = getState()

  return chartSupportsChartSpecificFilters(chart)
    ? omnifilters.reduce(
        (filters: Filter[], filter: FilterMetadata) =>
          filter.appliesTo === "CHART" && filter.chartId === chartId
            ? [...filters, ...[filter]]
            : filters,
        []
      )
    : []
}

export const migrateChartFilters = (
  sourceChartId: string,
  sourceChart: ChartState,
  newChartId: string
) => (dispatch: Function, getState: Function) => {
  const { charts } = getState()
  const newChart = charts[newChartId]

  getFilterMetasForChartId(sourceChartId, sourceChart, getState).forEach(
    (sourceFilterMeta: ChartFilterMetadata) => {
      if (!sourceFilterMeta.isBinnedFilter) {
        const sourceDataSelectionIndex =
          isChartMultiSource(sourceChart) || isMultiLayer(sourceChart.type)
            ? sourceChart.dataSelections.findIndex(
                (ds: ComboDataSelection) =>
                  ds.layerId === sourceFilterMeta.layerId
              )
            : 0

        const correspondingNewChartLayerId =
          newChart.dataSelections[sourceDataSelectionIndex].layerId

        dispatch(
          setChartFilter(
            sourceFilterMeta.filter,
            newChartId,
            correspondingNewChartLayerId,
            sourceChartId === newChartId ? sourceFilterMeta.name : undefined,
            sourceFilterMeta.enabled
          )
        )
      }
    }
  )
}

export const migrateSelectorsTitle = (
  sourceChartId: string,
  newChartId: string
) => async (dispatch: Function, getState: Function) => {
  const {
    dimensions,
    measures,
    type,
    yAxisLabel,
    y2AxisLabel,
    customXDomainLabel
  } = getState().charts[sourceChartId]
  // Old Combo chart saves axis labels in chart level
  if (type === "line2") {
    if (customXDomainLabel) {
      dispatch(setBaseDimensionTitle(newChartId, customXDomainLabel))
    }
    if (yAxisLabel) {
      dispatch(setPrimaryMeasureTitle(newChartId, yAxisLabel))
    }
    if (y2AxisLabel) {
      dispatch(setSecondaryMeasureTitle(newChartId, y2AxisLabel))
    }
  } else {
    // Stacked bar and Histogram keeps the axis label within the relevant selector
    const baseDimensionTitle = dimensions.find(
      (dim: Selector) => dim.name === "X Axis"
    ).axisLabel

    if (baseDimensionTitle) {
      dispatch(setBaseDimensionTitle(newChartId, baseDimensionTitle))
    }

    const primaryMeasureTitle = measures.find(
      (measure: Selector) => measure.name === "val"
    ).axisLabel

    if (primaryMeasureTitle) {
      dispatch(setPrimaryMeasureTitle(newChartId, primaryMeasureTitle))
    }
  }
}

export const migrateColorMeasureDomain = (
  sourceChartId: string,
  newChartId: string
) => async (dispatch: Function, getState: Function) => {
  const { colorDomain } = getState().charts[sourceChartId]
  await dispatch(setColorDomain(newChartId, colorDomain))
}
