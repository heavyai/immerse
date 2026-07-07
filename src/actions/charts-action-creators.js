// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as GeoHeatActions from "charts/raster-chart/geoheat-actions"
import * as LineChartActions from "charts/line/line-chart-action-creators"
import * as Line2ChartActions from "charts/combo/line-chart2/line2-action-creators"
import * as RasterChartActions from "charts/raster-chart/raster-chart-actions"

import {
  addMeasure,
  getCardinality,
  setDimensionBinning,
  setSelectorError,
  updateSelectorAction
} from "actions/selector-action-creators"
import { redrawAll, resetSpecificDCState } from "actions/dc-action-creators"
import { CHART_TYPES, CHARTS, Y_AXIS_ORIENTATIONS } from "constants/charts"
import {
  HEAT_DIMENSION_X_AXIS_NAME,
  HEAT_DIMENSION_Y_AXIS_NAME
} from "charts/heat/constants"
import { clone, isNil, path } from "ramda"
import { mergeR } from "utils/ramda-helpers"
import pushid from "pushid"
import { cloneDeep, isEqual } from "lodash"
import {
  firstSelectorIndexInSource,
  forEachSelectorInSource,
  getColorDimensionIndex,
  getDataSource,
  getSelectorsForSource,
  isChartMultiSource,
  isColorDimension
} from "reducers/charts/helpers/multi-source-helpers"
import { autoFormatter } from "import-shims/heavyai-d3-combo-chart"
import {
  isRasterChart,
  isRasterChartButNotGeoheat,
  isDeckGLButNotGeoheat,
  isRasterPointChart
} from "charts/raster-chart/raster-utils"
import { newChartIndex } from "utils/add-chart-helpers"
import { copyAnnotations } from "actions/annotation-action-creators"
import { updateDashboardSaveState } from "actions/dashboard-save-state-action-creators"
import {
  addChart,
  updateLayout
} from "actions/dashboard-layout-action-creators"
import { batch } from "react-redux"

import {
  setChartSpecificBinFilters,
  setFilterX
} from "vega/actions/filter-action-creators-crossfilter-interop"
import { removeFilterFromFilterSet } from "components/new-filters/filter-sets-action-creators"
import { removeChartFromParameterUsage } from "components/parameters/actions/parameter-usage-action-creators"
import * as ActionTypes from "../constants/action-types"
import { deleteAnnotationsForChart } from "../actions/annotation-action-creators"
import { isOldFilter } from "vega/constants/filter-metadata-types"
import {
  clearAllChartFilters,
  doRedrawAll,
  setChartFilter,
  setCrossFilter,
  setQuickFilterOption,
  toggleQuickFilterVisibility
} from "vega/actions/filter-action-creators"
import {
  getDataSourcesForFilter,
  isFocusChartFilterName,
  isRangeChartFilterName
} from "vega/utils/filter"
import { getLayoutWithDuplicatedChart } from "utils/chart-duplication"
import { updateChart } from "actions/update-chart-action-creator"
import { NUMERICAL_AND_TIME_TYPES as BINABLE_TYPES } from "constants/data-types"
import { setAppError } from "actions/app-action-creators"
import { MINMAX_TOKEN } from "utils/ImmerseSQLPlusPlus/trackable-tokens"
import { duplicateChartAddon } from "chart-addons/chart-addon-action-creators"
import { isCrossSectionType } from "charts/raster-chart/cross-section/utils/is-cross-section-type"
import { setChartZoom } from "actions/map-charts-filter-action-creators"
import {
  isD3ChartWithCustomDomainRange,
  resetD3ChartDomainRange,
  isD3ChartWithCategoricalColoring,
  resetD3ChartMappingDomainRange
} from "reducers/charts/helpers/color-helpers"
import {
  removeCustomDomainRange,
  removeColorByDimension
} from "actions/charts-color-action-creators"
import { immerseAutoFormatter } from "utils/auto-formatter"

export function createChart(chartId, dataSource, defaults) {
  return {
    type: ActionTypes.CREATE_CHART,
    chartId,
    dataSource,
    defaults
  }
}

export function resetChartState(
  chartId,
  savedChartState,
  currentChartState = {}
) {
  return async function resetChartStateThunk(dispatch, getState, services) {
    const { filters, areFiltersInverse, type } = savedChartState
    const dcFlag =
      currentChartState.dcFlag !== savedChartState.dcFlag &&
      savedChartState.dcFlag
        ? savedChartState.dcFlag
        : currentChartState.dcFlag
    const dcChart = services.get("dc").getChart(dcFlag)

    if ([CHART_TYPES.LINE, CHART_TYPES.HISTOGRAM].includes(type)) {
      dispatch(LineChartActions.resetLineChart(chartId, savedChartState))
      return
    } else if (type === CHART_TYPES.HEAT && dcChart) {
      const xDim = savedChartState.dimensions.find(
        (d) => d.name === HEAT_DIMENSION_X_AXIS_NAME
      )
      const yDim = savedChartState.dimensions.find(
        (d) => d.name === HEAT_DIMENSION_Y_AXIS_NAME
      )
      dcChart.x().domain([xDim.currentLowValue, xDim.currentHighValue])
      dcChart.y().domain([yDim.currentLowValue, yDim.currentHighValue])
      if (savedChartState.hasOwnProperty("elasticX")) {
        dcChart.elasticY(savedChartState.elasticX)
      }
      if (savedChartState.hasOwnProperty("elasticY")) {
        dcChart.elasticY(savedChartState.elasticY)
      }
      dcChart.renderAsync()
    } else if (isRasterChart(type)) {
      dispatch(setChartZoom(chartId, savedChartState.mapZoomCenter))
      dispatch(
        GeoHeatActions.resetRasterChart(
          chartId,
          savedChartState,
          currentChartState
        )
      )
      return
    }

    if (dcChart) {
      /**
       * So, ideally we'd just clear all current filters then set the filters
       * we have saved. Our cascade of crossfilter handlers
       * ends up fires off multiple DELETE_FILTER_CROSSFILTER actions when we
       * hit a state with no crossfilters--some landing after we set our
       * replacement filters. This just skirts around the issue by avoiding
       * hitting that no-filter state, carefully adding the filters we want
       * before removing the rest.
       */
      const filtersToRemove = dcChart
        .filters()
        .filter((f) => !filters.some((savedFilter) => isEqual(f, savedFilter)))
      const filtersToAdd = filters.filter(
        (f) =>
          !dcChart.filters().some((appliedFilter) => isEqual(f, appliedFilter))
      )
      const currentFiltersInverse = dcChart.filtersInverse()

      // Yes, both add and remove do the same thing, but order matters for the
      // sake of the above comment.
      filtersToAdd.forEach((filterValue) => {
        dcChart.filter(filterValue, currentFiltersInverse)
      })

      filtersToRemove.forEach((filterValue) => {
        dcChart.filter(filterValue, currentFiltersInverse)
      })

      dcChart.filtersInverse(areFiltersInverse)

      // if resetting the chart state for categorically colored D3 charts,
      // we need to ensure the customDomain and customRange are also updated
      // to ensure they don't have stale values
      if (isD3ChartWithCategoricalColoring(savedChartState)) {
        const paletteMappingId = savedChartState.color?.paletteMappingId
        if (paletteMappingId) {
          const mapping = getState().sharedSettings.mappings.find(
            (m) => m.id === paletteMappingId
          )
          dcChart.customDomain(mapping.mapping.customDomain)
          dcChart.customRange(mapping.mapping.customRange)
          dcChart.colorMappingDomain(mapping.mapping.customDomain)
          dcChart.colorMappingRange(mapping.mapping.customRange)
        } else {
          dcChart.customDomain(savedChartState.color.customDomain)
          dcChart.customRange(savedChartState.color.customRange)
          resetD3ChartMappingDomainRange(savedChartState)
        }
      }
    }

    await dispatch(updateChart(chartId, savedChartState))
  }
}

