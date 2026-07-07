// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { compose, map } from "ramda"

import * as Line2FilterActions from "./line2-filter-action-creators"
import { CHARTS_DEFAULT_OTHER_ALIASES } from "constants/charts"
import COMBO_CHART_DIMENSION_SETTINGS from "charts/combo/dimension-settings"
import { COLOR_DIMENSION_INDEX } from "./line2-consts"
import {
  chartStateIsMulti,
  getDataSource,
  getSelectorsForSource,
  getXAxisDimension,
  getColorDimension
} from "reducers/charts/helpers/multi-source-helpers"
import genLineSQL, {
  determineAutoBinInterval,
  genTopKSQL,
  genMinMaxSQL
} from "./sql-utils"
import { getLabel } from "./utils"
import {
  setChartSpecificBinFilters,
  deleteChartSpecificBinFilters
} from "vega/actions/filter-action-creators-crossfilter-interop"
import * as DCActions from "actions/dc-action-creators"
import { importableServices as Services } from "services/immerse-importable"
import { importableCreateQueuedConnector as createQueuedConnector } from "services/ConnectorWithQueue-importable"
import { updateChart } from "actions/update-chart-action-creator"
import { addCustomColorDomain } from "actions/charts-color-action-creators"
import { UPDATE_SELECTOR } from "constants/action-types"

export const ENABLE_RANGE_CHART = "ENABLE_RANGE_CHART"
export const REQUEST_DATA = "REQUEST_DATA"
export const REQUEST_RANGE_DATA = "REQUEST_RANGE_DATA"
export const RECEIVE_DATA = "RECEIVE_DATA"
export const RECEIVE_ERROR = "RECEIVE_ERROR"
export const RECEIVE_RANGE_DATA = "RECEIVE_RANGE_DATA"
export const SET_COLORS_NOT_DIRTY = "SET_COLORS_NOT_DIRTY"
export const RESET_COLORS = "RESET_COLORS"
export const DESTROY_CHART = "DESTROY_CHART"
export const SET_X_AXIS_LABEL = "SET_X_AXIS_LABEL"
export const SET_Y_AXIS_LABEL = "SET_Y_AXIS_LABEL"
export const SET_Y2_AXIS_LABEL = "SET_Y2_AXIS_LABEL"
export const SET_BINNING = "SET_BINNING"
export const SET_AUTO_BIN = "SET_AUTO_BIN"
export const SET_EXTRACT = "SET_EXTRACT"
export const SET_X_AXIS_DOMAIN = "SET_X_AXIS_DOMAIN"
export const SET_X_AXIS_DOMAIN_AUTO = "SET_X_AXIS_DOMAIN_AUTO"
export const SET_X_AXIS_DOMAIN_AUTO_MULTI_SOURCE =
  "SET_X_AXIS_DOMAIN_AUTO_MULTI_SOURCE"
export const SET_Y_AXIS_DOMAIN = "SET_Y_AXIS_DOMAIN"
export const SET_Y2_AXIS_DOMAIN = "SET_Y_AXIS_2_DOMAIN"
export const SET_Y_AXIS_ORIENTATION = "SET_Y_AXIS_ORIENTATION"
export const SET_MARK_TYPE = "SET_MARK_TYPE"
export const REMOVE_MARK_TYPE = "REMOVE_MARK_TYPE"
export const TOGGLE_X_DOMAIN_LOCK = "TOGGLE_X_DOMAIN_LOCK"
export const TOGGLE_Y_DOMAIN_LOCK = "TOGGLE_Y_DOMAIN_LOCK"
export const TOGGLE_Y2_DOMAIN_LOCK = "TOGGLE_Y2_DOMAIN_LOCK"
export const BRUSH_RANGE_CHANGE = "BRUSH_RANGE_CHANGE"
export const ENABLE_LINE_CHART_MEASURE = "ENABLE_LINE_CHART_MEASURE"
export const ENABLE_LINE_CHART_DIMENSION = "ENABLE_LINE_CHART_DIMENSION"
export const ENABLE_LINE_CHART_COLOR_DIMENSION_MULTI_SOURCE =
  "ENABLE_LINE_CHART_COLOR_DIMENSION_MULTI_SOURCE"
