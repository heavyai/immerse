// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { setTableListData } from "actions/dashboard-action-creators"
import {
  CustomSQLTypes,
  openCustomSQLSelectorModal,
  editParameterizedCustomSQLSelector
} from "components/custom-sql-manager/custom-sql-manager-actions"

import { importableCreateQueuedConnector as createQueuedConnector } from "services/ConnectorWithQueue-importable"
import { importableProcess as processParameters } from "utils/ImmerseSQLPlusPlus/parser-importable"
import { removeChartFromParameterUsage } from "components/parameters/actions/parameter-usage-action-creators"
import { getUserConfigurableUISettings } from "reducers/user-configurable-ui-reducer"

import {
  Aggregate,
  BarDimensionName,
  BarMeasureName,
  Column,
  ComboDataSelection,
  ComboSizeMeasureExpression,
  CUSTOM_SQL_SELECTOR_TYPE,
  CustomSqlExpression,
  DimensionExpression,
  Expression,
  isGroupableNumeric,
  MeasureExpression,
  MeasureOption,
  VegaMarkTypes
} from "vega/constants/data-selection-types"
import { VegaComboChart } from "vega/charts/types"
import {
  createNumericScaleSettings,
  createTimeScaleSettings
} from "vega/utils/binning"
import {
  createAggregateMeasure,
  createColumnExpression,
  createCountMeasure,
  createMarkSettings,
  getLayerById,
  getLayerIndex,
  isCountOption,
  supportsBinnedNumericScale,
  supportsBinnedTimeScale
} from "vega/utils/data-selection"

import { clearChartBin, setChartBin } from "./bin-settings-thunks"
import {
  addDataSelectionDirect,
  clearCustomDimensionsByValue,
  clearDimensionDirect,
  clearMeasureDirect,
  removeDataSelectionDirect,
  setDimensionDirect,
  setMeasureDirect,
  setNullDimensionsEnabled,
  setSelectedDataSelection,
  setTable
} from "./data-selection-action-creators"
import { clearChartFilters, clearCrossFilters } from "./filter-action-creators"
import {
  clearPrimaryMeasureFormat,
  clearScaleType
} from "./presentation-settings-action-creators"
import {
  clearColorDomain,
  toggleColorMeasurePaletteReversal
} from "./scale-settings-action-creators"
import {
  topnResetAllOthersOptions,
  topnResetOptions
} from "./top-n-action-creators"
import {
  isDictString,
  isIntegerType,
  isNumericType
} from "../../constants/data-types"
import { isMatch } from "lodash"
import { getTablesForDataSource } from "components/join-manager/utils"
import { getFields } from "services/ImmerseCrossFilter/utils"
import { SELECTOR_ASSIGNMENTS } from "constants/selectors"
import { clearPaletteMapping } from "components/shared-settings/palette-mapping-thunks"
import { CHART_TYPES } from "constants/chart-types"
import { isBaseDimCategoricalColoringChart } from "reducers/charts/helpers/color-helpers"

export const addDataSelection = (chartId: string) => async (
  dispatch,
  getState
) => {
  await dispatch(addDataSelectionDirect(chartId))

  const { dataSelections } = getState().charts[chartId] as VegaComboChart

  await dispatch(
    setSelectedDataSelection(
      chartId,
      dataSelections[dataSelections.length - 1].layerId
    )
  )
}

export const removeDataSelection = (chartId: string, layerId: string) => (
  dispatch,
  getState
) => {
  const { dataSelections, selectedLayerId } = getState().charts[
    chartId
  ] as VegaComboChart

  if (selectedLayerId === layerId) {
    const idx = dataSelections.findIndex((ds) => ds.layerId === layerId)
    if (idx > 0) {
      dispatch(removeDataSelectionDirect(chartId, layerId))
      dispatch(
        setSelectedDataSelection(chartId, dataSelections[idx - 1].layerId)
      )
    } else if (idx + 1 < dataSelections.length) {
      dispatch(removeDataSelectionDirect(chartId, layerId))
      dispatch(
        setSelectedDataSelection(chartId, dataSelections[idx + 1].layerId)
      )
    } else {
      dispatch(removeDataSelectionDirect(chartId, layerId))
      dispatch(addDataSelection(chartId))
    }
  }

  // remove any filters on the layer
  dispatch(clearChartFilters(chartId, layerId))
  dispatch(clearCrossFilters(chartId))

  // and nuke the chart's parameter usage
  dispatch(removeChartFromParameterUsage(chartId))

  // After removing a layer, reset topN options to match with updated layer index
  const chart = getState().charts[chartId] as VegaComboChart
  chart.dataSelections.forEach((ds) => {
    if (ds.topNoptions) {
      dispatch(topnResetAllOthersOptions(chartId, ds.layerId, "topNoptions"))
    }
  })
}