export function updateSagaChart(id, update) {
  return (dispatch, getState) => {
    switch (getState().charts[id].type) {
      case "line":
      case "histogram":
        return dispatch(LineChartActions.updateLineChart(id, update))
      default:
        return dispatch(updateChart(id, update))
    }
  }
}

export function clearCharts() {
  return {
    type: ActionTypes.CLEAR_CHARTS
  }
}

export function removeCountChart(key) {
  return {
    type: ActionTypes.REMOVE_COUNT_CHART,
    key
  }
}

export function setChartHasError(chartId, error) {
  return {
    type: ActionTypes.SET_CHART_HAS_ERROR,
    chartId,
    error
  }
}

// this is a not-quite-working POC. Do NOT use this function yet.
export function toggleChartFilters(chartId, newState) {
  return (dispatch, getState) => {
    const chart = getState().charts[chartId]
    if (newState === undefined) {
      newState = !chart.enabled
    }
    const { filters, disabledFilters } = chart
    if (newState === true) {
      dispatch(
        updateChart(chartId, {
          filters: disabledFilters,
          disabledFilters: [],
          enabled: true
        })
      )
    } else if (newState === false) {
      dispatch(
        updateChart(chartId, {
          filters: [],
          disabledFilters: filters,
          enabled: false
        })
      )
    }
  }
}

export function clearChartFilters(id) {
  return async (dispatch, getState) => {
    const state = getState()

    const chartFilters = state.omnifilters.filter((f) => f.chartId === id) || []
    const filterSets = state.filterZones || []

    for (const filter of chartFilters) {
      for (const filterSet of Object.values(filterSets)) {
        if (filterSet.filters && filterSet.filters.includes(filter.name)) {
          await dispatch(removeFilterFromFilterSet(filterSet.id, filter.name))
        }
      }
    }
    await dispatch({
      type: ActionTypes.CLEAR_CHART_FILTERS,
      id
    })
  }
}

export function clearChartFiltersForAllCharts() {
  return (dispatch, getState, services) => {
    services
      .get("dc")
      .chartRegistry.listAll()
      .forEach((chart) => {
        if (typeof chart.rangeChart === "function" && chart.rangeChart()) {
          chart.rangeChart().filterAll()
        }
        chart.filterAll()
      })
    Object.keys(getState().charts).forEach((chartId) => {
      const chart = getState().charts[chartId]
      // Backend scatter and backend choropleth have additional filter options that need to be reset.
      if (
        [CHART_TYPES.BACKEND_SCATTER, CHART_TYPES.BACKEND_CHOROPLETH].includes(
          chart.type
        )
      ) {
        dispatch(RasterChartActions.clearRasterChartFilters(chartId, false))
      }
    })
    dispatch({
      type: ActionTypes.CLEAR_CHART_FILTERS_FOR_ALL_CHARTS
    })
    dispatch(redrawAll(null, true))
  }
}

export function setChartDCFlag(chartId, dcFlag) {
  return {
    type: ActionTypes.SET_CHART_DC_FLAG,
    chartId,
    dcFlag
  }
}

export function duplicateChart(chartId) {
  return function duplicateChartThunk(dispatch, getState) {
    const {
      dashboard: { chartContainers },
      omnifilters,
      charts
    } = getState()
    const newChartId = newChartIndex(chartContainers)
    const filterTypes = ["CHART", "CROSSFILTER"]
    const chart = charts[chartId]

    const newChartFilters = omnifilters
      .filter((f) => f.chartId === chartId && filterTypes.includes(f.appliesTo))
      .map((f) => {
        let name = pushid()
        if (f.appliesTo === "CROSSFILTER") {
          // vega combo filters must have a specific name
          if (
            isFocusChartFilterName(f.name) ||
            isRangeChartFilterName(f.name)
          ) {
            name = f.name.replace(`-chart${chartId}-`, `-chart${newChartId}-`)
          }
        }
        return {
          ...cloneDeep(f),
          name,
          chartId: newChartId
        }
      })

    batch(async () => {
      await dispatch({
        type: ActionTypes.DUPLICATE_CHART,
        chartId,
        newChartId
      })
      await dispatch(addChart(`${newChartId}`))

      if (chart.addon) {
        await dispatch(duplicateChartAddon(chart.addon, newChartId))
      }

      await dispatch(updateDashboardSaveState(true))
      // Duplication of crossfilters on old charts is done in setFilterX
      await dispatch(setFilterX(`${newChartId}`))
      // Duplicate all other chart level and crossfilters
      newChartFilters
        .filter((f) => !isOldFilter(f))
        .forEach(
          async ({
            filter,
            layerId,
            name,
            enabled,
            quickFilter,
            appliesTo
          }) => {
            if (appliesTo === "CHART") {
              await dispatch(
                setChartFilter(filter, `${newChartId}`, layerId, name, enabled)
              )

              // Copy quick filter options
              await dispatch(
                toggleQuickFilterVisibility(name, quickFilter.visible)
              )
              await Promise.all(
                Object.keys(quickFilter.optionValues || {}).map((option) =>
                  dispatch(setQuickFilterOption(name, option, true))
                )
              )
            } else if (appliesTo === "CROSSFILTER") {
              await dispatch(
                setCrossFilter(filter, `${newChartId}`, layerId, name)
              )
            }
          }
        )
      await dispatch(copyAnnotations(chartId, newChartId))

      // Make sure duplicated charts have the same height / width as the
      // original chart
      const updatedLayout = getLayoutWithDuplicatedChart(
        getState().dashboard.layout,
        chartId,
        String(newChartId)
      )
      await dispatch(updateLayout(updatedLayout))
    })

    // One last exception for crossfilters on old charts. setFilterX only deals
    // with the new chart, so the original chart needs a redraw.
    const dataSourcesForOldFilters = new Set()
    newChartFilters.forEach((f) => {
      if (isOldFilter(f)) {
        getDataSourcesForFilter(f).forEach((ds) => {
          dataSourcesForOldFilters.add(ds)
        })
      }
    })

    doRedrawAll(dispatch, getState, dataSourcesForOldFilters)
  }
}

