// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { compose, lensIndex, set } from "ramda"
import { isGeo, isQuantitative } from "constants/data-types"
import { mergeR } from "utils/ramda-helpers"
import { updateHideOther } from "actions/charts-color-action-creators"
import { updateChart } from "actions/update-chart-action-creator"
import { setChartZoom } from "actions/map-charts-filter-action-creators"
import { isEmpty } from "lodash"
import { CHART_TYPES } from "constants/charts"
import { customOrdinalColor } from "reducers/charts/helpers/color-helpers"
import {
  isRasterChartButNotGeoheat,
  isRasterPointChart,
  isGeoTypeSupportedRasterChart
} from "charts/raster-chart/raster-utils"
import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"
import { isSelectorUsable } from "../../utils/selector-helpers"
import { getDefaultFormat } from "../../utils/formatter-helper"
import { NUM_RESULTS } from "../../actions/autosuggest-action-creators"
import { removeChartFromParameterUsage } from "components/parameters/actions/parameter-usage-action-creators"
import { valueContainsParameter } from "components/parameters/utils"
import { importableProcess as processSQLParameters } from "utils/ImmerseSQLPlusPlus/parser-importable"
import {
  filterHasChildren,
  isMultiSourceFilter
} from "vega/constants/filter-types"
import { buildFilterBboxQuery } from "vega/charts/raster/raster-query-building"
import {
  MAPBOX_BBOX_PADDING,
  MAPBOX_LON_MIN,
  MAPBOX_LON_MAX,
  MAPBOX_LAT_MIN,
  MAPBOX_LAT_MAX
} from "constants/magic-variables"
import { setLastPaletteMappingId } from "components/shared-settings/palette-mapping-thunks"
import { immerseAutoFormatter } from "utils/auto-formatter"

export const CREATE_RASTER_CHART = "CREATE_RASTER_CHART"
export const UPDATE_RASTER_CHART = "UPDATE_RASTER_CHART"
export const UPDATE_RASTER_CHART_COLOR_PALETTE =
  "UPDATE_RASTER_CHART_COLOR_PALETTE"
export const SET_RASTER_CHART_MEASURE = "SET_RASTER_CHART_MEASURE"
export const SET_RASTER_CHART_POST_FILTER = "SET_RASTER_CHART_POST_FILTER"
export const UPDATE_RASTER_CHART_POST_FILTER = "UPDATE_RASTER_CHART_POST_FILTER"
export const SUBMIT_RASTER_CHART_POST_FILTER = "SUBMIT_RASTER_CHART_POST_FILTER"
export const ADD_RASTER_CHART_MEASURE = "ADD_RASTER_CHART_MEASURE"
export const ADD_RASTER_CHART_POST_FILTER = "ADD_RASTER_CHART_POST_FILTER"
export const UPDATE_RASTER_CHART_MEASURE = "UPDATE_RASTER_CHART_MEASURE"
export const REMOVE_RASTER_CHART_MEASURE = "REMOVE_RASTER_CHART_MEASURE"
export const REMOVE_RASTER_CHART_POST_FILTER = "REMOVE_RASTER_CHART_POST_FILTER"
export const UPDATE_MEASURES_DOMAINS = "UPDATE_MEASURES_DOMAINS"
export const UPDATE_DENSITY_ACCUMULATOR = "UPDATE_DENSITY_ACCUMULATOR"
export const UPDATE_CHART_LAYER = "UPDATE_CHART_LAYER"
export const UPDATE_COLOR_LEGEND = "UPDATE_COLOR_LEGEND"
export const CLEAR_RASTER_MAP_ZOOM_CENTER = "CLEAR_RASTER_MAP_ZOOM_CENTER"
export const CLEAR_RASTER_CHART_FILTERS = "CLEAR_RASTER_CHART_FILTERS"
export const UPDATE_GEO_JOIN_COLUMN = "UPDATE_GEO_JOIN_COLUMN"
export const REMOVE_GEO_JOIN_DATA_SOURCE = "REMOVE_GEO_JOIN_DATA_SOURCE"
export const SET_LAYER_OPACITY = "SET_LAYER_OPACITY"
export const SET_LAYER_LABEL = "SET_LAYER_LABEL"
export const SET_SINGLE_LAYER_OPACITY = "SET_SINGLE_LAYER_OPACITY"
export const SET_LAYERS_VISIBILITY = "SET_LAYERS_VISIBILITY"
export const SET_LAYER_ZOOM_THRESHOLD = "SET_LAYER_ZOOM_THRESHOLD"
export const REMOVE_RASTER_CHART_DIMENSION = "REMOVE_RASTER_CHART_DIMENSION"
export const SET_RASTER_CHART_DIMENSION = "SET_RASTER_CHART_DIMENSION"
export const SET_TERRAIN_LINESPEC_MEASURE = "SET_TERRAIN_LINESPEC_MEASURE"