export const selectTable = (
  chartId: string,
  layerId: string,
  dataSource: string
) => async (dispatch, getState, services) => {
  const queuedConnector = createQueuedConnector({
    connector: services.get("DbCon"),
    dashboardId: getState().dashboard.id,
    chartId,
    table: dataSource
  })

  const tables = getTablesForDataSource(dataSource)
  await dispatch(setTable(chartId, layerId, dataSource))
  dispatch(clearCrossFilters(chartId))
  // TODO: remove with old crossfilter
  const cfManager = services.get("crossfilter")
  let currentCf = cfManager.getCrossfilter(dataSource)

  // Bootstrap a crossfilter instance - some things that read
  // dashboard.dataSources assumes this is already populated
  if (!currentCf) {
    currentCf = await services
      .get("CrossFilter")
      .crossfilter(queuedConnector, tables, dataSource)
    cfManager.setCrossfilter(dataSource, currentCf)
  }
  const { columns } = await getFields({
    connector: queuedConnector,
    tables
  })

  const { dashboard: dataSources } = getState()

  if (!dataSources[dataSource]) {
    // Store this column metadata in dashboard.dataSources
    await dispatch(setTableListData(dataSource, columns))
  }
}

export const makeMeasureExpressionFromMeasureOption = (
  table: string,
  option: MeasureOption,
  dataSelection?: ComboDataSelection,
  omitAggregation = false
): Expression => {
  if (isCountOption(option)) {
    return createCountMeasure(table)
  }
  if (omitAggregation) {
    return createColumnExpression(table, option)
  } else if (isGroupableNumeric(option)) {
    // Switch to the "Average" aggregate by default for numeric columns
    return createAggregateMeasure(table, option, "Avg")
  }

  // QoL: If color measure matches a dimension, '# Unique' is always 1 so
  // 'Mode' is more useful for coloring
  const selectedDimensions = dataSelection?.dimensions.xAxis || []

  // Using isMatch here instead of isEqual, because there can be additional properties on the column
  // so isMatch makes sure that every property that exists on the option matches the column (table, value, etc)
  const measureOptionMatchesDimen = selectedDimensions.some(({ column }) =>
    isMatch(column as object, option)
  )
  if (
    measureOptionMatchesDimen &&
    (isDictString(option) || isIntegerType(option.type))
  ) {
    return createAggregateMeasure(table, option, "Mode")
  }
  return createAggregateMeasure(table, option, "# Unique")
}

export const setMeasure = (
  chartId: string,
  layerId: string,
  measureName: BarMeasureName,
  measureIndex: number | null,
  measure: MeasureExpression
) => async (dispatch, getState, services) => {
  const state = getState()
  const chart = state.charts[chartId]
  const layerIndex = getLayerIndex(chart.dataSelections, layerId)
  let markColor = undefined
  const cf = services
    .get("crossfilter")
    .getCrossfilter(chart.dataSelections[layerIndex].table.name, chartId)

  // figure out if it's a new measure, if so apply color theme
  if (
    measureName === "size" &&
    measureIndex !== null &&
    !chart.dataSelections[layerIndex].measures.size[measureIndex]
  ) {
    // get color theme (custom)
    const theme = getUserConfigurableUISettings(state).colorPalettes.custom

    // if it's the standard custom theme, move blue to front, since it's aways 1st color
    if (theme[10] === "#27aeef" && theme[0] === "#ea5545") {
      theme.splice(10, 1)
      theme.unshift("#27aeef")
    }

    const countOfMeasures = chart.dataSelections.reduce(
      (acc, ds) => acc + ds.measures.size.length,
      0
    )
    // rotate through theme colors for each measure
    markColor = theme[countOfMeasures % theme.length]
  }

  if (measureName === SELECTOR_ASSIGNMENTS.COLOR) {
    dispatch(
      topnResetOptions(chartId, layerId, "measureTopNOptions", {
        showAllOthersInLegend: false
      })
    )
  }

  // store minMax value in measure data for log scale option display
  if (cf && measure?.column?.value && isNumericType(measure?.column?.type)) {
    const minMax = await cf.getMinMax(measure.column.value)
    measure.minMax = minMax
  }

  dispatch(clearPaletteMapping({ chartId, layerId, isMeasure: true }))
  dispatch(
    setMeasureDirect(
      chartId,
      layerId,
      measureName,
      measureIndex,
      measure,
      markColor
    )
  )

  if (measure.type === "custom_sql") {
    processParameters(measure.sql, {
      chartId,
      token: `measure:${layerId}:${measureName}:${measureIndex}`,
      useDisplayName: true
    })
  } else if (measure.type === "column_aggregate" && measure.column.parameter) {
    processParameters(measure.column.value, {
      chartId,
      token: `measure:${layerId}:${measureName}:${measureIndex}`,
      useDisplayName: true
    })
  }
}