function destroy(chart) {
  chart.on("filtered", null)
  chart.filterAll()
  chart.resetSvg()
  chart.destroyChart()
}

export function destroyChart(
  id,
  { dcFlag, dataSource, filters, rangeFilter = [], type, layers },
  validRasterChart = true
) {
  return async function destroyChartThunk(dispatch, getState, services) {
    const dc = services.get("dc")
    const chart = dc.getChart(dcFlag)

    // TODO[C]: may need to look back at this when doing layered contours
    // not sure why geoheat is treated differently than the rest of the rasters
    // seems like we should keep traditional layer code for contour
    if (type === CHART_TYPES.GEOHEAT) {
      dispatch({ type: GeoHeatActions.DESTROY_GEOHEAT, chartId: id })
      return
    }
    if (chart) {
      destroy(chart)
      if (layers && layers.length > 1) {
        // multilayer charts, remove all layers' datasources
        layers.forEach((layer) => {
          dc.chartRegistry.deregister(chart, layer.dataSource)
        })
      } else {
        dc.chartRegistry.deregister(chart, dataSource)
      }
    }
    if (
      filters.length ||
      rangeFilter.length ||
      (isRasterChart(type) && validRasterChart)
    ) {
      await dispatch(clearChartFilters(id))
      if (dc.startRenderTime()) {
        dispatch(redrawAll(dataSource))
      }
    }
  }
}

export function deleteChart(chartId) {
  return async function deleteChartThunk(dispatch, getState) {
    const currentChart = getState().charts[chartId]
    const notRendering = !getState().dc.renderAll.pending
    const currentTab = getState().dashboard.selectedTabId

    if (notRendering && currentChart) {
      dispatch(destroyChart(chartId, currentChart))
      dispatch({ type: ActionTypes.DELETE_CHART, chartId, tabId: currentTab })
      dispatch(clearChartFilters(chartId))
      dispatch(clearAllChartFilters(chartId))
      dispatch(deleteAnnotationsForChart(chartId))
      dispatch(removeChartFromParameterUsage(chartId))
    }
  }
}

export function shouldDestroyWhenRemoving(chart, selector) {
  if (
    selector.type === "dimensions" &&
    !chart.dimensions[selector.index].inactive
  ) {
    return true
  } else if (selector.type === "measures") {
    return selector.index + 1 <= CHARTS[chart.type].minMeasures
  }

  return false
}

function shouldRemoveColorLegendRedrawHook(chart, { type, index }) {
  if (type === "measures" && chart.measures[index].name === "color") {
    return true
  } else {
    return false
  }
}

export function isSortedSelectorSameTypeAsRemovedSelector(type, rootName) {
  return (
    (type === "measures" && rootName === "col") ||
    (type === "dimensions" && rootName === "key")
  )
}

export function resetDCErrorState() {
  return (dispatch, getState) => {
    const { render, redraw } = getState().dc
    if (render.error) {
      dispatch(resetSpecificDCState("render"))
    } else if (redraw.error) {
      dispatch(resetSpecificDCState("redraw"))
    }
  }
}

const removeSelectorFromTable = (
  dispatch,
  chart,
  chartId,
  dcChart,
  selector
) => {
  const { dimensions, sortColumn } = chart
  const { index, type } = selector

  if (dcChart) {
    const shouldRemoveSorting =
      (type === "measures" &&
        chart.measures[index].name === sortColumn.col.name) ||
      (type === "dimensions" && index === sortColumn.index) ||
      dimensions.length <= 2

    const shouldOffsetSorting =
      (type === "measures" && index + dimensions.length <= sortColumn.index) ||
      (type === "dimensions" && index <= sortColumn.index)

    if (shouldRemoveSorting) {
      dcChart.sortColumn(null)
      dispatch(updateChart(chartId, { sortColumn: null }))
    } else if (shouldOffsetSorting) {
      const newSort = clone(sortColumn)

      newSort.index = newSort.index - 1

      const rootName = newSort.col.name.replace(/[0-9]/g, "")

      if (isSortedSelectorSameTypeAsRemovedSelector(type, rootName)) {
        const nameIndex = Number(newSort.col.name.replace(/[a-zA-Z]/g, "") - 1)
        newSort.col.name = `${rootName}${nameIndex}`
      }

      dcChart.sortColumn(newSort)
      dispatch(updateChart(chartId, { sortColumn: newSort }))
    }
  }
}

// The number of measures (*before* removing the one currently being removed)
// at which the color dimension can be re-enabled, because the only two
// remaining afterwards will be one active measure and the +Add button measure
const MIN_MEASURES = 3

