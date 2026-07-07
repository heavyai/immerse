// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as line2ActionTypes from "./line2-action-creators"
import { clone, update } from "ramda"
import {
  getColorDimensionIndex,
  getXAxisDimensionIndex,
  isXAxisDimension
} from "reducers/charts/helpers/multi-source-helpers"
import { X_AXIS_DIMENSION_LABEL } from "./line2-consts"
import { Y_AXIS_ORIENTATIONS } from "constants/charts"

export default {
  [line2ActionTypes.RECEIVE_DATA](state, { id, data }) {
    return {
      ...state,
      [id]: {
        ...state[id],
        data,
        isLoadingData: false
      }
    }
  },
  [line2ActionTypes.REQUEST_DATA](state, { id }) {
    return {
      ...state,
      [id]: {
        ...state[id],
        isLoadingData: true
      }
    }
  },
  [line2ActionTypes.REQUEST_RANGE_DATA](state, { id }) {
    return {
      ...state,
      [id]: {
        ...state[id],
        isLoadingRangeData: true
      }
    }
  },
  [line2ActionTypes.RECEIVE_RANGE_DATA](state, { id, rangeData }) {
    return {
      ...state,
      [id]: {
        ...state[id],
        rangeData,
        isLoadingRangeData: false
      }
    }
  },
  [line2ActionTypes.ENABLE_RANGE_CHART](state, { id, shouldBeOn }) {
    return {
      ...state,
      [id]: {
        ...state[id],
        rangeChartEnabled: shouldBeOn,
        // we want the range filter to stay on even if the range chart is no longer visible.
        // So we don't clear the rangeFilter when we toggle whether the range chart is enabled. We do need to
        // wipe out the rangeData so it properly draws when it's re-enabled, though.
        // rangeFilter: [],
        rangeData: {}
      }
    }
  },
  [line2ActionTypes.SET_CUSTOM_X_DOMAIN_LABEL]: (charts, { id, label }) => ({
    ...charts,
    [id]: {
      ...charts[id],
      customXDomainLabel: label
    }
  }),
  [line2ActionTypes.SET_X_AXIS_LABEL](state, { id, label }) {
    const chart = state[id]
    const dimensions = chart.dimensions.map((dimension) =>
      isXAxisDimension(dimension)
        ? {
            ...dimension,
            axisLabel: label
          }
        : dimension
    )
    return {
      ...state,
      [id]: {
        ...state[id],
        dimensions
      }
    }
  },
  [line2ActionTypes.SET_Y_AXIS_LABEL](state, { id, label }) {
    return {
      ...state,
      [id]: {
        ...state[id],
        yAxisLabel: label
      }
    }
  },
  [line2ActionTypes.SET_Y2_AXIS_LABEL](state, { id, label }) {
    return {
      ...state,
      [id]: {
        ...state[id],
        y2AxisLabel: label
      }
    }
  },
  [line2ActionTypes.SET_Y_AXIS_DOMAIN](state, { id, extent }) {
    const measures = clone(state[id].measures)
    measures.forEach((measure) => {
      if (measure.yAxisOrientation !== Y_AXIS_ORIENTATIONS.RIGHT) {
        measure.minMax = extent
      }
    })
    return {
      ...state,
      [id]: {
        ...state[id],
        measures,
        elasticY: false
      }
    }
  },
  [line2ActionTypes.SET_Y2_AXIS_DOMAIN](state, { id, extent }) {
    const measures = clone(state[id].measures)
    measures.forEach((measure) => {
      if (measure.yAxisOrientation === Y_AXIS_ORIENTATIONS.RIGHT) {
        measure.minMax = extent
      }
    })
    return {
      ...state,
      [id]: {
        ...state[id],
        measures,
        elasticY2: false
      }
    }
  },
  [line2ActionTypes.SET_X_AXIS_DOMAIN](state, { id, extent }) {
    const chart = state[id]
    const dimensions = chart.dimensions.map((dimension) =>
      isXAxisDimension(dimension)
        ? {
            ...dimension,
            currentLowValue: extent[0],
            currentHighValue: extent[1]
          }
        : dimension
    )

    return {
      ...state,
      [id]: {
        ...state[id],
        dimensions,
        elasticX: false
      }
    }
  },
  [line2ActionTypes.SET_X_AXIS_DOMAIN_AUTO](state, { chartId, extent }) {
    const chart = state[chartId]
    const dimensions = chart.dimensions.map((dimension) =>
      isXAxisDimension(dimension)
        ? {
            ...dimension,
            currentLowValue: extent[0],
            currentHighValue: extent[1]
          }
        : dimension
    )

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dimensions
      }
    }
  },
  [line2ActionTypes.SET_X_AXIS_DOMAIN_AUTO_MULTI_SOURCE](
    state,
    { chartId, multiSourceIndex, extent }
  ) {
    const chart = state[chartId]
    const index = getXAxisDimensionIndex(chart.dimensions, multiSourceIndex)

    return {
      ...state,
      [chartId]: {
        ...chart,
        dimensions: update(
          index,
          {
            ...chart.dimensions[index],
            currentLowValue: extent[0],
            currentHighValue: extent[1]
          },
          chart.dimensions
        )
      }
    }
  },
  [line2ActionTypes.SET_MARK_TYPE](state, { id, index, newMarkType }) {
    const chart = state[id]
    const { markTypes } = chart
    const newMarkTypes =
      markTypes && Array.isArray(markTypes) ? markTypes.slice() : []
    newMarkTypes[index] = newMarkType // okay to mutate here as it's a copy of the original
    return {
      ...state,
      [id]: {
        ...chart,
        markTypes: newMarkTypes
      }
    }
  },
  [line2ActionTypes.REMOVE_MARK_TYPE](state, { id, index }) {
    const chart = state[id]

    // markTypes may be "sparse", ex: ["line",, "line"] - index 1 is a "hole".
    // filter() will skip holes entirely, removing them from the result. The
    // spread operator will fill holes with undefined to fix the problem.
    const markTypes =
      chart.markTypes && Array.isArray(chart.markTypes)
        ? [...chart.markTypes].filter((markType, idx) => idx !== index)
        : []
    return {
      ...state,
      [id]: {
        ...chart,
        markTypes
      }
    }
  },
  [line2ActionTypes.TOGGLE_X_DOMAIN_LOCK](state, { id, isLocked }) {
    return {
      ...state,
      [id]: {
        ...state[id],
        elasticX: !isLocked
      }
    }
  },
  [line2ActionTypes.CLEAR_X_DOMAIN_LOCKS](state, { id }) {
    const chart = state[id]
    if (chart.elasticX) {
      return state
    }

    const dimensions = chart.dimensions.map((dimension) =>
      isXAxisDimension(dimension)
        ? {
            ...dimension,
            currentLowValue: dimension.min_val,
            currentHighValue: dimension.max_val
          }
        : dimension
    )
    return {
      ...state,
      [id]: {
        ...state[id],
        dimensions,
        elasticX: true
      }
    }
  },
  [line2ActionTypes.TOGGLE_Y_DOMAIN_LOCK](state, { id, isLocked, extent }) {
    const measures = clone(state[id].measures)
    measures.forEach((measure) => {
      if (measure.yAxisOrientation !== Y_AXIS_ORIENTATIONS.RIGHT) {
        measure.minMax = isLocked ? extent : null
      }
    })
    return {
      ...state,
      [id]: {
        ...state[id],
        measures,
        elasticY: !isLocked
      }
    }
  },
  [line2ActionTypes.TOGGLE_Y2_DOMAIN_LOCK](state, { id, isLocked, extent }) {
    const measures = clone(state[id].measures)
    measures.forEach((measure) => {
      if (measure.yAxisOrientation === Y_AXIS_ORIENTATIONS.RIGHT) {
        measure.minMax = isLocked ? extent : null
      }
    })
    return {
      ...state,
      [id]: {
        ...state[id],
        measures,
        elasticY2: !isLocked
      }
    }
  },
  [line2ActionTypes.SET_Y_AXIS_ORIENTATION](state, { id, index, orientation }) {
    const chart = state[id]

    return {
      ...state,
      [id]: {
        ...chart,
        measures: update(
          index,
          {
            ...chart.measures[index],
            yAxisOrientation: orientation,
            minMax: null
          },
          chart.measures
        )
      }
    }
  },
  [line2ActionTypes.SET_EXTRACT](state, { id, extract }) {
    const chart = state[id]
    const dimensions = chart.dimensions.map((dimension) =>
      dimension.name === X_AXIS_DIMENSION_LABEL && dimension.value
        ? {
            ...dimension,
            autobin: false,
            extract: true,
            timeBin: extract,
            dateFormat: null
          }
        : dimension
    )
    return {
      ...state,
      [id]: {
        ...state[id],
        dimensions
      }
    }
  },
  [line2ActionTypes.SET_BINNING](state, { id, bin }) {
    const chart = state[id]
    const dimensions = chart.dimensions.map((dimension) =>
      dimension.name === X_AXIS_DIMENSION_LABEL && dimension.value
        ? {
            ...dimension,
            autobin: false,
            extract: false,
            timeBin: bin
          }
        : dimension
    )

    return {
      ...state,
      [id]: {
        ...state[id],
        dimensions
      }
    }
  },
  [line2ActionTypes.SET_AUTO_BIN](state, { id, isSelected }) {
    const chart = state[id]
    const dimensions = chart.dimensions.map((dimension) =>
      dimension.name === X_AXIS_DIMENSION_LABEL && dimension.value && isSelected
        ? {
            ...dimension,
            autobin: true,
            extract: false,
            timeBin: "auto"
          }
        : dimension
    )
    return {
      ...state,
      [id]: {
        ...state[id],
        dimensions
      }
    }
  },
  [line2ActionTypes.BRUSH_RANGE_CHANGE](state, { id, extent }) {
    return {
      ...state,
      [id]: {
        ...state[id],
        filters: [extent]
      }
    }
  },
  [line2ActionTypes.DISABLE_LINE_CHART_DIMENSION](state, { id, index }) {
    const chart = state[id]
    return {
      ...state,
      [id]: {
        ...chart,
        dimensions: update(
          index,
          { ...chart.dimensions[index], inactive: true },
          chart.dimensions
        )
      }
    }
  },
  [line2ActionTypes.ENABLE_LINE_CHART_DIMENSION](state, { id, index }) {
    const chart = state[id]
    return {
      ...state,
      [id]: {
        ...chart,
        dimensions: update(
          index,
          { ...chart.dimensions[index], inactive: false },
          chart.dimensions
        )
      }
    }
  },
  [line2ActionTypes.ENABLE_LINE_CHART_COLOR_DIMENSION_MULTI_SOURCE](
    state,
    { id, multiSourceIndex }
  ) {
    const chart = state[id]
    const index = getColorDimensionIndex(chart.dimensions, multiSourceIndex)

    return {
      ...state,
      [id]: {
        ...chart,
        dimensions: update(
          index,
          { ...chart.dimensions[index], inactive: false },
          chart.dimensions
        )
      }
    }
  },
  [line2ActionTypes.DISABLE_LINE_CHART_MEASURE](state, { id, index }) {
    const chart = state[id]
    return {
      ...state,
      [id]: {
        ...chart,
        measures: update(
          index,
          { ...chart.measures[index], inactive: true },
          chart.measures
        )
      }
    }
  },
  [line2ActionTypes.ENABLE_LINE_CHART_MEASURE](state, { id, index }) {
    const chart = state[id]
    return {
      ...state,
      [id]: {
        ...chart,
        measures: update(
          index,
          { ...chart.measures[index], inactive: false },
          chart.measures
        )
      }
    }
  },
  [line2ActionTypes.CHANGE_MEASURE_FORMAT](
    state,
    { id, index, format, formatType }
  ) {
    const chart = state[id]
    const measures =
      formatType === "date"
        ? update(
            index,
            {
              ...chart.measures[index],
              dateFormat: format,
              numberFormat: format
            },
            chart.measures
          )
        : update(
            index,
            { ...chart.measures[index], numberFormat: format },
            chart.measures
          )
    return {
      ...state,
      [id]: {
        ...chart,
        measures
      }
    }
  },
  [line2ActionTypes.CHANGE_DIMENSION_FORMAT](
    state,
    { id, format: dateFormat, dimensionIndex }
  ) {
    const chart = state[id]

    const dimensions =
      chart.type === "heat"
        ? chart.dimensions.map((dimension, index) =>
            index === dimensionIndex
              ? {
                  ...dimension,
                  dateFormat
                }
              : dimension
          )
        : chart.dimensions.map((dimension) =>
            dimension.value
              ? {
                  ...dimension,
                  dateFormat
                }
              : dimension
          )

    return {
      ...state,
      [id]: {
        ...chart,
        dimensions
      }
    }
  },
  [line2ActionTypes.CLEAR_AXIS_LABELS](state, { id }) {
    return {
      ...state,
      [id]: {
        ...state[id],
        yAxisLabel: null,
        y2AxisLabel: null
      }
    }
  },
  [line2ActionTypes.SET_COLORS_NOT_DIRTY](state, { id, multiSourceIndex }) {
    const chart = state[id]

    if (multiSourceIndex === undefined) {
      return {
        ...state,
        [id]: {
          ...chart,
          color: {
            ...chart.color,
            domainIsDirty: false
          }
        }
      }
    } else {
      return {
        ...state,
        [id]: {
          ...chart,
          color: {
            ...chart.color,
            [multiSourceIndex]: {
              ...chart.color[multiSourceIndex],
              domainIsDirty: false
            }
          }
        }
      }
    }
  },
  [line2ActionTypes.RESET_COLORS](state, { id, multiSourceIndex }) {
    const chart = state[id]
    const { key, val, lineStyle } =
      multiSourceIndex === undefined
        ? chart.color
        : chart.color[multiSourceIndex]
    const newColor = {
      type: "solid",
      defaultOtherDomain: "Default",
      key,
      val,
      lineStyle
    }
    return {
      ...state,
      [id]: {
        ...chart,
        color: {
          ...chart.color,
          [multiSourceIndex]: newColor
        }
      }
    }
  },
  [line2ActionTypes.SET_CHART_FILTER_STRING_MULTISOURCE](
    state,
    { chartId, multiSourceIndex, filter }
  ) {
    const chart = state[chartId]

    // This property is called "filterString" for historical reasons, even though its an object.
    const filterString =
      typeof chart.filterString === "object" ? { ...chart.filterString } : {}
    filterString[multiSourceIndex] = filter

    return {
      ...state,
      [chartId]: {
        ...chart,
        filterString
      }
    }
  },
  [line2ActionTypes.SET_CHART_BIN_EXTENT_AND_FILTER_STRING_MULTISOURCE](
    state,
    { chartId, multiSourceIndex, extent, filter }
  ) {
    const chart = state[chartId]
    const index = getXAxisDimensionIndex(chart.dimensions, multiSourceIndex)

    // This property is called "filterString" for historical reasons, even though its an object.
    const filterString =
      typeof chart.filterString === "object" ? { ...chart.filterString } : {}
    filterString[multiSourceIndex] = filter

    return {
      ...state,
      [chartId]: {
        ...chart,
        filterString,
        dimensions: update(
          index,
          {
            ...chart.dimensions[index],
            currentLowValue: extent[0],
            currentHighValue: extent[1]
          },
          chart.dimensions
        )
      }
    }
  }
}
