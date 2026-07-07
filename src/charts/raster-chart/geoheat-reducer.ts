// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { produce } from "immer"
import * as ActionTypes from "./geoheat-actions"
import { adjust, compose, lensIndex, remove, set } from "ramda"
import {
  DEFAULT_GEOHEAT_MARK,
  DEFAULT_GEOHEAT_PIXEL_SIZE,
  layerDefaultOpacity
} from "constants/magic-variables"
import {
  updateColor,
  updateDimensionsForChart,
  updateMeasuresForChart
} from "reducers/charts/update-chart-type-reducer"
import { GeoHeatState } from "./raster-chart-types"
import pushid from "pushid"
import {
  isLayerValid,
  isRasterPointChart,
  layerSupportsMasterSetting,
  removeLayerAdapterDimensionMappingHandler
} from "./raster-utils"
import { CHARTS_DEFAULT_COLORS, getColors } from "services/colors"
import { CHARTS, CHART_TYPES } from "constants/charts"
import { isSelectorUsable } from "utils/selector-helpers"
import Services from "services/immerse"
import { getDefaultFormat } from "../../utils/formatter-helper"
import { isGeo } from "constants/data-types"
import { SET_RASTER_LAYER_ID } from "./raster-chart-actions"
import { RASTER_LAYER_ID_PREFIX } from "../../utils/raster-layer-id-utils"
import {
  DEFAULT_POLY_BORDER_COLOR,
  DEFAULT_POLY_BORDER_WIDTH,
  MASTER_LAYER_SETTINGS
} from "./raster-chart-consts"
import { CONTOUR_SETTINGS_KEYS } from "./contour/constants"
import { cloneDeep } from "lodash"
import { immerseAutoFormatter } from "utils/auto-formatter"

function setMarkTypeReducer(
  state: GeoHeatState,
  action: ActionTypes.SET_MARK_TYPE_ACTION
): GeoHeatState {
  return {
    ...state,
    [action.chartId]: {
      ...state[action.chartId],
      mark: action.mark
    }
  }
}

function updateGeoHeatColorRangeReducer(
  state: GeoHeatState,
  action: ActionTypes.UPDATE_GEOHEAT_COLOR_RANGE_ACTION
): GeoHeatState {
  const { reverse, ...color } = action.color
  const colorUpdate = {
    ...color,
    val: reverse ? [...color.val].reverse() : color.val
  }

  return {
    ...state,
    [action.chartId]: {
      ...state[action.chartId],
      color: colorUpdate,
      savedColors: {
        ...state[action.chartId].savedColors,
        [color.type]: colorUpdate
      }
    }
  }
}

function setPixelSizeReducer(
  state: GeoHeatState,
  action: ActionTypes.SET_PIXEL_SIZE_ACTION
): GeoHeatState {
  return {
    ...state,
    [action.chartId]: {
      ...state[action.chartId],
      pixelSize: action.size
    }
  }
}

export const setRasterLayerIdReducer = (
  state,
  { chartId, layerIndex, rasterLayerId }
) => {
  const chart = state[chartId]
  const layers = [...(chart.layers || [])]
  layers[layerIndex] = { ...layers[layerIndex], rasterLayerId }
  return {
    ...state,
    [chartId]: {
      ...chart,
      layers
    }
  }
}

/**
 * When switching charts, certain properties are copied between the main
 * chart spec (charts[id]) to the layer (charts.layers[i]). This copies
 *
 * @param layer - The layer to copy properties TO
 * @param chart - The chart to copy properties FROM
 * @returns - Returns the updated layer with properties copied from parent chart
 */