export function removeSelector(chartId, selector) {
  return function removeSelectorThunk(dispatch, getState, services) {
    /* eslint complexity: ["error", 36] */ // this function is too complex. Sorry.
    const chart = getState().charts[chartId]

    if (chart.type === CHART_TYPES.LINE2) {
      const measures = chart.measures
      const selectorState = chart[selector.type][selector.index]
      const chartIsMultiSource = isChartMultiSource(chart)

      if (selector.type === "dimensions" && isColorDimension(selectorState)) {
        forEachSelectorInSource(
          (measure, index) => {
            dispatch(Line2ChartActions.enableLineChartMeasure(chartId, index))
          },
          measures,
          selectorState.multiSourceIndex
        )
      } else if (selector.type === "measures") {
        dispatch(Line2ChartActions.removeMarkType(chartId, selector.index))

        if (chartIsMultiSource) {
          const multiSourceIndex = selectorState.multiSourceIndex
          const numMeasures = getSelectorsForSource(measures, multiSourceIndex)
            .length

          if (numMeasures <= MIN_MEASURES) {
            dispatch(
              Line2ChartActions.enableLineChartColorDimensionMultiSource(
                chartId,
                multiSourceIndex
              )
            )
          }
        } else {
          dispatch(Line2ChartActions.clearAxisLabels(chartId))

          if (measures.length <= MIN_MEASURES) {
            dispatch(Line2ChartActions.enableLineChartDimension(chartId, 1))
          }
        }
      }
    }

    if (
      isRasterChartButNotGeoheat(chart.type) &&
      chart.type !== CHART_TYPES.CONTOUR
    ) {
      const selectorState = chart[selector.type][selector.index]
      if (selector.type === "dimensions") {
        if (
          selector.index < 1 &&
          isRasterPointChart(chart.type) &&
          chart.postFilters
        ) {
          // postFilter is only linked to the first dimension
          dispatch(
            RasterChartActions.removeRasterChartPostFilter(
              chartId,
              selector.index
            )
          )
        }

        dispatch(
          RasterChartActions.removeRasterChartDimension(chartId, selector.index)
        )
        // Remove the Geo measure since the join has been removed
        const join_table = path(["geoJoin", "table"], chart)
        const measure_table = path(["measures", 0, "table"], chart)
        if (join_table && measure_table && join_table === measure_table) {
          dispatch(RasterChartActions.removeRasterChartMeasure(chartId, 0))
        }
        // Pointmap is the only Raster chat with discrete lon/lat measures,
        // so make sure to clear them both if one is being removed

        dispatch(
          RasterChartActions.removeDimensionPopupColumns(chartId, selectorState)
        )
      } else if (
        selector.type === "measures" &&
        chart.type === "pointmap" &&
        selector.index < 2 &&
        selector.dataType === "POINT"
      ) {
        dispatch(RasterChartActions.removeRasterChartMeasure(chartId, 0))
        dispatch(RasterChartActions.removeRasterChartMeasure(chartId, 1))
        dispatch(RasterChartActions.clearRasterMapZoomCenter(chartId))
      } else if (
        selector.type === "postFilters" &&
        isRasterPointChart(chart.type)
      ) {
        dispatch(
          RasterChartActions.removeRasterChartPostFilter(
            chartId,
            selector.index
          )
        )
      } else {
        dispatch(
          RasterChartActions.removeRasterChartMeasure(chartId, selector.index)
        )

        // When Raster chart measure is removed, we remove the measure from the popup columns if it is still there
        dispatch(RasterChartActions.removePopupColumn(chartId, selectorState))
      }
      return
    } else if (
      isDeckGLButNotGeoheat(chart.type) &&
      selector.type === "dimensions"
    ) {
      const selectorState = chart[selector.type][selector.index]
      dispatch(
        RasterChartActions.removeDimensionPopupColumns(chartId, selectorState)
      )
    } else if ([CHART_TYPES.LINE, CHART_TYPES.HISTOGRAM].includes(chart.type)) {
      if (selector.type === "dimensions") {
        dispatch(
          LineChartActions.removeLineChartDimension(chartId, selector.index)
        )
      } else {
        dispatch(
          LineChartActions.removeLineChartMeasure(chartId, selector.index)
        )
      }
      if (chart.type === "histogram" || selector.type === "dimensions") {
        return
      }
    }

    if (chart.type === "table" && chart.sortColumn) {
      const dcChart = services.get("dc").getChart(chart.dcFlag)
      removeSelectorFromTable(dispatch, chart, chartId, dcChart, selector)
    }

    if ([CHART_TYPES.GEOHEAT, CHART_TYPES.CONTOUR].includes(chart.type)) {
      dispatch({ type: GeoHeatActions.DESTROY_GEOHEAT, chartId })
    } else if (shouldDestroyWhenRemoving(chart, selector)) {
      dispatch(removeChartFromParameterUsage(chartId))
      dispatch(destroyChart(chartId, chart))
    }

    if (shouldRemoveColorLegendRedrawHook(chart, selector)) {
      const dcChart = services.get("dc").getChart(chart.dcFlag)
      if (dcChart) {
        dcChart.on("preRender.color", null)
        dcChart.on("preRedraw.color", null)
      }
    }

    if (isD3ChartWithCustomDomainRange(chart)) {
      dispatch(removeCustomDomainRange(chartId))
      dispatch(removeColorByDimension(chartId))
      resetD3ChartDomainRange(chart)
    }

    dispatch({
      type: ActionTypes.REMOVE_SELECTOR,
      chartId,
      selectorType: selector.type,
      selectorIndex: selector.index
    })

    dispatch(resetDCErrorState())
  }
}

export function clearSelector(chartId, selector) {
  return function clearSelectorThunk(dispatch, getState) {
    const chart = getState().charts[chartId]
    if (shouldDestroyWhenRemoving(chart, selector)) {
      dispatch(destroyChart(chartId, chart))
    }

    dispatch({
      type: ActionTypes.CLEAR_SELECTOR,
      chartId,
      selectorType: selector.type,
      selectorIndex: selector.index
    })
  }
}

export const setDcChartAxisDomain = (chartId, axisType, minMax) => (dispatch) =>
  dispatch({
    type: ActionTypes.SET_DC_CHART_AXIS_DOMAIN,
    chartId,
    axisType,
    minMax
  })