export const COMBINE_RASTER_LAYERS = "COMBINE_RASTER_LAYERS"
export const SAVE_CURRENT_RASTER_LAYER = "SAVE_CURRENT_RASTER_LAYER"
export const SET_RASTER_LAYER_ID = "SET_RASTER_LAYER_ID"
export const SET_RASTER_LAYER = "SET_RASTER_LAYER"
export const TOGGLE_RASTER_LAYER = "TOGGLE_RASTER_LAYER"
export const ADD_NEW_RASTER_LAYER = "ADD_NEW_RASTER_LAYER"
export const DELETE_RASTER_CHART_LEGEND = "DELETE_RASTER_CHART_LEGEND"
export const DELETE_RASTER_LAYER = "DELETE_RASTER_LAYER"
export const SWAP_RASTER_LAYER = "SWAP_RASTER_LAYER"
export const UPDATE_RASTER_CHART_MEASURE_AGG = "UPDATE_RASTER_CHART_MEASURE_AGG"
export const UPDATE_RASTER_LAYER_FILTERS = "UPDATE_RASTER_LAYER_FILTERS"
export const AUTO_SET_RASTER_GEO_MEASURE = "AUTO_SET_RASTER_GEO_MEASURE"
export const DESTROY_RASTER_CHART = "DESTROY_RASTER_CHART"
export const TOGGLE_LINKED_ZOOM = "TOGGLE_LINKED_ZOOM"
export const EXPORT_RASTER_CHART_DATA = "EXPORT_RASTER_CHART_DATA"
export const ADD_POPUP_COLUMN = "ADD_POPUP_COLUMN"
export const UPDATE_POPUP_COLUMN = "UPDATE_POPUP_COLUMN"
export const UPDATE_POPUP_COLUMNS = "UPDATE_POPUP_COLUMNS"
export const REMOVE_POPUP_COLUMN = "REMOVE_POPUP_COLUMN"
export const UPDATE_POPUP_COLUMN_FORMAT = "UPDATE_POPUP_COLUMN_FORMAT"
export const SET_PRIORITIZED_COLOR = "SET_PRIORITIZED_COLOR"
export const REFRESH_RASTER_CHART_SETTINGS = "REFRESH_RASTER_CHART_SETTINGS"
export const DELETE_CHARTS_PREVIOUS_BOUND = "DELETE_CHARTS_PREVIOUS_BOUND"

export const UPDATE_RASTER_GEOHEAT_DIMENSION = "UPDATE_RASTER_GEOHEAT_DIMENSION"

export const CONTOUR_MAJOR_INTERVAL_SETTINGS_CHANGED =
  "CONTOUR_MAJOR_INTERVAL_SETTINGS_CHANGED"
export const CONTOUR_MINOR_INTERVAL_SETTINGS_CHANGED =
  "CONTOUR_MINOR_INTERVAL_SETTINGS_CHANGED"
export const CONTOUR_GRID_CELL_SETTINGS_CHANGED =
  "CONTOUR_GRID_CELL_SETTINGS_CHANGED"
export const CONTOUR_INTERVALS_CHANGED = "CONTOUR_INTERVALS_CHANGED"

export const ADD_CROSS_SECTION_LINE_SELECTION =
  "ADD_CROSS_SECTION_LINE_SELECTION"

export const setLayerLabel = (chartId, currentLayerIndex, labelText) => ({
  type: SET_LAYER_LABEL,
  chartId,
  currentLayerIndex,
  labelText
})

export const setContourIntervals = (
  chartId,
  intervalSize,
  intervalSubdivisions
) => ({
  type: CONTOUR_INTERVALS_CHANGED,
  chartId,
  intervalSize,
  intervalSubdivisions
})

export const setContourMajorIntervalSettings = (chartId, updates) => ({
  type: CONTOUR_MAJOR_INTERVAL_SETTINGS_CHANGED,
  chartId,
  updates
})
export const setContourMinorIntervalSettings = (chartId, updates) => ({
  type: CONTOUR_MINOR_INTERVAL_SETTINGS_CHANGED,
  chartId,
  updates
})
export const setContourGriddingCellSettings = (chartId, field, value) => ({
  type: CONTOUR_GRID_CELL_SETTINGS_CHANGED,
  chartId,
  field,
  value
})
export const setRasterLayerId = (chartId, layerIndex, rasterLayerId) => ({
  type: SET_RASTER_LAYER_ID,
  chartId,
  layerIndex,
  rasterLayerId
})

export function saveCurrentRasterLayer(chartId, layerId) {
  return {
    type: SAVE_CURRENT_RASTER_LAYER,
    chartId,
    layerId
  }
}

export function setRasterLayer(chartId, layerId) {
  return {
    type: SET_RASTER_LAYER,
    chartId,
    layerId
  }
}

export function combineRasterLayers(chartId) {
  return {
    type: COMBINE_RASTER_LAYERS,
    chartId
  }
}

export function destroyRasterChart(chartId) {
  return {
    type: DESTROY_RASTER_CHART,
    chartId
  }
}

export function toggleRasterLayer(chartId, layerId) {
  return {
    type: TOGGLE_RASTER_LAYER,
    chartId,
    layerId
  }
}

export function addNewRasterLayer(chartId, chartType) {
  return {
    type: ADD_NEW_RASTER_LAYER,
    chartId,
    chartType
  }
}

export function destroyRasterChartLegend(chartId, deleteLayerId) {
  return {
    type: DELETE_RASTER_CHART_LEGEND,
    chartId,
    deleteLayerId
  }
}

export function deleteRasterLayer(chartId, deleteLayerId, prevLayerId) {
  return (dispatch) => {
    dispatch({
      type: DELETE_RASTER_LAYER,
      chartId,
      deleteLayerId,
      prevLayerId
    })
    dispatch(removeChartFromParameterUsage(chartId))
  }
}

export function removeRasterChartMeasure(chartId, index) {
  return {
    type: REMOVE_RASTER_CHART_MEASURE,
    chartId,
    index
  }
}

export function setRasterChartDimension(chartId) {
  return {
    type: SET_RASTER_CHART_DIMENSION,
    chartId
  }
}