function copyChartSettings(layer, chart) {
  // Using different name for BE Choropleth sampling cap value since we introduced sampling later and
  // needed to apply the new defaultCap to existing Choropleth charts
  if (layer.type === CHART_TYPES.BACKEND_CHOROPLETH) {
    layer.polyCap = chart.polyCap
  }

  // TODO: will remove the check once we apply postFilter to all charts
  if (isRasterPointChart(layer.type)) {
    layer.postFilters = chart.postFilters
  }

  if (layer.type === CHART_TYPES.CONTOUR) {
    const copyProps = Object.values(CONTOUR_SETTINGS_KEYS)
    copyProps.forEach((p) => {
      layer[p] = cloneDeep(chart[p])
    })
  }

  return layer
}

function saveCurrentRasterLayerReducer(state, { chartId, layerId }) {
  const chart = state[chartId]
  const layers = state[chartId].layers || []
  const hoverSelectedColumns = chart.hoverSelectedColumns || []
  const opacity = layerSupportsMasterSetting(
    chart.type,
    MASTER_LAYER_SETTINGS.OPACITY
  )
    ? { opacity: chart.opacity }
    : {}

  const baseLayer = {
    ...layers[layerId],
    measures: [...chart.measures.map((m) => ({ ...m }))],
    dimensions: [...chart.dimensions.map((d) => ({ ...d }))],
    color: {
      ...chart.color,
      val: [...(chart.color?.val ?? [])]
    },
    pixelSize: chart.pixelSize,
    mark: chart.mark,
    markShape: chart.markShape,
    dataSource: chart.dataSource,
    type: chart.type,
    densityAccumulatorEnabled: chart.densityAccumulatorEnabled,
    autoSize: chart.autoSize,
    sizeRange: chart.sizeRange,
    sizeDomain: chart.sizeDomain,
    cap: chart.cap,
    hoverSelectedColumns: [...hoverSelectedColumns],
    geoJoin: { ...chart.geoJoin },
    legendOpen: chart.legendOpen,
    borderWidth: chart.borderWidth,
    borderColor: chart.borderColor,
    hasBorderColorFromFill: chart.hasBorderColorFromFill,
    popupEnabled: chart.popupEnabled,
    rasterShowOther: chart.rasterShowOther,
    active: chart.active,
    fullColorHashing: chart?.fullColorHashing,
    ...opacity
  }
  const currentLayer = copyChartSettings(baseLayer, chart)

  layers[layerId] = currentLayer

  return {
    ...state,
    [chartId]: {
      ...chart,
      layers: [...layers]
    }
  }
}

function setRasterLayerReducer(state, { chartId, layerId }) {
  const chart = state[chartId]
  return {
    ...state,
    [chartId]: {
      ...chart,
      ...chart.layers[layerId],
      currentLayer: layerId
    }
  }
}

const toggleRasterLayerReducer = produce((state, { chartId, layerId }) => {
  const layer = state[chartId].layers[layerId]
  layer.active = !layer.active
})

function addRasterLayerReducer(
  state,
  { chartId, chartType },
  rasterLayerIdOnlyForUnitTest
) {
  const chart = state[chartId]
  const layers = state[chartId].layers

  // Use chart type passed in, or make it the same as existing
  const newChartType = chartType ?? chart.type

  const nextColorType = getColors(CHARTS_DEFAULT_COLORS)[newChartType].type
  const newRasterLayerId =
    rasterLayerIdOnlyForUnitTest || `${RASTER_LAYER_ID_PREFIX}:${pushid()}`
  const opacity = layerSupportsMasterSetting(
    newChartType,
    MASTER_LAYER_SETTINGS.OPACITY
  )
    ? { opacity: layerDefaultOpacity(newChartType) }
    : {}

  return compose(
    updateColor(chartId, newChartType),
    updateDimensionsForChart(chartId, newChartType),
    updateMeasuresForChart(chartId, newChartType)
  )({
    ...state,
    [chartId]: {
      ...chart,
      type: newChartType,
      layers: [
        ...layers,
        {
          rasterLayerId: newRasterLayerId
        }
      ],
      measures: [{}],
      dimensions: [{}],
      pixelSize: DEFAULT_GEOHEAT_PIXEL_SIZE,
      currentLayer: layers.length,
      mark: DEFAULT_GEOHEAT_MARK,
      hoverSelectedColumns: [],
      densityAccumulatorEnabled: true,
      color:
        chart.savedColors[nextColorType] ||
        getColors(CHARTS_DEFAULT_COLORS)[newChartType],
      borderWidth: DEFAULT_POLY_BORDER_WIDTH,
      borderColor: DEFAULT_POLY_BORDER_COLOR,
      hasBorderColorFromFill: false,
      postFilters: CHARTS[newChartType].postFilters,
      popupEnabled: true,
      rasterShowOther: true,
      active: true,
      rasterLayerId: newRasterLayerId,
      ...opacity
    }
  })
}