export const setMeasureOption = (
  chartId: string,
  layerId: string,
  measureName: BarMeasureName,
  measureIndex: number | null,
  option: MeasureOption
) => (dispatch, getState) => {
  const { charts } = getState()
  const chart = charts[chartId]
  const dataSelection = getLayerById(chart.dataSelections, layerId)
  const table = dataSelection?.table?.name
  if (table) {
    const omitAggregation = chart.type === CHART_TYPES.BOX_PLOT
    const measure = makeMeasureExpressionFromMeasureOption(
      table,
      option,
      dataSelection,
      omitAggregation
    )
    if (measureName === "size") {
      const markType =
        chart.type === CHART_TYPES.BOX_PLOT
          ? VegaMarkTypes.BOX
          : VegaMarkTypes.BAR
      const sizeMeasure = {
        ...measure,
        markSettings: createMarkSettings(markType)
      }

      dispatch(
        setMeasure(chartId, layerId, measureName, measureIndex, sizeMeasure)
      )
    } else {
      dispatch(clearColorDomain(chartId))
      dispatch(toggleColorMeasurePaletteReversal(chartId, false))
      dispatch(setMeasure(chartId, layerId, measureName, measureIndex, measure))
    }
  }
}

export const getMeasureExpressionByLayerId = (
  chartId: string,
  layerId: string,
  measureExpressionIndex: number | null,
  measureExpressionName: BarMeasureName
) => (
  dispatch,
  getState
): MeasureExpression | ComboSizeMeasureExpression | null => {
  const { charts } = getState()
  const chart = charts[chartId]
  const dataSelection = getLayerById(chart.dataSelections, layerId)
  let measureExpression: MeasureExpression | null = null
  if (dataSelection) {
    if (measureExpressionName === "size") {
      if (measureExpressionIndex === null) {
        throw new Error("No measure index passed for array measure")
      }

      measureExpression =
        dataSelection.measures.size[measureExpressionIndex] || null
    } else {
      measureExpression = dataSelection.measures.color
    }
  }

  return measureExpression
}

export const setMeasureAggregate = (
  chartId: string,
  layerId: string,
  measureName: BarMeasureName,
  measureIndex: number | null,
  aggregate: Aggregate
) => (dispatch) => {
  const measureExpression = dispatch(
    getMeasureExpressionByLayerId(chartId, layerId, measureIndex, measureName)
  )
  if (
    measureExpression !== null &&
    measureExpression.type === "column_aggregate"
  ) {
    dispatch(
      setMeasure(chartId, layerId, measureName, measureIndex, {
        ...measureExpression,
        aggregate
      })
    )
  } else {
    throw new Error("Not an aggregate measure expression")
  }
}

const buildParameterizedCustomSelectorFromOption = (option, table) => ({
  type: "custom_sql",
  table,
  column: option.column,
  name: option.value,
  sql: option.value,
  sharedCustom: Boolean(option.sharedCustom),
  globalCustom: Boolean(option.globalCustom)
})

export const setParameterizedCustomMeasureFromDropdown = (
  chartId: string,
  layerId: string,
  measureName: BarMeasureName,
  measureIndex: number | null,
  option
) => (dispatch, getState) => {
  const { charts } = getState()
  const chart = charts[chartId]
  const dataSelection = getLayerById(chart.dataSelections, layerId)
  const table = dataSelection?.table?.name

  if (table) {
    const expression: CustomSqlExpression = buildParameterizedCustomSelectorFromOption(
      option,
      table
    )

    if (measureName === "size") {
      const markType =
        chart.type === CHART_TYPES.BOX_PLOT
          ? VegaMarkTypes.BOX
          : VegaMarkTypes.BAR
      const sizeMeasure = {
        ...expression,
        markSettings: createMarkSettings(markType)
      }

      dispatch(
        setMeasure(chartId, layerId, measureName, measureIndex, sizeMeasure)
      )
    } else {
      dispatch(clearColorDomain(chartId))
      dispatch(toggleColorMeasurePaletteReversal(chartId, false))
      dispatch(
        setMeasure(chartId, layerId, measureName, measureIndex, expression)
      )
    }
  }
}