export function removeRasterChartDimension(chartId, index) {
  return {
    type: REMOVE_RASTER_CHART_DIMENSION,
    chartId,
    index
  }
}
export function removeRasterChartPostFilter(chartId, index) {
  return {
    type: REMOVE_RASTER_CHART_POST_FILTER,
    chartId,
    index
  }
}

export function createRasterChart(chartId, chartSpec) {
  return {
    type: CREATE_RASTER_CHART,
    chartId,
    chartSpec
  }
}

export function updateRasterChart(chartId, updates) {
  return {
    type: UPDATE_RASTER_CHART,
    chartId,
    updates
  }
}

export function updateDensityAccumulator(chartId, updates) {
  return {
    type: UPDATE_DENSITY_ACCUMULATOR,
    chartId,
    updates
  }
}

export function updateColorLegend(chartId, updates, legendIndex) {
  return {
    type: UPDATE_COLOR_LEGEND,
    chartId,
    updates,
    legendIndex
  }
}

export function updateChartLayer(chartId, updates, layerIndex) {
  return {
    type: UPDATE_CHART_LAYER,
    chartId,
    updates,
    layerIndex
  }
}

export function setRasterChartMeasure(chartId, selector, index) {
  return {
    type: SET_RASTER_CHART_MEASURE,
    chartId,
    index,
    selector
  }
}

export function setTerrainLinespecMeasure(
  chartId,
  layerIndex,
  measure,
  measureIndex
) {
  return {
    type: SET_TERRAIN_LINESPEC_MEASURE,
    chartId,
    layerIndex,
    measureIndex,
    measure
  }
}

export function setRasterChartPostFilter(chartId, selector, index) {
  return {
    type: SET_RASTER_CHART_POST_FILTER,
    chartId,
    index,
    selector
  }
}

export function addMeasure({ index, chartId, selector }) {
  return {
    type: ADD_RASTER_CHART_MEASURE,
    index,
    chartId,
    measure: Object.assign({}, selector, {
      loading: true
    })
  }
}

export function addPostFilter({ index, chartId, selector }) {
  return {
    type: ADD_RASTER_CHART_POST_FILTER,
    index,
    chartId,
    selector
  }
}

export function updateGeoHeatDimension({
  chartId,
  dimension,
  index,
  domain,
  type
}) {
  const isQuant = isQuantitative(type || dimension.type)
  return {
    type: UPDATE_RASTER_GEOHEAT_DIMENSION,
    chartId,
    index,
    setter: mergeR({
      loading: false,
      [isQuant ? "minMax" : "categories"]: domain || dimension.domain,
      type: type || dimension.type
    })
  }
}

export function updateMeasure({
  chartId,
  selector,
  index,
  domain,
  type,
  setter,
  groupby = false,
  initMinMax,
  hideOther
}) {
  const isQuant = isQuantitative(type || selector.type) || groupby
  return {
    type: UPDATE_RASTER_CHART_MEASURE,
    chartId,
    index,
    setter:
      setter ||
      mergeR({
        loading: false,
        [isQuant ? "minMax" : "categories"]: domain || selector.domain,
        type: type || selector.type,
        initMinMax,
        hideOther
      })
  }
}

export function updatePostFilter({ chartId, index, setter }) {
  return {
    type: UPDATE_RASTER_CHART_POST_FILTER,
    chartId,
    index,
    setter
  }
}

export function updateMeasuresDomains(chartId, domains) {
  return {
    type: UPDATE_MEASURES_DOMAINS,
    chartId,
    domains
  }
}

export function clearRasterChartFilters(chartId, redrawChart) {
  return {
    type: CLEAR_RASTER_CHART_FILTERS,
    chartId,
    redrawChart
  }
}

export function clearRasterMapZoomCenter(chartId) {
  return {
    type: CLEAR_RASTER_MAP_ZOOM_CENTER,
    chartId
  }
}

export function updateGeoJoinColumn(chartId, column) {
  return {
    type: UPDATE_GEO_JOIN_COLUMN,
    chartId,
    column
  }
}

export function removeJoinDataSource(chartId) {
  return {
    type: REMOVE_GEO_JOIN_DATA_SOURCE,
    chartId
  }
}

// getting called from Master Layer view which calls update for all layers in the chart in raster-chart-sagas
export function setLayerOpacity(chartId, layerId, opacity) {
  return {
    type: SET_LAYER_OPACITY,
    chartId,
    layerId,
    opacity
  }
}

// Updates single layer map chart layer opacity which updates the layer update in raster-chart-sagas
export function setSingleLayerOpacity(chartId, layerId, opacity) {
  return {
    type: SET_SINGLE_LAYER_OPACITY,
    chartId,
    layerId,
    opacity
  }
}

export function setLayerZoomThreshold(
  chartId,
  layerId,
  zoomMinThreshold,
  zoomMaxThreshold
) {
  return {
    type: SET_LAYER_ZOOM_THRESHOLD,
    chartId,
    layerId,
    zoomMinThreshold,
    zoomMaxThreshold
  }
}

export function setLayersVisibility(chartId, param) {
  return {
    type: SET_LAYERS_VISIBILITY,
    chartId,
    param
  }
}