function deleteRasterLayerReducer(state, { chartId, deleteLayerId }) {
  const chart = state[chartId]

  const { dataSource, type, measures, dimensions } = chart.layers[deleteLayerId]
  removeLayerAdapterDimensionMappingHandler(
    chartId,
    dataSource,
    type,
    measures,
    dimensions
  )

  const layers = remove(deleteLayerId, 1, state[chartId].layers)
  let currentLayer = chart.currentLayer

  if (currentLayer === "master") {
    currentLayer = layers.filter(isLayerValid).length > 1 ? currentLayer : 0
  } else if (chart.currentLayer === deleteLayerId) {
    currentLayer = chart.layers[currentLayer + 1]
      ? currentLayer
      : currentLayer - 1
  } else if (chart.currentLayer > deleteLayerId) {
    currentLayer = currentLayer - 1
  }

  return {
    ...state,
    [chartId]: {
      ...chart,
      ...(currentLayer === "master" ? {} : layers[currentLayer]),
      layers,
      currentLayer
    }
  }
}

function clearFilters(state, { chartId }) {
  return {
    ...state,
    [chartId]: {
      ...state[chartId],
      filters: []
    }
  }
}

function setLayerOpacity(state, { chartId, layerId, opacity }) {
  const chart = state[chartId]
  const layers = chart.layers.map((layer, id) => {
    if (id === layerId) {
      return {
        ...layer,
        opacity
      }
    }
    return layer
  })

  return {
    ...state,
    [chartId]: {
      ...chart,
      layers
    }
  }
}

/*
  Batch update for chart layers' active flag
 */
function setLayersVisibilityReducer(state, { chartId, param }) {
  const chart = state[chartId]
  const layers = chart.layers.map((layer, id) => {
    // We can control layer visibility by min/max zoom threshold slider besides the layer toggle on/off checkbox
    if (id in param) {
      const activeZoomLevel = param[id]
      return {
        ...layer,
        activeZoomLevel
      }
    }
    return layer
  })

  return {
    ...state,
    [chartId]: {
      ...chart,
      layers
    }
  }
}

function setLayerZoomThresholdReducer(
  state,
  { chartId, layerId, zoomMinThreshold, zoomMaxThreshold }
) {
  const chart = state[chartId]
  const layers = chart.layers.map((layer, id) => {
    if (id === layerId) {
      return {
        ...layer,
        zoomMinThreshold,
        zoomMaxThreshold
      }
    }
    return layer
  })

  return {
    ...state,
    [chartId]: {
      ...chart,
      layers
    }
  }
}

function saveLegendOpenStateReducer(state, { chartId, layerIndex, open }) {
  const chart = state[chartId]
  const layers = chart.layers

  if (layerIndex !== null && layers.length) {
    return {
      ...state,
      [chartId]: {
        ...chart,
        layers: adjust((l) => ({ ...l, legendOpen: open }), layerIndex, layers)
      }
    }
  } else {
    return {
      ...state,
      [chartId]: {
        ...chart,
        legendOpen: open
      }
    }
  }
}