export const DISABLE_LINE_CHART_MEASURE = "DISABLE_LINE_CHART_MEASURE"
export const DISABLE_LINE_CHART_DIMENSION = "DISABLE_LINE_CHART_DIMENSION"
export const CHANGE_MEASURE_FORMAT = "CHANGE_MEASURE_FORMAT"
export const CHANGE_DIMENSION_FORMAT = "CHANGE_DIMENSION_FORMAT"
export const CLEAR_AXIS_LABELS = "CLEAR_AXIS_LABELS"
export const SET_CHART_FILTER_STRING_MULTISOURCE =
  "SET_CHART_FILTER_STRING_MULTISOURCE"
export const SET_CHART_BIN_EXTENT_AND_FILTER_STRING_MULTISOURCE =
  "SET_CHART_BIN_EXTENT_AND_FILTER_STRING_MULTISOURCE"
export const SET_CUSTOM_X_DOMAIN_LABEL = "SET_CUSTOM_X_DOMAIN_LABEL"
export const CLEAR_X_DOMAIN_LOCKS = "CLEAR_X_DOMAIN_LOCK"

export const DEFAULT_PREFLIGHT_LIMIT = 5

export type Extract =
  | "year"
  | "quarter"
  | "month"
  | "day"
  | "isodow"
  | "hour"
  | "minute"

export function toggleRangeChart(shouldBeOn: boolean, id: string) {
  return {
    type: ENABLE_RANGE_CHART,
    shouldBeOn,
    id
  }
}

export function destroyChart(id: string) {
  return {
    type: DESTROY_CHART,
    id
  }
}

export const setCustomXDomainLabel = (id, label) => ({
  type: SET_CUSTOM_X_DOMAIN_LABEL,
  id,
  label
})

export function setXAxisLabel(id: string, label: string) {
  return {
    type: SET_X_AXIS_LABEL,
    id,
    label
  }
}

export function setYAxisLabel(id: string, label: string) {
  return {
    type: SET_Y_AXIS_LABEL,
    id,
    label
  }
}

export function setY2AxisLabel(id: string, label: string) {
  return {
    type: SET_Y2_AXIS_LABEL,
    id,
    label
  }
}

export function setMarkType(id: string, index, newMarkType) {
  return {
    type: SET_MARK_TYPE,
    id,
    index,
    newMarkType
  }
}

export function removeMarkType(id: string, index) {
  return {
    type: REMOVE_MARK_TYPE,
    id,
    index
  }
}

export function toggleYAxisOrientation(id: string, index, orientation) {
  return {
    type: SET_Y_AXIS_ORIENTATION,
    id,
    index,
    orientation
  }
}

export function setBinning(id: string, bin) {
  return {
    type: SET_BINNING,
    id,
    bin
  }
}

export function setExtract(id: string, extract: Extract) {
  return {
    type: SET_EXTRACT,
    id,
    extract
  }
}

export function setAutoBin(id: string, { isSelected }) {
  return {
    type: SET_AUTO_BIN,
    id,
    isSelected
  }
}

// For the user manually setting the domain, will toggle elasticX off
export function setXAxisDomain(id: string, extent) {
  return async (dispatch) => {
    await dispatch({
      type: SET_X_AXIS_DOMAIN,
      id,
      extent
    })
    await dispatch(setChartSpecificBinFilters(id))
  }
}

export function setYAxisDomain(id: string, extent) {
  return {
    type: SET_Y_AXIS_DOMAIN,
    id,
    extent
  }
}

export function setY2AxisDomain(id: string, extent) {
  return {
    type: SET_Y2_AXIS_DOMAIN,
    id,
    extent
  }
}