// a thunk method to decide whether or not to update the layer visibility based on the comparison of
// the current map zoom vs the layer zoom range threshold values
export function checkLayerVisibility(chartId, layerId) {
  return async (dispatch, getState) => {
    const chart = getState().charts[chartId]
    // range slider in Master layer tab calls the method with layerId
    if (layerId) {
      const layer = chart.layers?.find((l, id) => id === layerId)
      if (layer) {
        const currentActive =
          layer.zoomMinThreshold < chart.mapZoomCenter.zoom &&
          layer.zoomMaxThreshold > chart.mapZoomCenter.zoom
        if (layer.active && layer.activeZoomLevel !== currentActive) {
          const param = {}
          param[layerId] = currentActive
          await dispatch(setLayersVisibility(chartId, param))
        }
      }
      // no layerId passed if triggered from map zoom event listener which we need to update all layers
      // if below conditions met
    } else if (
      !layerId &&
      chart.layers &&
      chart.layers.length &&
      chart.currentLayer === "master"
    ) {
      // For some instance layers can be updated at the same time if their bounds are the same value.
      // In this case, we need to update those layers' active flag at the same time. In that case,
      // it is better to run batch update, so we are collecting the layers in param object.
      // In this way, we can call handleCombineLayers function only once
      const param = {}
      for (let id = 0; id < chart.layers.length; id += 1) {
        const layerZoomMinThreshold = chart.layers[id].zoomMinThreshold || 0
        const layerZoomMaxThreshold = chart.layers[id].zoomMaxThreshold || 22

        // we consider any negative zoom level from Mapbox map as zoom level 0.
        const currentMapZoomCenterZoom =
          chart.mapZoomCenter.zoom < 0 ? 0 : chart.mapZoomCenter.zoom

        const currentActive =
          layerZoomMinThreshold <= currentMapZoomCenterZoom &&
          layerZoomMaxThreshold >= currentMapZoomCenterZoom

        if (
          chart.layers[id].active &&
          chart.layers[id].activeZoomLevel !== currentActive
        ) {
          param[id] = currentActive
        }
      }

      if (!isEmpty(param)) {
        await dispatch(setLayersVisibility(chartId, param))
      }
    }
  }
}

export function swapLayers(chartId, source, target) {
  return {
    type: SWAP_RASTER_LAYER,
    chartId,
    source,
    target
  }
}

export function updateLayerFilters(chartId, layerId, filters) {
  return (dispatch) => {
    dispatch({
      type: UPDATE_RASTER_LAYER_FILTERS,
      chartId,
      layerId,
      filters
    })
  }
}

export function maybeAutoPopulateRasterMeasure(chartId, columnMetaData) {
  return {
    type: AUTO_SET_RASTER_GEO_MEASURE,
    chartId,
    columnMetaData
  }
}

export function createLabelUpdate(chartId, index, label) {
  return (dispatch, getState) => {
    const selector = getState().charts[chartId].measures[index]
    const setter = mergeR({ axisLabel: label || selector.label })
    dispatch(updateMeasure({ chartId, selector, index, setter }))
    if (index === 0) {
      dispatch(
        updateRasterChart(chartId, { xAxisLabel: label || selector.label })
      )
    } else {
      dispatch(
        updateRasterChart(chartId, { yAxisLabel: label || selector.label })
      )
    }
  }
}

export function toggleLinkedZoom(chartId, linkedZoom) {
  return {
    type: TOGGLE_LINKED_ZOOM,
    chartId,
    linkedZoom
  }
}

/**
 * Function is called every time the zoom/pan happens on a chart
 * @param chartId, orinating chart id
 * @param params, should be mapZoomCenter nested object
 * @returns {Function}
 */
export function updateChartsBound(chartId, params) {
  return async (dispatch) => {
    if (params && params.mapZoomCenter) {
      await dispatch(updateChart(chartId, params))
    }
  }
}

/**
 * Caches the previous bbox to support undo last zoom functionality
 * @param chartId
 * @returns {Function}
 */
export const cacheChartsPreviousBound = (chartId) => async (
  dispatch,
  getState
) => {
  const mapZoomCenter = getState().charts[chartId].mapZoomCenter
  await dispatch(updateChart(chartId, { previousMapZoomCenter: mapZoomCenter }))
}

export const deleteChartsPreviousBound = (chartId) => ({
  type: DELETE_CHARTS_PREVIOUS_BOUND,
  chartId
})

// ensure coords coming back from query don't exceed mapbox lat/lon min/max
const applyMapboxLatLonConstraints = (bounds) => {
  for (const b in bounds) {
    if (b === "x_min") {
      bounds[b] = Math.max(MAPBOX_LON_MIN, bounds[b])
    } else if (b === "x_max") {
      bounds[b] = Math.min(MAPBOX_LON_MAX, bounds[b])
    } else if (b === "y_min") {
      bounds[b] = Math.max(MAPBOX_LAT_MIN, bounds[b])
    } else {
      bounds[b] = Math.min(MAPBOX_LAT_MAX, bounds[b])
    }
  }
}

export const restoreChartsPreviousBound = (chartId) => async (
  dispatch,
  getState,
  services
) => {
  const chart = getState().charts[chartId]
  const previousBounds = chart.previousMapZoomCenter.bounds
  const dcChart = services.get("dc").getChart(chart.dcFlag)

  const bounds = {
    x_min: previousBounds.lonMin,
    x_max: previousBounds.lonMax,
    y_min: previousBounds.latMin,
    y_max: previousBounds.latMax
  }
  applyMapboxLatLonConstraints(bounds)

  await dcChart.zoomToLocation({
    bounds: {
      sw: [bounds.x_min, bounds.y_min],
      ne: [bounds.x_max, bounds.y_max]
    },
    maxZoom: getFeatureFlag(available_feature_flags.MAX_ZOOM_LEVEL),
    padding: {
      top: chart.height * MAPBOX_BBOX_PADDING,
      bottom: chart.height * MAPBOX_BBOX_PADDING,
      left: chart.width * MAPBOX_BBOX_PADDING,
      right: chart.width * MAPBOX_BBOX_PADDING
    }
  })

  dispatch(
    updateChartsBound(chartId, {
      mapZoomCenter: {
        zoom: dcChart.map().getZoom(),
        center: dcChart.map().getCenter(),
        bounds: {
          lonMin: bounds.x_min,
          lonMax: bounds.x_max,
          latMin: bounds.y_min,
          latMax: bounds.y_max
        }
      }
    })
  )
  dispatch(deleteChartsPreviousBound(chartId))
}