function combineRasterLayersReducer(state, { chartId }) {
  const chart = state[chartId]
  let layers = chart.layers
  if (!chart.isNotDc) {
    layers = layers.filter(isLayerValid)
  }

  return {
    ...state,
    [chartId]: {
      ...chart,
      layers,
      currentLayer: "master"
    }
  }
}

function swapRasterLayersReducer(state, { chartId, source, target }) {
  const chart = state[chartId]
  const layers = chart.layers
  const sourceVal = layers[source]
  const targetVal = layers[target]

  return {
    ...state,
    [chartId]: {
      ...chart,
      layers: compose(
        set(lensIndex(source), targetVal),
        set(lensIndex(target), sourceVal)
      )(layers)
    }
  }
}

// backward compatibility to support postFilter on existing Pointmap and Scatter chart
function applyPostFilterOnExistingChart(state, { chartId }) {
  const chart = state[chartId]
  const layers = chart.layers

  if (layers && layers.length > 1) {
    const updatedLayers = layers.map((l) => {
      if (l.type === "pointmap" && !l.postFilters) {
        return {
          ...l,
          postFilters: CHARTS[l.type].postFilters
        }
      } else {
        return l
      }
    })
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        layers: [...updatedLayers]
      }
    }
  } else if (isRasterPointChart(chart.type) && !chart.postFilters) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        postFilters: CHARTS[chart.type].postFilters
      }
    }
  } else {
    return state
  }
}

// backward compatibility to support popup on existing raster charts
function applyPopupPropsOnExistingCharts(state, { chartId }) {
  const chart = state[chartId]
  function getPopupColumns(layer) {
    const { measures, dimensions = [], dcFlag, isNotDc } = layer
    let popupColumns = []
    const dims = dimensions.filter(isSelectorUsable).map((d) => {
      return {
        ...d,
        format: getDefaultFormat(d.type)
      }
    })

    if (dims.length) {
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
      popupColumns = [...dims, ...mes]
    } else if (chart.hoverSelectedColumns) {
      popupColumns = chart.hoverSelectedColumns
    }

    const dcChart = Services.get("dc").getChart(dcFlag)
    const popupColumnFormats = popupColumns
      .filter((col) => col.format)
      .map((col) => ({ key: col.label, format: col.format }))

    // Applying the new popup columns format to heavyai-charting formatter
    if (!isNotDc && dcChart) {
      if (dcChart.valueFormatter) {
        dcChart.valueFormatter(immerseAutoFormatter(popupColumnFormats))
      }
    }
    return popupColumns
  }

  const layers = chart.layers
  if (layers && layers.length > 1) {
    const updatedLayers = layers.map((l) => {
      if (!l.hoverSelectedColumns || l.popupEnabled === undefined) {
        return {
          ...l,
          hoverSelectedColumns: getPopupColumns(l),
          popupEnabled: true
        }
      } else {
        return l
      }
    })
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        layers: [...updatedLayers]
      }
    }
  } else if (!chart.hoverSelectedColumns || chart.popupEnabled === undefined) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        hoverSelectedColumns: getPopupColumns(chart),
        popupEnabled: true
      }
    }
  } else {
    return state
  }
}

// backward compatibility to support orientation measure on existing Pointmap and BE Scatter chart
function applyOrientationMeasureOnExistingPointmap(state, { chartId }) {
  const chart = state[chartId]
  const layers = chart.layers
  const initialOrientationMeasure = {
    inactive: false,
    name: "orientation",
    isRequired: false,
    isError: false
  }

  if (layers && layers.length > 1) {
    const updatedLayers = layers.map((l) => {
      const { measures: layerMeasures = [] } = l
      const updatedMeasures = [...layerMeasures]
      updatedMeasures.push(initialOrientationMeasure)
      // BE Scatter is not multilayer charts, so just Pointmap
      if (l.type === "pointmap" && !layerMeasures[4]) {
        return {
          ...l,
          measures: [...updatedMeasures]
        }
      } else {
        return l
      }
    })
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        layers: [...updatedLayers]
      }
    }
  } else if (isRasterPointChart(chart.type) && !chart.measures[4]) {
    const updatedMeasures = [...chart.measures]
    updatedMeasures.push(initialOrientationMeasure)
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        measures: [...updatedMeasures]
      }
    }
  } else {
    return state
  }
}