export function clearXAxisDomainLocks(id) {
  return {
    type: CLEAR_X_DOMAIN_LOCKS,
    id
  }
}

export function toggleXDomainLock(id: string, isLocked: boolean) {
  return {
    type: TOGGLE_X_DOMAIN_LOCK,
    id,
    isLocked
  }
}

// Set X Axis domain without toggling elasticX off
const setXAxisDomainAuto = (chartId: string, extent: any[]) => {
  return async (dispatch) => {
    await dispatch({
      type: SET_X_AXIS_DOMAIN_AUTO,
      chartId,
      extent
    })
    dispatch(setChartSpecificBinFilters(chartId))
  }
}

// Set X Axis domain without toggling elasticX off
const setXAxisDomainAutoMultiSource = (
  chartId: string,
  multiSourceIndex: string,
  extent: any[]
) => async (dispatch) => {
  await dispatch({
    type: SET_X_AXIS_DOMAIN_AUTO_MULTI_SOURCE,
    chartId,
    multiSourceIndex,
    extent
  })
  await dispatch(setChartSpecificBinFilters(chartId))
}

const refreshMinMaxForAllSources = (
  chartId: string,
  dashboardId: string
) => async (dispatch, getState, services) => {
  const unqueuedConnector = services.get("DbCon")

  const crossfilter = services.get("crossfilter")
  const chart = getState().charts[chartId]

  await dispatch(deleteChartSpecificBinFilters(chartId))

  if (chartStateIsMulti(chart)) {
    await Promise.all(
      Object.keys(chart.multiSources).map(async (multiSourceIndex) => {
        const chartDataSource = getDataSource(chart, multiSourceIndex)
        // get new domain/binExtent with filters applied
        const xDim = getXAxisDimension(chart.dimensions, multiSourceIndex)
        const queuedConnector = createQueuedConnector({
          connector: unqueuedConnector,
          dashboardId,
          chartId,
          keyModifier: multiSourceIndex,
          tableName: chartDataSource
        })

        const [{ min_val, max_val }] = await queuedConnector.queryAsync(
          genMinMaxSQL({
            dimension: xDim,
            dataSource: chartDataSource,
            filterString: crossfilter
              .getCrossfilter(chartDataSource, chartId)
              .getFilterString(),
            globalFilterString: crossfilter
              .getCrossfilter(chartDataSource, chartId)
              .getGlobalFilterString()
          }),
          {}, // no options
          "genMinMaxSQL"
        )

        const extent =
          min_val !== null && max_val !== null
            ? [min_val, max_val]
            : [xDim.min_val, xDim.max_val]

        await dispatch(
          setXAxisDomainAutoMultiSource(chartId, multiSourceIndex, extent)
        )
        await dispatch(DCActions.redrawAll(chartDataSource))
      })
    )
  } else {
    const chartDataSource = chart.dataSource
    // get new domain/binExtent with filters applied
    const xDim = chart.dimensions[0]
    const queuedConnector = createQueuedConnector({
      connector: unqueuedConnector,
      dashboardId,
      chartId,
      tableName: chartDataSource
    })

    const [{ min_val, max_val }] = await queuedConnector.queryAsync(
      genMinMaxSQL({
        dimension: xDim,
        dataSource: chartDataSource,
        filterString: crossfilter
          .getCrossfilter(chartDataSource, chartId)
          .getFilterString(),
        globalFilterString: crossfilter
          .getCrossfilter(chartDataSource, chartId)
          .getGlobalFilterString()
      }),
      {}, // no options
      "genMinMaxSQL"
    )

    const extent =
      min_val !== null && max_val !== null
        ? [min_val, max_val]
        : [xDim.min_val, xDim.max_val]

    await dispatch(setXAxisDomainAuto(chartId, extent))
    await dispatch(DCActions.redrawAll(chart.dataSource))
  }
}