/**
 * Called by bbox filter change on the originating chart, this function decides to update the map extent for charts in
 * the dashboard if they have linkedZoomEnabled is ON
 * @param chartId
 * @param renderBounds
 * @returns {Function}
 */

export function updateChartsZoom(chartId, mapZoomCenter) {
  return async (dispatch, getState, services) => {
    const { charts } = getState()

    // The originating chart has to have the linkedZoomEnabled flag ON
    // in order to propagate it's bbox filter to other synced charts
    if (
      charts?.[chartId]?.linkedZoomEnabled &&
      getFeatureFlag(available_feature_flags.ENABLE_LINKED_ZOOM)
    ) {
      // bbox that is changed for the originating chart, we want to update other charts with this bbox if applicable
      Object.keys(charts).forEach((id) => {
        // originating chart map extent is changed by heavyai-charting, so just check other charts
        if (id !== chartId && charts[id].linkedZoomEnabled) {
          const dcChart = services.get("dc").getChart(charts[id].dcFlag)
          // getting the zoom, center of other raster chart's map from heavyai-charting
          const dcChartMapZoom = dcChart.map().getZoom()
          const dcChartMapCenter = dcChart.map().getCenter()
          // comparing the originating chart map center and zoom level with other synced charts' zoom level and center
          if (
            dcChartMapZoom !== mapZoomCenter.zoom ||
            mapZoomCenter.center.lng !== dcChartMapCenter.lng ||
            mapZoomCenter.center.lat !== dcChartMapCenter.lat
          ) {
            dispatch(setChartZoom(id, mapZoomCenter))
          }
        }
      })
    }
  }
}

const appliesToCrossfilterAndEnabled = (f) =>
  f.appliesTo === "CROSSFILTER" && f.enabled

const isBboxFilterForLayer = (f, layerId) =>
  f.layerId === layerId && f.filterType === "BOUNDING_BOX"

const getChartFilterStringWithExclusions = (
  chartId,
  chart,
  omnifilters,
  crossfilter
) => {
  // figure out what filters we want to exclude - in this
  // case, we don't want bbox filters for the current chart
  const excludeFilters = omnifilters
    .filter(
      (f) =>
        appliesToCrossfilterAndEnabled(f) &&
        f.chartId === chartId &&
        f.filter.filterType === "BOUNDING_BOX"
    )
    .map((f) => f.name)

  // now grab the charts filter string
  const filterString = crossfilter
    .getCrossfilter(chart.dataSource, chartId)
    .getFilterStringWithExclusions(excludeFilters)

  return filterString
}

const getLayerFilterStringWithExclusions = (
  chartId,
  layerId,
  layer,
  omnifilters,
  crossfilter
) => {
  const excludeFilters = []

  for (const omnifilter of omnifilters) {
    if (isMultiSourceFilter(omnifilter.filter)) {
      if (appliesToCrossfilterAndEnabled(omnifilter)) {
        for (const [_, f] of Object.entries(
          omnifilter.filter.filtersByDataSource
        )) {
          if (isBboxFilterForLayer(f, layerId)) {
            excludeFilters.push(omnifilter.name)
          }
        }
      }
    } else if (filterHasChildren(omnifilter.filter)) {
      if (appliesToCrossfilterAndEnabled(omnifilter)) {
        for (const f of omnifilter.filter.filters) {
          if (isBboxFilterForLayer(f, layerId)) {
            excludeFilters.push(omnifilter.name)
          }
        }
      }
    } else if (
      appliesToCrossfilterAndEnabled(omnifilter) &&
      isBboxFilterForLayer(omnifilter, layerId) &&
      omnifilter.chartId === chartId
    ) {
      excludeFilters.push(omnifilter.name)
    }
  }

  // now grab the layer's filter string
  const filterString = crossfilter
    .getCrossfilter(layer.dataSource, chartId)
    .getFilterStringWithExclusions(excludeFilters, `Layer${layerId}`)

  return filterString
}

const getFilteredBboxQuery = (
  source,
  chartId,
  sourceFilterString,
  crossfilter
) => {
  // first grab the global filter string
  const globalFilterString = crossfilter
    .getCrossfilter(source.dataSource, chartId)
    .getGlobalFilterString()

  let boundsField = {}
  if (isGeoTypeSupportedRasterChart(source.type)) {
    boundsField = { geomField: source.measures[0].value }
  } else if ([CHART_TYPES.GEOHEAT, CHART_TYPES.CONTOUR].includes(source.type)) {
    boundsField =
      source.dimensions[0].type === "POINT"
        ? { geomField: source.dimensions[0].value }
        : {
            lonField: source.dimensions[0].value,
            latField: source.dimensions[1].value
          }
  } else {
    boundsField =
      source.measures[0].type === "POINT"
        ? { geomField: source.measures[0].value }
        : {
            lonField: source.measures[0].value,
            latField: source.measures[1].value
          }
  }

  // combine them together and send to the sql query to get updated bounds
  return buildFilterBboxQuery(
    source.dataSource,
    [sourceFilterString, globalFilterString]
      .filter((fs) => Boolean(fs))
      .join(" AND "),
    boundsField
  )
}