export function updateSelector(chartId, selectorType, selectorIndex, setter) {
  return (dispatch, getState) => {
    if (selectorType === "dimensions") {
      dispatch(clearChartFilters(chartId))
    }

    const chart = getState().charts[chartId]

    if ([CHART_TYPES.LINE, CHART_TYPES.HISTOGRAM].includes(chart.type)) {
      if (selectorType === "dimensions") {
        dispatch(
          LineChartActions.updateDimension({
            id: chartId,
            index: selectorIndex,
            setter
          })
        )
      } else {
        dispatch(
          LineChartActions.updateMeasure({
            id: chartId,
            index: selectorIndex,
            setter
          })
        )
      }
      return
    }

    if (isD3ChartWithCustomDomainRange(chart)) {
      resetD3ChartDomainRange(chart)
    }
    dispatch(updateSelectorAction(chartId, selectorType, selectorIndex, setter))

    if (
      selectorType === "measures" &&
      getState().charts[chartId].measures[selectorIndex].name === "color"
    ) {
      dispatch(updateChart(chartId, { colorDomain: null }))
    }
  }
}

function shouldDestroyWhenAdding(chartType, selectorType) {
  if (selectorType === "dimensions") {
    return !isRasterChart(chartType)
  } else {
    return chartType === "number"
  }
}

export function addSelector(type) {
  return (chartId, chartType, index, selector, multiSourceIndex) => (
    dispatch,
    getState,
    services
  ) => {
    dispatch(resetDCErrorState())
    selector.axisLabel = null
    const chart = getState().charts[chartId]
    // Bail out for vega-pointmap to avoid other selector logic, just grab min/max
    if (type === "measures" && chartType === "vega-pointmap") {
      services
        .get("crossfilter")
        .getCrossfilter(selector.table)
        .getMinMax(selector.value)
        .then((minMax) => {
          dispatch(
            addMeasure(chartId, index, {
              ...selector,
              minMax
            })
          )
        })
      return
    }

    if (type === "measures" && isRasterChartButNotGeoheat(chart.type)) {
      dispatch(
        RasterChartActions.setRasterChartMeasure(chartId, selector, index)
      )
      return
    } else if (type === "terrainMeasure") {
      dispatch(
        RasterChartActions.setTerrainLinespecMeasure(
          chartId,
          multiSourceIndex,
          selector,
          index
        )
      )
      return
    } else if (
      type === "postFilters" &&
      (isRasterPointChart(chartType) || isCrossSectionType(chartType))
    ) {
      dispatch(
        RasterChartActions.setRasterChartPostFilter(chartId, selector, index)
      )
    }

    if (!isNil(multiSourceIndex)) {
      selector.multiSourceIndex = multiSourceIndex
    }

    // To do: this was suppose to fix switching between numerical and date dimension (see 0294974)
    // but it prevents number chart from reapplying the format on measure change
    // and it prevents persisting the format across switching
    // Let's see if we can repro 0294974 before erasing it
    // if (type === "measures") {
    //   dispatch(Line2ChartActions.changeMeasureFormat(chartId, index, null))
    // } else if (type === "dimensions") {
    //   dispatch(Line2ChartActions.changeDimensionFormat(chartId, index, null))
    // }

    if ([CHART_TYPES.LINE, CHART_TYPES.HISTOGRAM].includes(chartType)) {
      if (type === "measures") {
        dispatch(LineChartActions.setLineChartMeasure(chartId, selector, index))
        return
      } else {
        if (index === 1) {
          dispatch(
            LineChartActions.setLineChartSeriesDimension(chartId, selector)
          )
        } else {
          dispatch(
            LineChartActions.setLineChartDimension(chartId, selector, index)
          )
        }
        return
      }
    }

    if (shouldDestroyWhenAdding(chart.type, type)) {
      dispatch(destroyChart(chartId, chart))
    }

    if (type === "dimensions") {
      // need to wait all chained logic in addDimension to complete such as min_val/max_val to set in dimension
      if (chartType === CHART_TYPES.HEAT) {
        selector = {
          ...selector,
          newHeatMapDimension: true
        }
      }
      dispatch(
        addDimension(chartId, chartType, index, selector, multiSourceIndex)
      )
        .then(() => dispatch(setChartSpecificBinFilters(chartId)))
        .then(() => {
          // Post ADD_DIMENSION actions
          const newlyAddedDimension = chart.dimensions[index]
          if ([CHART_TYPES.GEOHEAT, CHART_TYPES.CONTOUR].includes(chartType)) {
            const actionType =
              chartType === CHART_TYPES.GEOHEAT
                ? "SET_GEOHEAT_DIMENSION"
                : "SET_CONTOUR_DIMENSION"
            dispatch({
              type: actionType,
              index,
              chartId
            })

            if (selector.type === "POINT") {
              const otherIndex = index === 0 ? 1 : 0

              dispatch(
                addDimension(
                  chartId,
                  chartType,
                  otherIndex,
                  selector,
                  multiSourceIndex
                )
              )
              dispatch({
                type: actionType,
                index: otherIndex,
                chartId
              })
            }
          } else if (
            isRasterChartButNotGeoheat(chart.type) &&
            chart.type !== CHART_TYPES.CONTOUR
          ) {
            dispatch(RasterChartActions.setRasterChartDimension(chartId))

            // as soon as a new dimension selected for raster chart, we replace
            // hoverSelectedColumns with dimensions and measures
            dispatch(RasterChartActions.setDimensionPopupColumns(chartId))
          } else if (isDeckGLButNotGeoheat(chart.type)) {
            // as soon as a new dimension selected for raster chart, we replace
            // hoverSelectedColumns with dimensions and measures
            dispatch(RasterChartActions.setDimensionPopupColumns(chartId))
          } else if (
            chartType === CHART_TYPES.LINE2 &&
            !isColorDimension(newlyAddedDimension)
          ) {
            // reset x-domain locks for all sources when we're modifying a non-color dimension
            dispatch(Line2ChartActions.clearXAxisDomainLocks(chartId))
          }
        })
    } else {
      // Measure
      if (chartType === CHART_TYPES.LINE2) {
        dispatch(
          addMeasure(chartId, index, {
            ...selector,
            categories: null,
            multiSourceIndex
          })
        )
        dispatch(Line2ChartActions.setMarkType(chartId, index, "line"))
        dispatch(
          Line2ChartActions.toggleYAxisOrientation(
            chartId,
            index,
            multiSourceIndex === 1
              ? Y_AXIS_ORIENTATIONS.RIGHT
              : Y_AXIS_ORIENTATIONS.LEFT
          )
        )

        const firstMeasureIndex = firstSelectorIndexInSource(
          chart.measures,
          multiSourceIndex
        )

        // disable color dim when we're setting a new y axis measure above the first measure index for this source -
        // meaning there will be two or more y axis measures, and a color dimension is invalid
        if (index > firstMeasureIndex) {
          const colorIndex = getColorDimensionIndex(
            chart.dimensions,
            multiSourceIndex
          )

          dispatch(
            Line2ChartActions.disableLineChartDimension(chartId, colorIndex)
          )
        }

        dispatch(Line2ChartActions.clearAxisLabels(chartId))
        dispatch(Line2ChartActions.clearXAxisDomainLocks(chartId))
      } else if (type !== "postFilters") {
        dispatch(
          addMeasure(
            chartId,
            index,
            Object.assign({}, selector, {
              minMax: null,
              categories: null
            })
          )
        )
      }

      // Post ADD_MEASURE actions
      if (chartType === CHART_TYPES.GEOHEAT) {
        dispatch({
          type: "SET_GEOHEAT_MEASURE",
          index,
          chartId
        })

        if (selector.type === "POINT") {
          const otherIndex = index === 0 ? 1 : 0

          dispatch(
            addDimension(
              chartId,
              chartType,
              otherIndex,
              selector,
              multiSourceIndex
            )
          )
          dispatch({
            type: "SET_GEOHEAT_DIMENSION",
            otherIndex,
            chartId
          })
        }
      }

      // TODO[C]: Something may need to happen here to solve cardinality query, but
      // the following also breaks if additional measures are added
      // if (
      //   isD3ChartWithCustomDomainRange(chartType) &&
      //   chart?.dimensions?.length > 0
      // ) {
      //   dispatch(
      //     updateChart(chartId, {
      //       color: {
      //         ...chart.color,
      //         column: chart.dimensions[0].label
      //       }
      //     })
      //   )
      // }
    }
  }
}

