// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { produce } from "immer"
import * as ActionTypes from "./raster-chart-actions"
import {
  dissoc,
  findIndex,
  lensIndex,
  over,
  reduce,
  remove,
  set,
  adjust,
  lensProp
} from "ramda"
import { createNewMeasure } from "reducers/charts/helpers/measure-object-helpers"
import {
  customOrdinalColor,
  customCategoricalColor,
  categoricalColorFromMeasure
} from "reducers/charts/helpers/color-helpers"
import { isSelectorUsable } from "utils/selector-helpers"
import { mergeR } from "utils/ramda-helpers"
import {
  SIZE_RANGE_DEFAULTS,
  STROKE_WIDTH_RANGE_DEFAULTS
} from "constants/magic-variables"
import { SELECT_GEO_JOIN_DATA_SOURCE } from "actions/data-source-action-creators"
import { MEASURE_DEFAULT_COLORS, getColors } from "services/colors"
import { getDefaultFormat } from "../../utils/formatter-helper"
import { isEqual } from "lodash"
import { CHART_TYPES } from "constants/chart-types"

const mergeAtIndex = (index, updates, collection) =>
  over(lensIndex(index), mergeR(updates), collection)

export default {
  [ActionTypes.UPDATE_RASTER_CHART](state, { chartId, updates }) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        ...updates
      }
    }
  },
  [ActionTypes.UPDATE_DENSITY_ACCUMULATOR](
    state,
    { chartId, updates: { densityAccumulatorEnabled } }
  ) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        densityAccumulatorEnabled,
        color: densityAccumulatorEnabled
          ? getColors(MEASURE_DEFAULT_COLORS).quantitative
          : getColors(MEASURE_DEFAULT_COLORS).solid
      }
    }
  },
  [ActionTypes.REMOVE_RASTER_CHART_MEASURE](state, { chartId, index }) {
    const chart = state[chartId]
    const { color, type, autoSize, measures, densityAccumulatorEnabled } = chart
    const { name, isRequired } = measures[index]
    let useQuantitativeColors = null

    if (type === "backendChoropleth") {
      useQuantitativeColors = measures[index].name === "colors"
    } else {
      useQuantitativeColors = densityAccumulatorEnabled
    }
    const defaultColors = getColors(MEASURE_DEFAULT_COLORS)[
      useQuantitativeColors ? "quantitative" : "solid"
    ]

    return {
      ...state,
      [chartId]: {
        ...chart,
        autoSize: name === "size" ? true : autoSize,
        color: name === "color" ? defaultColors : color,
        measures: set(
          lensIndex(index),
          { isError: false, name, isRequired },
          measures
        )
      }
    }
  },
  [ActionTypes.REMOVE_RASTER_CHART_DIMENSION](state, { chartId, index }) {
    const chart = state[chartId]
    const dimensions = remove(index, 1, chart.dimensions)
    // NOTE: It appears there currently is not support for a chart with 1 optional dimension. The only chart that requires this is backend choropleth, so for now we can work around this limitation by simply pushing a dimension onto the dims array if the chart is choropleth and length is 0. A better solution would be to separate number of dimensions with whether or not a dimension is required.
    if (dimensions.length === 0 && chart.type === "backendChoropleth") {
      dimensions.push({ isError: false, isRequired: false })
    }
    const COLOR_INDEX = findIndex(
      (measure) => measure.name === "color",
      chart.measures
    )
    if (
      dimensions.filter(isSelectorUsable).length === 0 &&
      chart.measures[COLOR_INDEX].type === "STR"
    ) {
      return {
        ...state,
        [chartId]: {
          ...chart,
          dimensions,
          measures: mergeAtIndex(
            COLOR_INDEX,
            { colorType: "ordinal" },
            chart.measures
          )
        }
      }
    } else {
      return {
        ...state,
        [chartId]: {
          ...chart,
          dimensions
        }
      }
    }
  },
  [ActionTypes.REMOVE_RASTER_CHART_POST_FILTER](state, { chartId, index }) {
    const chart = state[chartId]
    const layers = chart.layers
    const currentLayer = chart.currentLayer || 0
    const postFilters =
      chart.postFilters && layers && layers[currentLayer].postFilters
        ? layers[currentLayer].postFilters
        : chart.postFilters

    const { name, isRequired } = postFilters[index]

    if (layers && layers[currentLayer] && layers[currentLayer].postFilters) {
      layers[currentLayer].postFilters = set(
        lensIndex(index),
        {
          isError: false,
          name,
          isRequired,
          min: "",
          max: "",
          operator: null
        },
        postFilters
      )

      return {
        ...state,
        [chartId]: {
          ...chart,
          layers: [...layers],
          postFilters: set(
            lensIndex(index),
            {
              isError: false,
              name,
              isRequired,
              min: "",
              max: "",
              operator: null
            },
            postFilters
          )
        }
      }
    } else {
      return {
        ...state,
        [chartId]: {
          ...chart,
          postFilters: set(
            lensIndex(index),
            {
              isError: false,
              name,
              isRequired,
              min: "",
              max: "",
              operator: null
            },
            postFilters
          )
        }
      }
    }
  },
  [ActionTypes.ADD_RASTER_CHART_MEASURE](state, { chartId, index, measure }) {
    const { measures, ...chart } = state[chartId]
    const targetMeasure = measures[index]
    const sizeRangeDefault =
      chart.type === "linemap"
        ? STROKE_WIDTH_RANGE_DEFAULTS
        : SIZE_RANGE_DEFAULTS

    return {
      ...state,
      [chartId]: {
        ...chart,
        autoSize: targetMeasure.name === "size" ? false : chart.autoSize,
        sizeRange:
          targetMeasure.name === "size" ? sizeRangeDefault : chart.sizeRange,
        measures: mergeAtIndex(
          index,
          createNewMeasure(measure, chart.type),
          measures
        )
      }
    }
  },
  [ActionTypes.SET_TERRAIN_LINESPEC_MEASURE]: produce(
    (state, { chartId, layerIndex, measureIndex, measure }) => {
      const chart = state[chartId]
      const layers = chart.layers
      const measures = chart.layers[layerIndex]?.measures

      layers[layerIndex] = {
        ...layers[layerIndex],
        measures: mergeAtIndex(
          measureIndex,
          createNewMeasure(measure, chart.type),
          measures
        )
      }
    }
  ),
  [ActionTypes.SET_LAYER_LABEL](
    state,
    { chartId, currentLayerIndex, labelText }
  ) {
    const chart = state[chartId]
    const layers = chart.layers
    layers[currentLayerIndex] = {
      ...layers[currentLayerIndex],
      labelText
    }

    return {
      ...state,
      [chartId]: {
        ...chart,
        layers: [...layers]
      }
    }
  },
  [ActionTypes.ADD_RASTER_CHART_POST_FILTER](
    state,
    { chartId, index, selector }
  ) {
    const chart = state[chartId]
    const chartType = chart.type
    const layers = chart.layers
    const currentLayer = chart.currentLayer || 0
    const layerPostFilter =
      layers && layers[currentLayer] && layers[currentLayer].postFilters
        ? layers[currentLayer].postFilters
        : chart.postFilters
    const setDefaultOperator = set(lensProp("operator"))

    if (layers && layers[currentLayer] && layers[currentLayer].postFilters) {
      layers[currentLayer].postFilters = mergeAtIndex(
        index,
        setDefaultOperator("between", createNewMeasure(selector, chartType)),
        layerPostFilter
      )
      return {
        ...state,
        [chartId]: {
          ...chart,
          layers: [...layers],
          postFilters: mergeAtIndex(
            index,
            setDefaultOperator(
              "between",
              createNewMeasure(selector, chartType)
            ),
            layerPostFilter
          )
        }
      }
    } else {
      return {
        ...state,
        [chartId]: {
          ...chart,
          postFilters: mergeAtIndex(
            index,
            setDefaultOperator(
              "between",
              createNewMeasure(selector, chartType)
            ),
            layerPostFilter
          )
        }
      }
    }
  },
  [ActionTypes.UPDATE_COLOR_LEGEND](state, { chartId, updates, legendIndex }) {
    const chart = state[chartId]
    const layers = chart.layers
    const currentLayer = chart.currentLayer || 0

    if (currentLayer !== "master" && layers) {
      return {
        ...state,
        [chartId]: {
          ...chart,
          layers: adjust((l) => ({ ...l, ...updates }), currentLayer, layers)
        }
      }
    } else if (currentLayer === "master" && typeof legendIndex === "number") {
      return {
        ...state,
        [chartId]: {
          ...chart,
          layers: adjust((l) => ({ ...l, ...updates }), legendIndex, layers)
        }
      }
    } else {
      // for BE Scatter chart
      return {
        ...state,
        [chartId]: {
          ...chart,
          ...updates
        }
      }
    }
  },
  [ActionTypes.UPDATE_CHART_LAYER](state, { chartId, updates, layerIndex }) {
    const chart = state[chartId]
    const layers = chart.layers
    const currentLayer = chart.currentLayer || 0

    if (currentLayer !== "master" && layers) {
      return {
        ...state,
        [chartId]: {
          ...chart,
          layers: adjust((l) => ({ ...l, ...updates }), currentLayer, layers)
        }
      }
    } else if (currentLayer === "master" && typeof layerIndex === "number") {
      return {
        ...state,
        [chartId]: {
          ...chart,
          layers: adjust((l) => ({ ...l, ...updates }), layerIndex, layers)
        }
      }
    } else {
      // for BE Scatter chart
      return {
        ...state,
        [chartId]: {
          ...chart,
          ...updates
        }
      }
    }
  },
  [ActionTypes.UPDATE_RASTER_CHART_MEASURE](state, { chartId, index, setter }) {
    const chart = state[chartId]
    const measures = over(lensIndex(index), setter, chart.measures)
    const measure = measures[index]
    // If using a join for choropleth or line map, query is auto aggregated by geometry rowid
    const isAutoAgged =
      measure.is_join &&
      [CHART_TYPES.BACKEND_CHOROPLETH, CHART_TYPES.LINEMAP].includes(chart.type)
    const isAgg =
      chart.dimensions.filter(isSelectorUsable).length || isAutoAgged

    if (measure.name !== "color") {
      return {
        ...state,
        [chartId]: {
          ...chart,
          measures
        }
      }
    } else if (
      (measure.type !== "STR" && measure.type !== "BOOL") ||
      (isAgg && measure.type === "STR" && measure.aggType === "# Unique")
    ) {
      return {
        ...state,
        [chartId]: {
          ...chart,
          color:
            chart.color?.type === "quantitative"
              ? chart.color
              : getColors(MEASURE_DEFAULT_COLORS).quantitative,
          measures: mergeAtIndex(index, { colorType: "quantitative" }, measures)
        }
      }
    } else {
      return {
        ...state,
        [chartId]: {
          ...chart,
          color: categoricalColorFromMeasure(measure),
          measures: mergeAtIndex(index, { colorType: "ordinal" }, measures),
          colorDomain: null,
          legendLocked: false
        }
      }
    }
  },
  [ActionTypes.UPDATE_RASTER_CHART_POST_FILTER](
    state,
    { chartId, index, setter }
  ) {
    const chart = state[chartId]
    const layers = chart.layers
    const currentLayer = chart.currentLayer || 0
    const postFilters =
      layers && layers[currentLayer] && layers[currentLayer].postFilters
        ? over(lensIndex(index), setter, layers[currentLayer].postFilters)
        : over(lensIndex(index), setter, chart.postFilters)

    if (layers && layers[currentLayer] && layers[currentLayer].postFilters) {
      return {
        ...state,
        [chartId]: {
          ...chart,
          layers: adjust((l) => ({ ...l, postFilters }), currentLayer, layers),
          postFilters
        }
      }
    } else {
      return {
        ...state,
        [chartId]: {
          ...chart,
          postFilters
        }
      }
    }
  },
  [ActionTypes.UPDATE_RASTER_GEOHEAT_DIMENSION](
    state,
    { chartId, index, setter }
  ) {
    const chart = state[chartId]
    const dimensions = over(lensIndex(index), setter, chart.dimensions)
    return {
      ...state,
      [chartId]: {
        ...chart,
        dimensions
      }
    }
  },
  [SELECT_GEO_JOIN_DATA_SOURCE](state, { chartId, dataSource }) {
    const chart = state[chartId]
    return {
      ...state,
      [chartId]: {
        ...chart,
        geoJoin: { table: dataSource }
      }
    }
  },
  [ActionTypes.UPDATE_GEO_JOIN_COLUMN](state, { chartId, column }) {
    const chart = state[chartId]
    return {
      ...state,
      [chartId]: {
        ...chart,
        geoJoin: { ...chart.geoJoin, column }
      }
    }
  },
  [ActionTypes.REMOVE_GEO_JOIN_DATA_SOURCE](state, { chartId }) {
    const chart = dissoc("geoJoin", state[chartId])
    return {
      ...state,
      [chartId]: chart
    }
  },
  [ActionTypes.UPDATE_RASTER_LAYER_FILTERS](
    state,
    { chartId, layerId, filters }
  ) {
    // this action called only for poly filters, and we won't allow to filter from Master layer
    // if there are more than one poly layers within a chart. However, we allow to clear filters
    // from global filter button for all poly layers.
    const chart = state[chartId]
    if (layerId !== "master") {
      return {
        ...state,
        [chartId]: {
          ...chart,
          layers: mergeAtIndex(layerId, { filters }, chart.layers)
        }
      }
    } else if (layerId === "master" && !filters.length) {
      // Dashboard filter clearing will delete filters for all layers.
      return {
        ...state,
        [chartId]: {
          ...chart,
          layers: chart.layers.map((layer) => {
            if (layer.filters) {
              return {
                ...layer,
                filters
              }
            } else {
              return layer
            }
          })
        }
      }
    } else {
      return state
    }
  },
  [ActionTypes.UPDATE_MEASURES_DOMAINS](state, { chartId, domains }) {
    return reduce(
      (nextState, domain) => {
        const { measures, ...chart } = nextState[chartId]
        const measureIndex = findIndex(
          (measure) => measure.name === domain.name,
          measures
        )

        if (domain.name !== "color") {
          const nextMeasure = { [domain.key]: domain.domain }
          const nextMeasures = mergeAtIndex(measureIndex, nextMeasure, measures)

          return {
            ...nextState,
            [chartId]: {
              ...chart,
              measures: nextMeasures
            }
          }
        } else if (measures[measureIndex].type === "STR") {
          const nextMeasure = {
            colorType: "ordinal",
            [domain.key]: domain.domain
          }
          const nextMeasures = mergeAtIndex(measureIndex, nextMeasure, measures)
          const nextColor = customOrdinalColor(nextMeasures[measureIndex])

          return {
            ...nextState,
            [chartId]: {
              ...chart,
              color: nextColor,
              measures: nextMeasures
            }
          }
        } else {
          const nextMeasure = {
            colorType: "quantitative",
            [domain.key]: domain.domain
          }
          const nextMeasures = mergeAtIndex(measureIndex, nextMeasure, measures)

          return {
            ...state,
            [chartId]: {
              ...chart,
              color: getColors(MEASURE_DEFAULT_COLORS).quantitative,
              measures: nextMeasures
            }
          }
        }
      },
      state,
      domains
    )
  },
  [ActionTypes.CLEAR_RASTER_MAP_ZOOM_CENTER](state, { chartId }) {
    const chart = state[chartId]

    return {
      ...state,
      [chartId]: {
        ...chart,
        mapZoomCenter: undefined
      }
    }
  },
  [ActionTypes.TOGGLE_LINKED_ZOOM](state, { chartId, linkedZoom }) {
    const chart = state[chartId]
    return {
      ...state,
      [chartId]: {
        ...chart,
        linkedZoomEnabled: linkedZoom
      }
    }
  },
  [ActionTypes.ADD_POPUP_COLUMN](state, { chartId, column }) {
    const hoverSelectedColumns = Array.from(state[chartId].hoverSelectedColumns)
    const dimensions = Array.from(state[chartId].dimensions).filter(
      isSelectorUsable
    )

    // Only add the same columns if they have different aggregate values
    if (
      !hoverSelectedColumns.filter((hc) =>
        column.aggType && dimensions.length
          ? column.aggType === hc.aggType &&
            column.value === hc.value &&
            column.label === hc.label
          : column.aggType === "Custom"
          ? isEqual(column, hc)
          : column.value === hc.value
      ).length
    ) {
      // changing measure column selection where selector has name property
      const existingMeasureIdx = findIndex(
        (hc) => column.name && hc.name && hc.name === column.name,
        hoverSelectedColumns
      )

      if (existingMeasureIdx > -1) {
        // updating the measure
        hoverSelectedColumns[existingMeasureIdx] = column
      } else {
        // adding new measure
        hoverSelectedColumns.push(column)
      }
    }
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        hoverSelectedColumns
      }
    }
  },
  [ActionTypes.UPDATE_POPUP_COLUMN](state, { chartId, updatedColumn }) {
    const hoverSelectedColumns = Array.from(state[chartId].hoverSelectedColumns)
    const measures = Array.from(state[chartId].measures)

    const updateColumnIndex = hoverSelectedColumns.reduce((c, v, i) => {
      if (
        (v.value === updatedColumn.value &&
          updatedColumn.aggType === v.aggType) ||
        (v.value === updatedColumn.value && v.name === updatedColumn.name)
      ) {
        c.push(i)
      }
      return c
    }, [])

    if (!updateColumnIndex.length) {
      // In this case, the this measure column is removed from hoverSelectedColumns previously because it had the same aggregate
      const newPopupColumn = {
        ...updatedColumn,
        format: getDefaultFormat(updatedColumn.type)
      }
      hoverSelectedColumns.push(newPopupColumn)
    } else if (updateColumnIndex.length > 1) {
      // In this case, there is duplicate column with the same value and the same aggregate
      // Thus, no need to update. Also need to remove the duplicate
      for (let i = 1; i < updateColumnIndex.length; i++) {
        hoverSelectedColumns.splice(updateColumnIndex[i], 1)
      }
    } else {
      // In this case, updating current measure selector's aggregate in popup columns
      hoverSelectedColumns[updateColumnIndex[0]] = {
        ...hoverSelectedColumns[updateColumnIndex[0]],
        aggType: updatedColumn.aggType
      }

      // In addition to updating the current measure aggregate above, we need to check if chart measures has other measure
      // columns with the same value but with different aggregate. If so, we should add back to the hoverSelectedColumns
      const duplicateMeasure = measures.find(
        (mes) =>
          mes.value === updatedColumn.value &&
          mes.aggType !== updatedColumn.aggType &&
          mes.name !== updatedColumn.name
      )

      if (
        duplicateMeasure &&
        duplicateMeasure.aggType !== updatedColumn.aggType
      ) {
        // Make sure it is not in hoverSelectedColumns
        const existsInHoverColumns = hoverSelectedColumns.find(
          (hsc) =>
            hsc.value === duplicateMeasure.value &&
            hsc.aggType === duplicateMeasure.aggType &&
            hsc.name === duplicateMeasure.name
        )
        // adding it to hoverSelectedColumns
        if (!existsInHoverColumns) {
          const newPopupColumn = {
            ...duplicateMeasure,
            format: getDefaultFormat(duplicateMeasure.type)
          }
          hoverSelectedColumns.push(newPopupColumn)
        }
      }
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        hoverSelectedColumns
      }
    }
  },
  [ActionTypes.UPDATE_POPUP_COLUMNS](state, { chartId, hoverSelectedColumns }) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        hoverSelectedColumns
      }
    }
  },
  [ActionTypes.REMOVE_POPUP_COLUMN](state, { chartId, column }) {
    const hoverSelectedColumns = Array.from(state[chartId].hoverSelectedColumns)

    const removeColumnIndex = hoverSelectedColumns.findIndex(
      (hc) =>
        hc.value === column.value &&
        // check if auto populated measure as popup column or manually added popup column
        (column.aggType ? hc.aggType && hc.aggType === column.aggType : true)
    )

    if (removeColumnIndex < 0) {
      return state
    }

    hoverSelectedColumns.splice(removeColumnIndex, 1)

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        hoverSelectedColumns
      }
    }
  },
  [ActionTypes.UPDATE_POPUP_COLUMN_FORMAT](
    state,
    { chartId, selectedColumn, columnFormat }
  ) {
    const chart = state[chartId]

    // Right now, we update format for all duplicate columns even they have different aggregate value.
    const updatedHoverSelectedColumns = chart.hoverSelectedColumns.map(
      (hsc) => {
        if (hsc.value === selectedColumn.value) {
          return {
            ...hsc,
            format: columnFormat
          }
        } else {
          return hsc
        }
      }
    )

    return {
      ...state,
      [chartId]: {
        ...chart,
        hoverSelectedColumns: updatedHoverSelectedColumns
      }
    }
  },
  [ActionTypes.SET_PRIORITIZED_COLOR](state, { chartId, option }) {
    // assumes there can be multiple prioritized color category
    let prioritizedColor = state[chartId].color.prioritizedColor
      ? Array.from(state[chartId].color.prioritizedColor)
      : []

    prioritizedColor = option ? [option] : [] // currently only one prioritized color accepted, so overwrite the existing array
    const chart = state[chartId]
    const newColor = {
      ...chart.color,
      prioritizedColor
    }

    return {
      ...state,
      [chartId]: {
        ...chart,
        color: chart.color?.type === "custom" ? newColor : chart.color
      }
    }
  },
  [ActionTypes.CONTOUR_INTERVALS_CHANGED](
    state,
    { chartId, intervalSize, intervalSubdivisions }
  ) {
    const chart = state[chartId]
    return {
      ...state,
      [chartId]: {
        ...chart,
        majorContourSettings: {
          ...chart.majorContourSettings,
          intervalSize
        },
        minorContourSettings: {
          ...chart.minorContourSettings,
          intervalSubdivisions
        }
      }
    }
  },

  [ActionTypes.CONTOUR_MAJOR_INTERVAL_SETTINGS_CHANGED](
    state,
    { chartId, updates }
  ) {
    const chart = state[chartId]
    return {
      ...state,
      [chartId]: {
        ...chart,
        majorContourSettings: {
          ...chart.majorContourSettings,
          ...updates
        }
      }
    }
  },
  [ActionTypes.CONTOUR_MINOR_INTERVAL_SETTINGS_CHANGED](
    state,
    { chartId, updates }
  ) {
    const chart = state[chartId]
    return {
      ...state,
      [chartId]: {
        ...chart,
        minorContourSettings: {
          ...chart.minorContourSettings,
          ...updates
        }
      }
    }
  },
  [ActionTypes.CONTOUR_GRID_CELL_SETTINGS_CHANGED](
    state,
    { chartId, field, value }
  ) {
    const chart = state[chartId]
    return {
      ...state,
      [chartId]: {
        ...chart,
        griddingCell: {
          ...chart.griddingCell,
          [field]: value
        }
      }
    }
  },
  [ActionTypes.ADD_CROSS_SECTION_LINE_SELECTION]: produce(
    (state, { chartId, lineSelection }) => {
      const chart = state[chartId]
      chart.crossSectionLineSelection = lineSelection
    }
  ),
  [ActionTypes.UPDATE_RASTER_CHART_COLOR_PALETTE]: produce(
    (state, { chartId, color, chartColor }) => {
      const chart = state[chartId]
      chart.color = {
        ...customCategoricalColor({
          value: chartColor.column,
          categories: chartColor.customDomain,
          type: chartColor.defaultOtherDomain,
          hideOther: chartColor.hideOther,
          initMinMax: chartColor.initialDomain,
          color
        }),
        // Keep this around as well
        lastPaletteMappingId: chartColor.lastPaletteMappingId
      }
    }
  )
}