// backward compatibility to support layer visibility on existing raster charts
function applyLayerVisibilityOnExistingChart(state, { chartId }) {
  const chart = state[chartId]
  const layers = chart.layers

  if (layers && layers.length > 1) {
    const updatedLayers = layers.map((l) => {
      if (!l.hasOwnProperty("active")) {
        return {
          ...l,
          active: true
        }
      } else {
        return l
      }
    })
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        layers: [...updatedLayers]
      }
    }
  } else if (!chart.hasOwnProperty("active")) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        active: true
      }
    }
  } else {
    return state
  }
}

// backward compatibility to add rasterShowOther property on existing raster charts
function applyRasterShowOtherOnExistingChart(state, { chartId }) {
  const chart = state[chartId]
  const layers = chart.layers

  if (layers && layers.length > 1) {
    const updatedLayers = layers.map((l) => {
      if (!l.hasOwnProperty("rasterShowOther")) {
        return {
          ...l,
          rasterShowOther: true
        }
      } else {
        return l
      }
    })
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        layers: [...updatedLayers]
      }
    }
  } else if (!chart.hasOwnProperty("rasterShowOther")) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        rasterShowOther: true
      }
    }
  } else {
    return state
  }
}

const deleteChartsPreviousBound = produce((state, { chartId }) => {
  delete state[chartId].previousMapZoomCenter
})

export default {
  [ActionTypes.SET_GEOHEAT_MARK_TYPE]: setMarkTypeReducer,
  [ActionTypes.SET_GEOHEAT_COLOR_RANGE]: updateGeoHeatColorRangeReducer,
  [ActionTypes.SET_GEOHEAT_PIXEL_SIZE]: setPixelSizeReducer,
  [ActionTypes.SAVE_LEGEND_OPEN_STATE]: saveLegendOpenStateReducer,
  SAVE_CURRENT_RASTER_LAYER: saveCurrentRasterLayerReducer,
  [SET_RASTER_LAYER_ID]: setRasterLayerIdReducer,
  SET_RASTER_LAYER: setRasterLayerReducer,
  TOGGLE_RASTER_LAYER: toggleRasterLayerReducer,
  ADD_NEW_RASTER_LAYER: addRasterLayerReducer,
  CLEAR_RASTER_CHART_FILTERS: clearFilters,
  SET_LAYER_OPACITY: setLayerOpacity,
  SET_SINGLE_LAYER_OPACITY: setLayerOpacity,
  SET_LAYERS_VISIBILITY: setLayersVisibilityReducer,
  SET_LAYER_ZOOM_THRESHOLD: setLayerZoomThresholdReducer,
  DELETE_RASTER_LAYER: deleteRasterLayerReducer,
  COMBINE_RASTER_LAYERS: combineRasterLayersReducer,
  SWAP_RASTER_LAYER: swapRasterLayersReducer,
  [ActionTypes.APPLY_POSTFILTER_ON_EXISTING_CHART]: applyPostFilterOnExistingChart,
  [ActionTypes.APPLY_POPUP_ON_EXISTING_CHART]: applyPopupPropsOnExistingCharts,
  [ActionTypes.APPLY_ORIENTATIION_ON_EXISTING_CHART]: applyOrientationMeasureOnExistingPointmap,
  [ActionTypes.APPLY_LAYER_VISIBILITY_ON_EXISTING_CHART]: applyLayerVisibilityOnExistingChart,
  [ActionTypes.APPLY_RASTER_SHOW_OTHER_ON_EXISTING_CHART]: applyRasterShowOtherOnExistingChart,
  DELETE_CHARTS_PREVIOUS_BOUND: deleteChartsPreviousBound
}