export const getChartBinningConfig = (chart) =>
  chart.dimensions.reduce(
    (config, d) => ({
      extract: Boolean(config.extract || d.extract),
      timeBin: d.timeBin || config.timeBin
    }),
    {
      extract: false,
      timeBin: "auto"
    }
  )

export const updateDimensionsBinningOrExtractStates = (
  chart,
  chartId,
  dispatch
) => {
  const binningConfig = getChartBinningConfig(chart)
  if (binningConfig.extract) {
    dispatch(Line2ChartActions.setExtract(chartId, binningConfig.timeBin))
  } else {
    dispatch(Line2ChartActions.setBinning(chartId, binningConfig.timeBin))
  }
}

export function getDimensionBinning(
  chartId,
  chartType,
  index,
  dimension,
  multiSourceIndex
) {
  return (dispatch, getState, services) => {
    if (BINABLE_TYPES[dimension.type]) {
      const chart = getState().charts[chartId]
      const table = getDataSource(chart, multiSourceIndex)

      return Promise.all([
        services
          .get("crossfilter")
          .getCrossfilter(table, chartId)
          .getMinMax(
            dimension.value,
            { min: "min_val", max: "max_val" },
            { token: `${MINMAX_TOKEN}/binning/${index}/${multiSourceIndex}` }
          ),
        getCardinality(
          dimension.value,
          table,
          getState(),
          `cardinality/binning/${index}/${multiSourceIndex}`
        )
      ])
        .then(([bounds, cardinality]) => {
          return dispatch(
            setDimensionBinning(
              chartId,
              chartType,
              index,
              dimension,
              bounds,
              cardinality,
              chart.elasticX,
              chart.elasticY
            )
          )
        })
        .catch((error) => {
          dispatch(setAppError(ActionTypes.CHART_RENDER_ERROR, error))
          dispatch({
            type: ActionTypes.ADD_DIMENSION,
            index,
            chartId,
            dimension: Object.assign({}, dimension, {
              isError: true,
              isBinned: false
            }),
            multiSourceIndex
          })
          dispatch(
            updateSelector(
              chartId,
              "dimensions",
              index,
              mergeR({ loading: false })
            )
          )
          dispatch(setSelectorError(chartId, { index, type: "dimensions" }))
        })
    } else {
      return Promise.resolve()
    }
  }
}

export function addDimension(
  chartId,
  chartType,
  index,
  dimension,
  multiSourceIndex
) {
  return (dispatch, getState) => {
    const chart = getState().charts[chartId]
    if ([CHART_TYPES.GEOHEAT, CHART_TYPES.CONTOUR].includes(chartType)) {
      return Promise.resolve(
        dispatch({
          type: ActionTypes.ADD_DIMENSION,
          index,
          chartId,
          dimension,
          multiSourceIndex
        })
      )
    } else {
      if (!chart.hasError) {
        dispatch(updateChart(chartId, { loading: true }))
      }

      dispatch({
        type: ActionTypes.ADD_DIMENSION,
        index,
        chartId,
        dimension,
        multiSourceIndex
      })

      if (chartType === CHART_TYPES.LINE2 && dimension.type === "TIMESTAMP") {
        updateDimensionsBinningOrExtractStates(chart, chartId, dispatch)
      }

      return dispatch(
        getDimensionBinning(
          chartId,
          chartType,
          index,
          dimension,
          multiSourceIndex
        )
      )
    }
  }
}

export function updateTimeBinInputVal(chartId, index, timeBinInputVal) {
  return function updateTimeBinInputValThunk(dispatch, getState, services) {
    const prevChartSpec = getState().charts[chartId]

    if (prevChartSpec.type === CHART_TYPES.LINE2) {
      dispatch(Line2ChartActions.setBinning(chartId, timeBinInputVal))
      return
    }

    const updateTimeBinFunc = (a) =>
      Object.assign({}, a, {
        timeBin: timeBinInputVal,
        extract: false,
        auto: false
      })

    if (
      [CHART_TYPES.LINE, CHART_TYPES.HISTOGRAM].includes(prevChartSpec.type)
    ) {
      dispatch(
        LineChartActions.updateDateTruncInterval(chartId, timeBinInputVal)
      )
    } else if (prevChartSpec.dimensions[0].extract) {
      dispatch(updateSelector(chartId, "dimensions", index, updateTimeBinFunc))
    } else {
      dispatch(
        updateSelectorAction(chartId, "dimensions", index, updateTimeBinFunc)
      )
      const dc = services.get("dc")
      const newChartSpec = getState().charts[chartId]
      const dcFlag = newChartSpec.dcFlag
      const dcChart = dc.getChart(dcFlag)
      if (dcChart) {
        const newBinParams = updateTimeBinFunc(dcChart.binParams()[index])
        dcChart.binParams(newBinParams)
      }
    }
  }
}