export const editCustomSqlMeasure = (
  chartId: string,
  layerId: string,
  measureName: BarMeasureName,
  measureIndex: number | null
) => (dispatch, getState) => {
  const { charts } = getState()
  const dataSelection = getLayerById(charts[chartId].dataSelections, layerId)
  const table = dataSelection?.table?.name

  if (table) {
    let measure: MeasureExpression | null = null

    if (measureName === "size") {
      if (measureIndex === null) {
        throw new Error("No dimension index passed for array dimension")
      }

      measure = dataSelection?.measures.size[measureIndex] || null
    } else {
      measure = dataSelection?.measures.color || null
    }

    if (
      measure &&
      measure.type === CUSTOM_SQL_SELECTOR_TYPE &&
      !measure.sharedCustom &&
      !measure.globalCustom
    ) {
      dispatch(
        openCustomSQLSelectorModal(
          chartId,
          layerId,
          table,
          measureName,
          measureIndex,
          measure,
          CustomSQLTypes.CUSTOM_SQL_MEASURE
        )
      )
    } else {
      dispatch(
        openCustomSQLSelectorModal(
          chartId,
          layerId,
          table,
          measureName,
          measureIndex,
          null,
          CustomSQLTypes.CUSTOM_SQL_MEASURE
        )
      )
    }
  }
}

export const clearMeasure = (
  chartId: string,
  layerId: string,
  measureName: BarMeasureName,
  measureIndex: number | null
) => async (dispatch) => {
  if (measureName === "color") {
    dispatch(clearColorDomain(chartId))
    dispatch(toggleColorMeasurePaletteReversal(chartId, false))
    dispatch(clearPaletteMapping({ chartId, layerId, isMeasure: true }))
  }

  if (measureName === "size") {
    dispatch(clearPrimaryMeasureFormat(chartId))
    dispatch(clearScaleType(chartId))
  }

  dispatch(clearMeasureDirect(chartId, layerId, measureName, measureIndex))
}

// Checks the chart's base dimensions and either initializes or clears
// the base dimension scale settings as required
const touchBaseDimensionScale = (chartId: string) => async (
  dispatch,
  getState
) => {
  const chart = getState().charts[chartId]
  const { binSettings } = chart as VegaComboChart

  if (supportsBinnedTimeScale(chart)) {
    if (
      !(
        binSettings &&
        (binSettings.dimensionType === "binned_time" ||
          binSettings.dimensionType === "extract_time")
      )
    ) {
      await dispatch(setChartBin(chartId, createTimeScaleSettings()))
    }
  } else if (supportsBinnedNumericScale(chart)) {
    if (binSettings?.dimensionType !== "binned_numeric") {
      await dispatch(setChartBin(chartId, createNumericScaleSettings()))
    }
  } else {
    await dispatch(clearChartBin(chartId))
  }
}

export const setDimension = (
  chartId: string,
  layerId: string,
  dimensionName: BarDimensionName,
  dimensionIndex: number | null,
  expression: DimensionExpression
) => async (dispatch, getState) => {
  const state = getState()
  const chart = state.charts[chartId]
  if (dimensionName === "xAxis") {
    const promises = [
      dispatch(
        setDimensionDirect(
          chartId,
          layerId,
          dimensionName,
          dimensionIndex,
          expression
        )
      ),
      dispatch(touchBaseDimensionScale(chartId)),
      dispatch(clearCrossFilters(chartId))
    ]
    // Box plot by default colors by base dimension, thus we need to set up topN options
    // if we are setting the base dimension for that chart
    if (isBaseDimCategoricalColoringChart(chart.type)) {
      promises.push(dispatch(topnResetOptions(chartId, layerId, "topNoptions")))
    }
    // Have to do these as Promise.all to ensure they are committed in the same
    // update cycle as far as React knows (with the help of redux-promise-middleware).
    // batch() from react-redux would also work, but isn't promise-chainable.
    await Promise.all(promises)
  } else if (dimensionName === "color") {
    // Order matters; initialize options first so that we can depend on their
    // existence anytime a color dimension exists.
    await dispatch(topnResetOptions(chartId, layerId, "topNoptions"))

    await Promise.all([
      dispatch(
        setDimensionDirect(
          chartId,
          layerId,
          dimensionName,
          dimensionIndex,
          expression
        )
      ),
      dispatch(clearCrossFilters(chartId))
    ])
  }
}