export function toggleXDomainLockAndRefresh(
  chartId: string,
  isLocked: boolean
) {
  return async (dispatch, getState) => {
    await dispatch(toggleXDomainLock(chartId, isLocked))

    // Refresh X domain min/max if going from locked -> unlocked
    if (!isLocked) {
      await dispatch(
        refreshMinMaxForAllSources(chartId, getState().dashboard.id)
      )
    }
  }
}

export function toggleYDomainLock(id: string, isLocked, extent) {
  return {
    type: TOGGLE_Y_DOMAIN_LOCK,
    id,
    isLocked,
    extent
  }
}

export function toggleY2DomainLock(id: string, isLocked, extent) {
  return {
    type: TOGGLE_Y2_DOMAIN_LOCK,
    id,
    isLocked,
    extent
  }
}

export function brushRangeChange(id: string, { extent }) {
  // TO DO: reducer
  return {
    type: BRUSH_RANGE_CHANGE,
    id,
    extent
  }
}

export function requestData(id: string) {
  return {
    type: REQUEST_DATA,
    id
  }
}

export function requestRangeData(id: string) {
  return {
    type: REQUEST_RANGE_DATA,
    id
  }
}

export function receiveData(data, id) {
  return {
    type: RECEIVE_DATA,
    data,
    receivedAt: Date.now(),
    id
  }
}

export function receiveRangeData(rangeData, id) {
  return {
    type: RECEIVE_RANGE_DATA,
    rangeData,
    receivedAt: Date.now(),
    id
  }
}

export function receiveError(error, id) {
  return {
    type: RECEIVE_ERROR,
    error,
    receivedAt: Date.now(),
    id
  }
}

export function enableLineChartDimension(id: string, index: number) {
  return {
    type: ENABLE_LINE_CHART_DIMENSION,
    id,
    index
  }
}

export function enableLineChartColorDimensionMultiSource(
  id: string,
  multiSourceIndex: number
) {
  return {
    type: ENABLE_LINE_CHART_COLOR_DIMENSION_MULTI_SOURCE,
    id,
    multiSourceIndex
  }
}

export function disableLineChartDimension(id: string, index) {
  return {
    type: DISABLE_LINE_CHART_DIMENSION,
    id,
    index
  }
}

export function enableLineChartMeasure(id: string, index) {
  return {
    type: ENABLE_LINE_CHART_MEASURE,
    id,
    index
  }
}

export function disableLineChartMeasure(id: string, index) {
  return {
    type: DISABLE_LINE_CHART_MEASURE,
    id,
    index
  }
}

export const setChartExtent = (chartId, extent) => (dispatch) =>
  dispatch(updateChart(chartId, { rangeFilter: [extent] }))

export function clearChartExtent(chartId) {
  return (dispatch) => {
    dispatch(updateChart(chartId, { rangeFilter: [] }))
  }
}

export function setChartFilterString(
  chartId: string,
  multiSourceIndex,
  filterString
) {
  return {
    type: SET_CHART_FILTER_STRING_MULTISOURCE,
    chartId,
    multiSourceIndex,
    filter: filterString
  }
}

export function clearChartFilterString(chartId) {
  return (dispatch) => {
    dispatch(updateChart(chartId, { filterString: null, filters: [] }))
  }
}

export const setChartFilterExtent = Line2FilterActions.setComboChartFilterExtent
export const clearChartFilterExtent =
  Line2FilterActions.clearComboChartFilterExtent

export function setColorsNotDirty(chartId: string, multiSourceIndex) {
  return {
    type: SET_COLORS_NOT_DIRTY,
    id: chartId,
    multiSourceIndex
  }
}

export function resetColors(chartId: string, multiSourceIndex) {
  return {
    type: RESET_COLORS,
    id: chartId,
    multiSourceIndex
  }
}

export function changeMeasureFormat(id: string, index, format, formatType) {
  return {
    type: CHANGE_MEASURE_FORMAT,
    id,
    index,
    format,
    formatType
  }
}

export function changeDimensionFormat(
  id: string,
  format: string,
  dimensionIndex: number
) {
  return {
    type: CHANGE_DIMENSION_FORMAT,
    id,
    format,
    dimensionIndex
  }
}