export function updateBinBoundsVal(chartId, index, bounds) {
  const updateBoundsFunc = mergeR({
    currentHighValue: bounds[1],
    currentLowValue: bounds[0]
  })
  return updateSelectorAction(chartId, "dimensions", index, updateBoundsFunc)
}

export function updateExtractInterval(chartId, index, timeBinInputVal) {
  return function updateExtractIntervalThunk(dispatch, getState) {
    const prevChartSpec = getState().charts[chartId]

    if (prevChartSpec.type === CHART_TYPES.LINE2) {
      dispatch(Line2ChartActions.setExtract(chartId, timeBinInputVal))
      return
    }
    if (
      prevChartSpec.type === CHART_TYPES.LINE ||
      prevChartSpec.type === CHART_TYPES.HISTOGRAM
    ) {
      dispatch(LineChartActions.updateExtractInterval(chartId, timeBinInputVal))
    } else {
      dispatch(
        updateSelector(
          chartId,
          "dimensions",
          index,
          mergeR({ timeBin: timeBinInputVal, extract: true })
        )
      )
    }
  }
}

export function addCustomColor(chartId, value) {
  return (dispatch, getState) => {
    const chart = getState().charts[chartId]
    const savedPaletteMapping = getState().sharedSettings.mappings.find(
      (m) => m.id === chart.color.paletteMappingId
    )

    dispatch({
      type: ActionTypes.ADD_CUSTOM_COLOR,
      chartId,
      value,
      savedPaletteMapping
    })
  }
}

export function addCustomColorMultiSource(chartId, value, multiSourceIndex) {
  return (dispatch, getState) => {
    const chart = getState().charts[chartId]
    const savedPaletteMapping = getState().sharedSettings.mappings.find(
      (m) => m.id === chart.color[multiSourceIndex].paletteMappingId
    )
    dispatch({
      type: ActionTypes.ADD_CUSTOM_COLOR_MULTI_SOURCE,
      chartId,
      value,
      multiSourceIndex,
      savedPaletteMapping
    })
  }
}

export function removeCustomColor(chartId, index) {
  return (dispatch, getState, services) => {
    const { color, dcFlag, isNotDc, showOther, ...chart } = getState().charts[
      chartId
    ]
    const savedPaletteMapping = getState().sharedSettings.mappings.find(
      (m) => m.id === color.paletteMappingId
    )
    dispatch({
      type: ActionTypes.REMOVE_CUSTOM_COLOR,
      chartId,
      index,
      savedPaletteMapping
    })

    const updatedColor = getState().charts[chartId].color
    const dcChart = services.get("dc").getChart(dcFlag)
    if (isNotDc && updatedColor.customDomain.length === 0) {
      if (showOther) {
        dispatch(toggleOtherMultiSeries(chartId))
      }
      dispatch(removeSelector(chartId, { type: "dimensions", index: 1 }))
    } else if (
      !isNotDc &&
      dcChart.isMulti() &&
      updatedColor.customDomain.length === 0
    ) {
      if (dcChart.showOther && dcChart.showOther()) {
        dispatch(toggleOtherMultiSeries(chartId))
      }
      dispatch(removeSelector(chartId, { type: "dimensions", index: 1 }))
    } else if (isD3ChartWithCustomDomainRange(chart)) {
      dcChart.customDomain(updatedColor.customDomain)
      dcChart.customRange(updatedColor.customRange)
    }
  }
}

export function removeCustomColorMultiSource(chartId, index, multiSourceIndex) {
  return (dispatch, getState) => {
    const state = getState()
    const activeChart = state.charts[chartId]
    const { color, dimensions } = activeChart
    const sourceColorDefinition = color[multiSourceIndex]
    const savedPaletteMapping = getState().sharedSettings.mappings.find(
      (m) => m.id === sourceColorDefinition.paletteMappingId
    )
    dispatch({
      type: ActionTypes.REMOVE_CUSTOM_COLOR_MULTI_SOURCE,
      chartId,
      index,
      multiSourceIndex,
      savedPaletteMapping
    })

    if (sourceColorDefinition.customDomain.length === 0) {
      const colorDimensionIndexForSource = getColorDimensionIndex(
        dimensions,
        multiSourceIndex
      )

      if (dimensions[colorDimensionIndexForSource].showOther) {
        dispatch(toggleOtherMultiSeriesMultiSource(chartId, multiSourceIndex))
      }

      dispatch(
        removeSelector(chartId, {
          type: "dimensions",
          index: colorDimensionIndexForSource
        })
      )
    }
  }
}

export function setCustomColor(chartId, index, value, key, multiSourceIndex) {
  return (dispatch, getState) => {
    const chart = getState().charts[chartId]
    const savedPaletteMapping = getState().sharedSettings.mappings.find(
      (m) => m.id === chart.color.paletteMappingId
    )
    dispatch({
      type: ActionTypes.SET_CUSTOM_COLOR,
      chartId,
      index,
      value,
      key,
      multiSourceIndex,
      savedPaletteMapping
    })
  }
}

export function setCustomDefaultOtherColorValue(
  chartId,
  value,
  key,
  noSave = false
) {
  return (dispatch, getState) => {
    const chart = getState().charts[chartId]
    const savedPaletteMapping = getState().sharedSettings?.mappings?.find(
      (m) => m.id === chart.color.paletteMappingId
    )
    dispatch({
      type: ActionTypes.SET_CUSTOM_DEFAULT_OTHER_COLOR,
      chartId,
      value,
      key,
      noSave,
      savedPaletteMapping
    })
  }
}

export function setCustomDefaultOtherColorValueMultiSource(
  chartId,
  value,
  key,
  multiSourceIndex
) {
  return {
    type: ActionTypes.SET_CUSTOM_DEFAULT_OTHER_COLOR,
    chartId,
    value,
    key,
    multiSourceIndex
  }
}

export function toggleOtherMultiSeries(chartId) {
  return (dispatch, getState, services) => {
    const chart = getState().charts[chartId]
    const { dcFlag, isNotDc } = chart
    const dcChart = services.get("dc").getChart(dcFlag)
    if (isNotDc) {
      dispatch({
        type: ActionTypes.TOGGLE_OTHER,
        chartId
      })
    } else if (dcChart.isMulti()) {
      dcChart.showOther(!dcChart.showOther())
      dispatch({
        type: ActionTypes.TOGGLE_OTHER,
        chartId
      })
    } else if (isRasterChart(chart.type)) {
      dispatch({
        type: ActionTypes.TOGGLE_OTHER_RASTER,
        chartId
      })
    }
  }
}