export const setDimensionColumn = (
  chartId: string,
  layerId: string,
  dimensionName: BarDimensionName,
  dimensionIndex: number | null,
  column: Column
) => async (dispatch, getState) => {
  const { charts } = getState()
  const chart = charts[chartId]
  const dataSelection = getLayerById(chart.dataSelections, layerId)
  const table = dataSelection?.table?.name

  if (table) {
    const expression: DimensionExpression = {
      type: "column",
      table,
      column
    }

    await dispatch(
      setDimension(chartId, layerId, dimensionName, dimensionIndex, expression)
    )

    if (column.parameter) {
      processParameters(column.value, {
        chartId,
        token: `dimension:${layerId}:${dimensionName}:${dimensionIndex}`,
        useDisplayName: true
      })
    }
  }
}

export const setParameterizedCustomDimensionFromDropdown = (
  chartId: string,
  layerId: string,
  dimensionName: BarDimensionName,
  dimensionIndex: number | null,
  option
) => (dispatch, getState) => {
  const { charts } = getState()
  const chart = charts[chartId]
  const dataSelection = getLayerById(chart.dataSelections, layerId)
  const table = dataSelection?.table?.name

  if (table) {
    const expression: CustomSqlExpression = buildParameterizedCustomSelectorFromOption(
      option,
      table
    )

    dispatch(
      setDimension(chartId, layerId, dimensionName, dimensionIndex, expression)
    )
  }
}

export const editParameterizedCustomSql = (
  chartId: string,
  layerId: string,
  selectorName: BarMeasureName | BarDimensionName,
  selectorIndex: number | null,
  customSQLType: CustomSQLTypes,
  existingCustomSql
) => (dispatch, getState) => {
  const { charts } = getState()
  const dataSelection = getLayerById(charts[chartId].dataSelections, layerId)
  const table = dataSelection?.table?.name

  if (table && existingCustomSql) {
    dispatch(
      editParameterizedCustomSQLSelector({
        customSelectorValue: existingCustomSql.value,
        activeDataSource: table,
        chartId,
        customSQLType,
        layerId,
        selectorIndex,
        isOldSelector: false
      })
    )
  }
}

export const editCustomSqlDimension = (
  chartId: string,
  layerId: string,
  dimensionName: BarDimensionName,
  dimensionIndex: number | null
) => (dispatch, getState) => {
  const { charts } = getState()
  const dataSelection = getLayerById(charts[chartId].dataSelections, layerId)
  const table = dataSelection?.table?.name

  if (table) {
    let dimension: DimensionExpression | null = null

    if (dimensionName === "xAxis") {
      if (dimensionIndex === null) {
        throw new Error("No dimension index passed for array dimension")
      }
      dimension = dataSelection?.dimensions.xAxis[dimensionIndex] || null
    } else {
      dimension = dataSelection?.dimensions.color || null
    }
    if (
      dimension &&
      dimension.type === CUSTOM_SQL_SELECTOR_TYPE &&
      !dimension.sharedCustom &&
      !dimension.globalCustom
    ) {
      dispatch(
        openCustomSQLSelectorModal(
          chartId,
          layerId,
          table,
          dimensionName,
          dimensionIndex,
          dimension,
          CustomSQLTypes.CUSTOM_SQL_DIMENSION
        )
      )
    } else {
      // If no old custom sql is set, and no existing sql is passed, create a new ome
      dispatch(
        openCustomSQLSelectorModal(
          chartId,
          layerId,
          table,
          dimensionName,
          dimensionIndex,
          null,
          CustomSQLTypes.CUSTOM_SQL_DIMENSION
        )
      )
    }
  }
}

export const clearDimension = (
  chartId: string,
  layerId: string,
  dimensionName: BarDimensionName,
  dimensionIndex: number | null
) => async (dispatch) => {
  await Promise.all([
    dispatch(
      clearDimensionDirect(chartId, layerId, dimensionName, dimensionIndex)
    ),
    dispatch(touchBaseDimensionScale(chartId)),
    dispatch(clearCrossFilters(chartId))
  ])
}

export const clearParameterizedCustomDimensionSelectors = (chartId, value) => (
  dispatch
) => {
  dispatch(clearCustomDimensionsByValue(chartId, value))
  dispatch(touchBaseDimensionScale(chartId))
  dispatch(clearCrossFilters(chartId))
}

export const toggleNullDimensionsEnabled = (chartId: string) => async (
  dispatch,
  getState
) => {
  const chart = getState().charts[chartId] as VegaComboChart

  if (chart) {
    dispatch(setNullDimensionsEnabled(chartId, !chart.showNullDimensions))
  }
}