export function clearAxisLabels(id) {
  return {
    type: CLEAR_AXIS_LABELS,
    id
  }
}

export const makePreflightQuery = async (querySpec, queuedConnector) => {
  const data = await queuedConnector.queryAsync(
    genTopKSQL({
      ...querySpec,
      limit: querySpec.limit || DEFAULT_PREFLIGHT_LIMIT
    }),
    {}, // no options
    "genTopKSQL"
  )
  return data
    .map((o) => o.key0)
    .slice(0, querySpec.limit || DEFAULT_PREFLIGHT_LIMIT)
}

const updateSelectorActionMultiSource = (
  chartId,
  selectorType,
  selectorIndex,
  multiSourceIndex,
  setter
) => {
  return {
    type: UPDATE_SELECTOR,
    chartId,
    selectorType,
    selectorIndex,
    multiSourceIndex,
    setter
  }
}

const updateCustomColors = (chartId, groups, colorValue, multiSourceIndex) => (
  dispatch
) => {
  const groupsWithoutOther = groups.filter(
    (g) => g !== CHARTS_DEFAULT_OTHER_ALIASES.other
  )

  dispatch(
    updateSelectorActionMultiSource(
      chartId,
      "dimensions",
      COLOR_DIMENSION_INDEX,
      multiSourceIndex,
      (dim) => ({
        ...dim,
        groups: groupsWithoutOther
      })
    )
  )

  dispatch(
    addCustomColorDomain(
      chartId,
      colorValue,
      groupsWithoutOther,
      "other",
      multiSourceIndex
    )
  )
}

function colorSideEffects(
  chartId: string,
  groups,
  querySpec,
  configSpec,
  dispatch,
  multiSourceIndex
) {
  if (groups && groups.length) {
    dispatch(
      updateCustomColors(
        chartId,
        groups,
        querySpec.dimensions[COLOR_DIMENSION_INDEX].value,
        multiSourceIndex
      )
    )
  } else {
    const measures = getSelectorsForSource(
      configSpec.measures,
      multiSourceIndex
    )

    if (measures.length > 0) {
      const measureNames = measures.map(getLabel)
      dispatch(
        addCustomColorDomain(
          chartId,
          "Measures",
          measureNames,
          "other",
          multiSourceIndex
        )
      )
    } else {
      dispatch(resetColors(chartId, multiSourceIndex))
    }
  }
}

const unbinData = (dim, rangeFilter, data, Crossfilter, isRangeQuery) => {
  const timeBin =
    dim.timeBin === "auto"
      ? determineAutoBinInterval(
          dim.currentLowValue,
          dim.currentHighValue,
          dim.numOfBins
        )
      : dim.timeBin
  const queryBinParams = [
    {
      numBins: dim.numOfBins,
      binBounds:
        rangeFilter[0] &&
        rangeFilter[0].length > 1 &&
        !isRangeQuery &&
        !dim.extract // extract needs numerical bounds for unBinResults, not dates
          ? rangeFilter[0]
          : [dim.currentLowValue, dim.currentHighValue],
      extract: dim.extract,
      timeBin
    }
  ]

  const unbinnedResults = Crossfilter.unBinResults(queryBinParams, data)
  if (dim.timeBin) {
    unbinnedResults.forEach((d) => {
      if (d.key0 && Array.isArray(d.key0)) {
        d.key0 = d.key0.map((dB) => dB.value)
      }
    })
  }

  return unbinnedResults
}

const keysNotNil = (data) =>
  (typeof data.key1 === "undefined" || data.key1 !== "undefined") &&
  data.key0 !== null &&
  data.key1 !== null

const mapToDefaultDefaultAliases = (showOther) => (data) =>
  showOther && (data.key1 === "other" || data.key1 === "All Others")
    ? { ...data, key1: CHARTS_DEFAULT_OTHER_ALIASES.other }
    : data