export function toggleOtherMultiSeriesMultiSource(chartId, multiSourceIndex) {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.TOGGLE_OTHER_MULTI_SOURCE,
      chartId,
      multiSourceIndex
    })
  }
}

export function updateMeasureDomains(chartId, domains) {
  return {
    type: ActionTypes.UPDATE_MEASURE_DOMAINS,
    chartId,
    ...domains
  }
}

export function togglePercentageView(chartId, shouldBeOn) {
  return {
    type: ActionTypes.TOGGLE_PERCENTAGE_VIEW,
    chartId,
    shouldBeOn
  }
}

export function setElasticX(chartId, val) {
  return (dispatch, getState, services) => {
    dispatch({
      type: ActionTypes.SET_ELASTICX,
      chartId,
      value: val
    })
    const { dcFlag, type } = getState().charts[chartId]
    const dcChart = services.get("dc").getChart(dcFlag)
    if (
      [
        CHART_TYPES.HISTOGRAM,
        CHART_TYPES.LINE,
        CHART_TYPES.BACKEND_SCATTER,
        CHART_TYPES.HEAT,
        CHART_TYPES.CROSS_SECTION,
        CHART_TYPES.CROSS_SECTION_TERRAIN
      ].includes(type) &&
      dcChart
    ) {
      dcChart.elasticX(val)
      dcChart.redrawAsync()
      if (dcChart.rangeChartEnabled()) {
        dcChart.rangeChart().elasticX(val)
        dcChart.rangeChart().redrawAsync()
      }
    }
  }
}

export function setElasticY(chartId, val) {
  return (dispatch, getState, services) => {
    dispatch({
      type: ActionTypes.SET_ELASTICY,
      chartId,
      value: val
    })
    const { dcFlag, type } = getState().charts[chartId]
    const dcChart = services.get("dc").getChart(dcFlag)
    if (
      [
        CHART_TYPES.HISTOGRAM,
        CHART_TYPES.LINE,
        CHART_TYPES.BACKEND_SCATTER,
        CHART_TYPES.HEAT,
        CHART_TYPES.CROSS_SECTION,
        CHART_TYPES.CROSS_SECTION_TERRAIN
      ].includes(type) &&
      dcChart
    ) {
      dcChart.elasticY(val)
      dcChart.redrawAsync()
    }
  }
}

export function setValueFormatter(dcChart, measures, type) {
  if (!dcChart) {
    return
  }

  const measureFormats = measures
    .filter((d) => d.numberFormat)
    .map((d) => ({ key: d.label, format: d.numberFormat }))

  // Raster chart popup format is on hoverSelectedColumns, not on measures
  if (dcChart.valueFormatter && !isRasterChartButNotGeoheat(type)) {
    dcChart.valueFormatter(immerseAutoFormatter(measureFormats))
  }

  if (
    [CHART_TYPES.LINE, CHART_TYPES.HISTOGRAM, CHART_TYPES.PIE].includes(type)
  ) {
    dcChart.redrawAsync()
  } else if (
    [
      CHART_TYPES.BACKEND_SCATTER,
      CHART_TYPES.CROSS_SECTION,
      CHART_TYPES.CROSS_SECTION_TERRAIN
    ].includes(type)
  ) {
    if (dcChart.rescale) {
      dcChart.rescale() // To do: Nightwatch doesn't see this function
    }
    if (dcChart.redrawAsync) {
      dcChart.redrawAsync()
    }
  }
}

export function changeMeasureFormat(chartId) {
  return function changeMeasureFormatThunk(dispatch, getState, services) {
    const { dcFlag, type, measures, isNotDc } = getState().charts[chartId]
    const dcChart = services.get("dc").getChart(dcFlag)
    if (!isNotDc) {
      setValueFormatter(dcChart, measures, type)
    }
  }
}

export function setDateFormatter(dcChart, dimensions, type) {
  if (!dcChart) {
    return
  }
  const dimensionFormats = dimensions
    .filter((d) => d.dateFormat)
    .map((d) => ({ key: d.label, format: d.dateFormat }))

  if (dcChart.dateFormatter) {
    dcChart.dateFormatter(autoFormatter(dimensionFormats))
  }

  if (
    [
      CHART_TYPES.LINE,
      CHART_TYPES.HISTOGRAM,
      CHART_TYPES.PIE,
      CHART_TYPES.BACKEND_SCATTER,
      CHART_TYPES.HEAT
    ].includes(type)
  ) {
    if (dcChart.redrawAsync) {
      dcChart.redrawAsync()
    }
  }
}

export function changeDimensionFormat(chartId) {
  return function changeDimensionFormatThunk(dispatch, getState, services) {
    const { dcFlag, type, dimensions, isNotDc } = getState().charts[chartId]
    const dcChart = services.get("dc").getChart(dcFlag)
    if (!isNotDc) {
      setDateFormatter(dcChart, dimensions, type)
    }
  }
}

export function toggleChartLegend(chartId) {
  return {
    type: ActionTypes.TOGGLE_CHART_LEGEND,
    chartId
  }
}

export function highlightCharts(chartIds) {
  return {
    type: ActionTypes.HIGHLIGHT_CHARTS,
    payload: chartIds
  }
}

export function dehighlightCharts(chartIds) {
  return {
    type: ActionTypes.DEHIGHLIGHT_CHARTS,
    payload: chartIds
  }
}

export function toggleQuickFiltersExpanded(chartId) {
  return {
    type: ActionTypes.TOGGLE_QUICK_FILTERS_EXPANDED,
    chartId
  }
}

export const initializeColorRamps = (chartId, colorRamps) => ({
  type: ActionTypes.INITIALIZE_COLOR_RAMPS,
  chartId,
  colorRamps
})

export const updateColorRamps = (chartId, position, newBounds) => {
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.UPDATE_COLOR_RAMPS,
      chartId,
      position,
      newBounds
    })

    const { colorRamps } = getState().charts[chartId]
    dispatch(RasterChartActions.updateRasterChart(chartId, { colorRamps }))
  }
}