const calculateBboxFromFilteredLayers = async (queries, services) => {
  const chartBbox = {
    x_min: Number.MAX_SAFE_INTEGER,
    x_max: Number.MIN_SAFE_INTEGER,
    y_min: Number.MAX_SAFE_INTEGER,
    y_max: Number.MIN_SAFE_INTEGER
  }

  try {
    const queryPromises = queries.map((query) => {
      return services.get("DbCon").queryAsync(processSQLParameters(query))
    })

    const queryResults = await Promise.all(queryPromises)

    queryResults.forEach((resultArr) => {
      const result = resultArr[0]
      chartBbox.x_min = Math.min(chartBbox.x_min, result.x_min)
      chartBbox.x_max = Math.max(chartBbox.x_max, result.x_max)
      chartBbox.y_min = Math.min(chartBbox.y_min, result.y_min)
      chartBbox.y_max = Math.max(chartBbox.y_max, result.y_max)
    })

    return chartBbox
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching layer bounding boxes:", error)
    return false
  }
}

/**
 * Called when user clicks button in layer drawer. Takes the layer-specific and global
 * filters, queries heavy for updated bounds based on filter set, updates the bounds
 * for the current chart based on the filter set and then updates bounds for any
 * linkedZoom charts.
 * @param chartId
 * @param layerId
 * @returns {null}
 */
export const updateLayerBoundsFromCurrentFilters = (chartId, layerId) => async (
  dispatch,
  getState,
  services
) => {
  const chart = getState().charts[chartId]
  const layer = chart.layers[layerId]
  const omnifilters = getState().omnifilters
  const crossfilter = services.get("crossfilter")
  const dcChart = services.get("dc").getChart(chart.dcFlag)

  const layerFilterString = getLayerFilterStringWithExclusions(
    chartId,
    layerId,
    layer,
    omnifilters,
    crossfilter
  )

  const query = getFilteredBboxQuery(
    layer,
    chartId,
    layerFilterString,
    crossfilter
  )

  const results = (
    await services.get("DbCon").queryAsync(processSQLParameters(query))
  )[0]
  applyMapboxLatLonConstraints(results)

  await dcChart.zoomToLocation({
    bounds: {
      sw: [results.x_min, results.y_min],
      ne: [results.x_max, results.y_max]
    },
    maxZoom: getFeatureFlag(available_feature_flags.MAX_ZOOM_LEVEL),
    padding: {
      top: chart.height * MAPBOX_BBOX_PADDING,
      bottom: chart.height * MAPBOX_BBOX_PADDING,
      left: chart.width * MAPBOX_BBOX_PADDING,
      right: chart.width * MAPBOX_BBOX_PADDING
    }
  })
  dispatch(cacheChartsPreviousBound(chartId))
  dispatch(
    updateChartsBound(chartId, {
      mapZoomCenter: {
        zoom: dcChart.map().getZoom(),
        center: dcChart.map().getCenter(),
        bounds: {
          lonMin: results.x_min,
          lonMax: results.x_max,
          latMin: results.y_min,
          latMax: results.y_max
        }
      }
    })
  )
}

/**
 * Called when user clicks button in chart-header. If the chart is single-layered,
 * takes the current local and global filters for a chart and queries heavy for a bbox.
 * If the chart is mult-layered, calculatues the bbox for each layer based on their
 * filters, and sets the chart's bbox based on the max extents of the aggregated layer
 * bboxes. Then updates the chart's bounds and bounds for any linkedZoom charts.
 * @param chartId
 * @returns {null}
 */
export const updateChartBoundsFromCurrentFilters = (chartId) => async (
  dispatch,
  getState,
  services
) => {
  const chart = getState().charts[chartId]
  const omnifilters = getState().omnifilters
  const crossfilter = services.get("crossfilter")
  const dcChart = services.get("dc").getChart(chart.dcFlag)

  let results = {}
  if (chart?.layers.length > 1) {
    const layerBboxQueries = []
    for (const [i, layer] of chart.layers.entries()) {
      // for multi-layered charts, need to get each layers' filter string, build
      // query for it and get bbox results from query
      const layerFilterString = getLayerFilterStringWithExclusions(
        chartId,
        i,
        layer,
        omnifilters,
        crossfilter
      )
      layerBboxQueries.push(
        getFilteredBboxQuery(layer, chartId, layerFilterString, crossfilter)
      )
    }
    // then we need to calculate the maximum-extents bbox from all the layers' bboxes
    results = await calculateBboxFromFilteredLayers(layerBboxQueries, services)
  } else {
    const chartFilterString = getChartFilterStringWithExclusions(
      chartId,
      chart,
      omnifilters,
      crossfilter
    )
    const query = getFilteredBboxQuery(
      chart,
      chartId,
      chartFilterString,
      crossfilter
    )

    try {
      results = (
        await services.get("DbCon").queryAsync(processSQLParameters(query))
      )[0]
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching chart bounding box:", error)
      results = false
    }
  }

  if (!results) {
    return
  }

  applyMapboxLatLonConstraints(results)

  // tell charting to have mapbox zoom to our new data bounds, sending over maxZoom and padding
  await dcChart.zoomToLocation({
    bounds: {
      sw: [results.x_min, results.y_min],
      ne: [results.x_max, results.y_max]
    },
    maxZoom: getFeatureFlag(available_feature_flags.MAX_ZOOM_LEVEL),
    padding: {
      top: chart.height * MAPBOX_BBOX_PADDING,
      bottom: chart.height * MAPBOX_BBOX_PADDING,
      left: chart.width * MAPBOX_BBOX_PADDING,
      right: chart.width * MAPBOX_BBOX_PADDING
    }
  })
  dispatch(cacheChartsPreviousBound(chartId))
  dispatch(
    updateChartsBound(chartId, {
      mapZoomCenter: {
        zoom: dcChart.map().getZoom(),
        center: dcChart.map().getCenter(),
        bounds: {
          lonMin: results.x_min,
          lonMax: results.x_max,
          latMin: results.y_min,
          latMax: results.y_max
        }
      }
    })
  )
}