const filterSelectorsBySource = (dataSource, selectors) =>
  getSelectorsForSource(selectors, dataSource.index)

const filterLoadedSelectors = (selectors) =>
  selectors.filter((selector) => selector.value && !selector.loading)

const LINE2_REQUIREMENTS = COMBO_CHART_DIMENSION_SETTINGS

const sourceHasRequirements = (querySpec, dataSource) => {
  const loadedFilter = compose(filterLoadedSelectors, filterSelectorsBySource)

  const loadedDimensions = loadedFilter(dataSource, querySpec.dimensions)
  const loadedMeasures = loadedFilter(dataSource, querySpec.measures)

  return (
    loadedDimensions.length >= LINE2_REQUIREMENTS.minDimensions &&
    loadedMeasures.length >= LINE2_REQUIREMENTS.minMeasures
  )
}

const scopeQuerySpecToSource = (querySpec, chartId) => (dataSource) => {
  const { table, index } = dataSource

  if (table) {
    const dimensions = getSelectorsForSource(querySpec.dimensions, index)
    const measures = getSelectorsForSource(querySpec.measures, index)

    const crossfilter = Services.get("crossfilter").getCrossfilter(
      table,
      chartId
    )

    const filterString = crossfilter.getFilterString()
    const globalFilterString = crossfilter.getGlobalFilterString()

    return {
      ...querySpec,
      dataSource: table,
      multiSourceIndex: index,
      dimensions,
      measures,
      filterString,
      globalFilterString
    }
  } else {
    return null
  }
}

const handleQueryErrors = (err, dispatch, id) => {
  // eslint-disable-next-line no-console
  console.error(err)
  dispatch(receiveError(err, id))
}

export const unlockColors = (chartId, multiSourceIndex) => async (
  dispatch,
  getState,
  services
) => {
  const unqueuedConnector = services.get("DbCon")
  const dashboardId = getState().dashboard.id

  const crossfilter = services.get("crossfilter")
  const chart = getState().charts[chartId]
  const isMulti = chartStateIsMulti(chart)
  const multiIndex = isMulti ? multiSourceIndex : undefined

  const dimensions = getSelectorsForSource(chart.dimensions, multiSourceIndex)
  const measures = getSelectorsForSource(chart.measures, multiSourceIndex)
  const dataSource = getDataSource(chart, multiSourceIndex)
  const filterString = crossfilter
    .getCrossfilter(dataSource, chartId)
    .getFilterString()
  const globalFilterString = crossfilter
    .getCrossfilter(dataSource, chartId)
    .getGlobalFilterString()

  const queuedConnector = createQueuedConnector({
    connector: unqueuedConnector,
    dashboardId,
    chartId,
    keyModifier: multiSourceIndex,
    tableName: dataSource
  })

  let topN = null
  try {
    topN = await makePreflightQuery(
      {
        dimensions,
        measures,
        dataSource,
        filterString,
        globalFilterString
      },
      queuedConnector
    )
  } catch (error) {
    dispatch(receiveError(error, chartId))
  }

  if (topN !== null) {
    const filteredTopN = topN.filter((d) => d !== null)

    dispatch(
      updateCustomColors(
        chartId,
        filteredTopN,
        dimensions[COLOR_DIMENSION_INDEX].value,
        multiIndex
      )
    )
    dispatch(setColorsNotDirty(chartId, multiIndex))
  }
}