export function updatePopupColumnFormat(chartId, selectedColumn, columnFormat) {
  return {
    type: UPDATE_POPUP_COLUMN_FORMAT,
    chartId,
    selectedColumn,
    columnFormat
  }
}

/**
 * Thunk to handle updating hoverSelectedColumn format and setting formatting for the dcChart
 * @param chartId
 * @param selectedColumn
 * @param columnFormat
 * @returns {Function}
 */
export function setPopupColumnFormat(chartId, selectedColumn, columnFormat) {
  return (dispatch, getState, services) => {
    dispatch(updatePopupColumnFormat(chartId, selectedColumn, columnFormat))

    const { dcFlag, isNotDc, hoverSelectedColumns } = getState().charts[chartId]
    const dcChart = services.get("dc").getChart(dcFlag)
    const popupColumnFormats = hoverSelectedColumns
      .filter((col) => col.format)
      .map((col) => ({
        key: processSQLParameters(col.label, {
          useDisplayName: true
        }),
        format: col.format
      }))

    if (!isNotDc && dcChart) {
      if (dcChart.valueFormatter) {
        dcChart.valueFormatter(immerseAutoFormatter(popupColumnFormats))
      }
    }
  }
}

export function swapPopupColumns(chartId, source, target) {
  return (dispatch, getState) => {
    const { hoverSelectedColumns } = getState().charts[chartId]
    const sourceVal = hoverSelectedColumns[source]
    const targetVal = hoverSelectedColumns[target]

    const swappedHoverCols = compose(
      set(lensIndex(source), targetVal),
      set(lensIndex(target), sourceVal)
    )(hoverSelectedColumns)

    dispatch(updatePopupColumns(chartId, swappedHoverCols))
  }
}

/**
 * Thunk to handle dimension selected popup columns. As soon as dimension gets selected,
 * the previously selected popup columns will be replace by the selected dimension and measures
 * @param chartId
 * @returns {Function}
 */
export function setDimensionPopupColumns(chartId) {
  return (dispatch, getState, services) => {
    const { measures, dimensions, dcFlag, isNotDc } = getState().charts[chartId]

    const dims = dimensions.filter(isSelectorUsable).map((d) => {
      return {
        ...d,
        format: getDefaultFormat(d.type)
      }
    })
    const mes = measures
      .filter(
        (m) => isSelectorUsable(m) && m.label !== "geom" && !isGeo(m.type)
      )
      .reduce((a, c) => {
        // If chart has measures with the same value and the same agg, we choose only one
        const exist = a.find(
          (m) => m.value === c.value && m.aggType === c.aggType
        )
        if (!exist) {
          return a.concat([c])
        }
        return a
      }, [])
      .map((m) => {
        return {
          ...m,
          format: getDefaultFormat(m.type)
        }
      })

    const dimensionPopupColumns = [...dims, ...mes]

    // erasing previous popup column selections and replacing with selected dimensions and measures
    dispatch(updatePopupColumns(chartId, dimensionPopupColumns))

    const dcChart = services.get("dc").getChart(dcFlag)
    const updatedHoverSelectedCols = getState().charts[chartId]
      .hoverSelectedColumns

    const popupColumnFormats = updatedHoverSelectedCols
      .filter((col) => col.format)
      .map((col) => ({
        key: processSQLParameters(col.label, {
          useDisplayName: true
        }),
        format: col.format
      }))

    // Applying the new popup columns format to heavyai-charting formatter
    if (!isNotDc && dcChart) {
      if (dcChart.valueFormatter) {
        dcChart.valueFormatter(immerseAutoFormatter(popupColumnFormats))
      }
    }
  }
}

/**
 * Thunk to handle removing dimension and measures from popup columns upon deleting a dimension
 * @param chartId
 * @param dimension
 * @returns {Function}
 */
export function removeDimensionPopupColumns(chartId, dimension) {
  return (dispatch, getState, services) => {
    const { measures, dcFlag, isNotDc } = getState().charts[chartId]

    // Remove dimension column from popup columns if still exist
    dispatch(removePopupColumn(chartId, dimension))

    // Remove all measures from popup columns if still exist
    const mes = measures.filter(isSelectorUsable)
    mes.forEach((m) => {
      dispatch(removePopupColumn(chartId, m))
    })

    const dcChart = services.get("dc").getChart(dcFlag)
    const updatedHoverSelectedCols = getState().charts[chartId]
      .hoverSelectedColumns

    const popupColumnFormats = updatedHoverSelectedCols
      .filter((col) => col.format)
      .map((col) => ({
        key: processSQLParameters(col.label, {
          useDisplayName: true
        }),
        format: col.format
      }))

    // Applying the new popup columns format to heavyai-charting formatter
    if (!isNotDc && dcChart) {
      if (dcChart.valueFormatter) {
        dcChart.valueFormatter(immerseAutoFormatter(popupColumnFormats))
      }
    }
  }
}