const query = async (
  querySpec,
  configSpec,
  id,
  isRangeQuery,
  rangeFilter,
  services,
  dispatch,
  isMulti,
  dashboardId,
  sourcesNeedingColorGroupReset
) => {
  const unqueuedConnector = services.get("DbCon")

  const Crossfilter = services.get("CrossFilter")
  if (isRangeQuery) {
    dispatch(requestRangeData(id))
  } else {
    dispatch(requestData(id))
  }

  const loadedDataSources = Object.values(
    querySpec.dataSources
  ).filter((dataSource) => sourceHasRequirements(querySpec, dataSource))
  const querySpecsBySource = map(
    scopeQuerySpecToSource(querySpec, id, configSpec, isRangeQuery),
    loadedDataSources
  )

  const sourcesWithColorEffects = {}

  const getTopNForSpec = async (spec) => {
    const colorDimension = spec.dimensions[COLOR_DIMENSION_INDEX]
    const colorDimensionActive = colorDimension && colorDimension.value
    const dirtyPalette =
      colorDimension &&
      configSpec.dirtyPalettes &&
      configSpec.dirtyPalettes[colorDimension.multiSourceIndex]
    const shouldSendPreflight =
      colorDimensionActive &&
      ((sourcesNeedingColorGroupReset &&
        sourcesNeedingColorGroupReset[colorDimension.multiSourceIndex]) ||
        !colorDimension.groups ||
        !dirtyPalette)

    let topN = null

    const msid = colorDimension
      ? colorDimension.multiSourceIndex
      : spec.multiSourceIndex

    const queuedConnector = createQueuedConnector({
      connector: unqueuedConnector,
      dashboardId,
      chartId: isRangeQuery ? id : spec.id,
      keyModifier: `${msid}${isRangeQuery ? "-range" : ""}`,
      tableName: spec.dataSource
    })

    if (shouldSendPreflight) {
      sourcesWithColorEffects[spec.multiSourceIndex] = true
      topN = await makePreflightQuery(spec, queuedConnector).catch((err) =>
        handleQueryErrors(err, dispatch, id)
      )
    } else {
      if (!colorDimensionActive) {
        // Always fire color side effects for multi-y-measure mode
        sourcesWithColorEffects[spec.multiSourceIndex] = true
      }

      topN = colorDimension && colorDimension.groups
    }

    if (topN && Array.isArray(topN)) {
      topN = topN.filter((d) => d !== null)
    }

    return topN
  }

  const getPairsFromQuery = async (sqlQuery, spec, colorDimension) => {
    const msid = colorDimension
      ? colorDimension.multiSourceIndex
      : spec.multiSourceIndex
    const queuedConnector = createQueuedConnector({
      connector: unqueuedConnector,
      dashboardId,
      chartId: isRangeQuery ? id : spec.id,
      keyModifier: `${msid}${isRangeQuery ? "-range" : ""}`,
      tableName: spec.dataSource
    })
    const queryResults = await queuedConnector.queryAsync(
      sqlQuery,
      {}, // no options
      "getPairsFromQuery"
    )
    const data = queryResults
      .filter(keysNotNil)
      .map(
        mapToDefaultDefaultAliases(
          Boolean(colorDimension && colorDimension.showOther)
        )
      )

    const dim = spec.dimensions[0]

    // pairData is whatever's in the query results.
    // ...unless the data is binned, in which case we need to unbin the data first and then use it.
    let pairData = data

    if (dim.isBinned || dim.timeBin) {
      pairData = unbinData(dim, rangeFilter, data, Crossfilter, isRangeQuery)
    }
    return {
      sourceIndex: spec.multiSourceIndex,
      data: pairData
    }
  }

  const pairsPromisesWithGroups = querySpecsBySource.map(async (spec) => {
    const xDimension = getXAxisDimension(spec.dimensions)
    const colorDimension = getColorDimension(spec.dimensions)
    const sourcePaletteIsDirty =
      configSpec.dirtyPalettes &&
      configSpec.dirtyPalettes[spec.multiSourceIndex]
    const groups = await (sourcePaletteIsDirty
      ? Promise.resolve(
          configSpec.palette
            .filter((c) => c.multiSourceIndex === spec.multiSourceIndex)
            .map((c) => c.key)
        )
      : getTopNForSpec(spec))

    let sqlSpec = {
      ...spec,
      showOther: Boolean(colorDimension && colorDimension.showOther),
      groups
    }

    if (isRangeQuery) {
      const dimensions = [
        { ...xDimension, timeBin: "auto" },
        { ...colorDimension }
      ]

      sqlSpec = {
        ...sqlSpec,
        dimensions
      }
    }

    return {
      groups,
      orderedData: await getPairsFromQuery(
        genLineSQL(sqlSpec),
        spec,
        colorDimension
      )
    }
  })

  const pairsWithGroups = await Promise.all(pairsPromisesWithGroups).catch(
    (error) => {
      // eslint-disable-next-line no-console
      console.error(error)
      dispatch(receiveError(error, id))
    }
  )
  const groupSets = pairsWithGroups.map((d) => d.groups)
  const data = pairsWithGroups.reduce(
    (result, d) => ({
      ...result,
      [d.orderedData.sourceIndex]: d.orderedData.data
    }),
    {}
  )
  if (isRangeQuery) {
    dispatch(receiveRangeData(data, id))
  } else {
    loadedDataSources.forEach(({ index: multiSourceIndex }, idx) => {
      if (sourcesWithColorEffects[multiSourceIndex]) {
        colorSideEffects(
          id,
          groupSets[idx],
          querySpecsBySource[idx],
          configSpec,
          dispatch,
          isMulti ? multiSourceIndex : undefined
        )
      }
    })
    dispatch(receiveData(data, id))
  }
}

export function fetchData(
  querySpec,
  configSpec,
  id,
  isMulti,
  sourcesNeedingColorGroupReset
) {
  return (dispatch, getState, services) => {
    const isRangeQuery = false
    const rangeFilter = getState().charts[id].rangeFilter
    const dashboardId = getState().dashboard.id

    query(
      querySpec,
      configSpec,
      id,
      isRangeQuery,
      rangeFilter,
      services,
      dispatch,
      isMulti,
      dashboardId,
      sourcesNeedingColorGroupReset
    )
  }
}

export function fetchRangeData(querySpec, configSpec, id, isMulti) {
  return (dispatch, getState, services) => {
    const isRangeQuery = true
    const rangeFilter = getState().charts[id].rangeFilter
    const dashboardId = getState().dashboard.id

    query(
      querySpec,
      configSpec,
      id,
      isRangeQuery,
      rangeFilter,
      services,
      dispatch,
      isMulti,
      dashboardId
    )
  }
}

export function getFilteredBinExtentAndSetFilterString(
  chartId,
  multiSourceIndex,
  filterString
) {
  return async (dispatch, getState, services) => {
    // user set domain/binExtent, so only update filter
    if (!getState().charts[chartId].elasticX) {
      return dispatch(
        setChartFilterString(chartId, multiSourceIndex, filterString)
      )
    }

    const unqueuedConnector = services.get("DbCon")
    const dashboardId = getState().dashboard.id

    const crossfilter = services.get("crossfilter")
    const chart = getState().charts[chartId]
    const chartDataSource = getDataSource(chart, multiSourceIndex)

    const queuedConnector = createQueuedConnector({
      connector: unqueuedConnector,
      dashboardId,
      chartId,
      keyModifier: multiSourceIndex,
      tableName: chartDataSource
    })

    // get new domain/binExtent with filters applied
    const xDim = getXAxisDimension(chart.dimensions, multiSourceIndex)
    const [{ min_val, max_val }] = await queuedConnector.queryAsync(
      genMinMaxSQL({
        dimension: xDim,
        dataSource: chartDataSource,
        filterString,
        globalFilterString: crossfilter
          .getCrossfilter(chartDataSource, chartId)
          .getGlobalFilterString()
      }),
      {}, // no options
      "genMinMaxSQL"
    )

    const extent =
      min_val !== null && max_val !== null
        ? [min_val, max_val]
        : [xDim.min_val, xDim.max_val]

    // filter & binExtent as a single update to prevent multiple renders
    return dispatch({
      type: SET_CHART_BIN_EXTENT_AND_FILTER_STRING_MULTISOURCE,
      chartId,
      multiSourceIndex,
      extent,
      filter: filterString
    })
  }
}