export function addPopupColumn(chartId, column) {
  return {
    type: ADD_POPUP_COLUMN,
    chartId,
    column
  }
}

export function updatePopupColumn(chartId, updatedColumn) {
  return {
    type: UPDATE_POPUP_COLUMN,
    chartId,
    updatedColumn
  }
}

export function updatePopupColumns(chartId, hoverSelectedColumns) {
  return {
    type: UPDATE_POPUP_COLUMNS,
    chartId,
    hoverSelectedColumns
  }
}

export function removePopupColumn(chartId, column) {
  return {
    type: REMOVE_POPUP_COLUMN,
    chartId,
    column
  }
}

export function setPrioritizedColorCategory(chartId, option) {
  return {
    type: SET_PRIORITIZED_COLOR,
    chartId,
    option
  }
}

// backward compatibility to support dynamically hide/show All Other on existing raster charts
export function setHideOtherForOldChart(chartId, chart) {
  return (dispatch, getState, services) => {
    function handleUpdateHideOther(layer, layerId) {
      const dimension = services
        .get("crossfilter")
        .getCrossfilter(layer.dataSource)
        .dimension(layer.color.column)
        .order("val")

      const group = dimension.group().reduceCount()
      group
        .topAsync(NUM_RESULTS, 0, null)
        .then((results) => {
          if (layer.color.customDomain.length >= results.length) {
            dispatch(updateHideOther(chartId, true, layerId))
          } else {
            dispatch(updateHideOther(chartId, false, layerId))
          }
        })
        .then(() => {
          dimension.dispose()
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log("error", error)
        })
    }

    const layers = chart.layers
    if (layers && layers.length > 1) {
      layers.forEach((l, i) => {
        if (
          l.color &&
          l.color.type === "custom" &&
          !l.color.hasOwnProperty("hideOther")
        ) {
          handleUpdateHideOther(l, i)
        }
      })
    } else if (
      chart.color &&
      chart.color.type === "custom" &&
      !chart.color.hasOwnProperty("hideOther")
    ) {
      handleUpdateHideOther(chart)
    }
  }
}

export const updateColorDomainAllLayers = (chart, chartId, parameterName) => (
  dispatch,
  getState,
  services
) => {
  const { layers } = chart
  const measureDomainsNeedUpdate = (measure) =>
    measure.name === "color" &&
    valueContainsParameter(measure.value, parameterName)

  if (layers && layers.length > 1) {
    // Multilayer raster charts domain legends read from the `layers` property.
    // This waits for each layer to be updated then combines them
    const layerUpdates = []

    layers.forEach((layer, layerIndex) => {
      if (!isRasterChartButNotGeoheat(layer.type)) {
        return
      }

      const { dataSource } = layer
      const colorMeasure = layer.measures.find((measure) =>
        measureDomainsNeedUpdate(measure)
      )

      if (colorMeasure && layer.color.customDomain) {
        layerUpdates.push(
          services
            .get("crossfilter")
            .getCrossfilter(dataSource, chartId)
            .getDomain(colorMeasure)
            .then((results) => {
              // Got topN (top 10) + 1 categories, so if there is 11th category,
              // we would expect Other category since we are defaulting to 10 categories
              const hasOther = results.length && results.length > 10

              dispatch(
                updateChartLayer(
                  chartId,
                  {
                    color: customOrdinalColor({
                      type: colorMeasure.type,
                      value: colorMeasure.value,
                      // Take only first 10 categories if we get 11 categories in the result
                      categories: hasOther
                        ? results.slice(0, results.length - 1)
                        : results,
                      initMinMax: results,
                      hideOther: !hasOther
                    })
                  },
                  layerIndex
                )
              )
            })
        )
      }
    })

    Promise.all(layerUpdates).then(() => {
      dispatch(combineRasterLayers(chartId))
    })
  } else if (isRasterChartButNotGeoheat(chart.type)) {
    // Single layer charts read from the chart-level color property
    chart.measures.forEach((measure, index) => {
      if (measureDomainsNeedUpdate(measure)) {
        if (
          isRasterPointChart(chart.type) ||
          chart.type === CHART_TYPES.LINEMAP
        ) {
          dispatch({
            type: "UPDATE_RASTER_CHART_MEASURE_AGG",
            chartId,
            index
          })
        } else {
          dispatch(setRasterChartMeasure(chartId, measure, index))
        }
      }
    })
  }
}

export function refreshRasterChartSettings(chartId) {
  return {
    type: REFRESH_RASTER_CHART_SETTINGS,
    chartId
  }
}

export function updateRasterChartColorPalette(chartId, color) {
  return (dispatch, getState) => {
    const { charts, sharedSettings } = getState()
    const chart = charts[chartId]
    const chartColor = chart.color.paletteMappingId
      ? sharedSettings.mappings.find(
          (m) => m.id === chart.color.paletteMappingId
        )?.mapping ?? chart.color
      : chart.color
    dispatch({
      type: UPDATE_RASTER_CHART_COLOR_PALETTE,
      chartId,
      color,
      chartColor
    })
    if (chart.color.paletteMappingId) {
      dispatch(
        setLastPaletteMappingId(chartId, null, chart.color.paletteMappingId)
      )
    }
  }
}
