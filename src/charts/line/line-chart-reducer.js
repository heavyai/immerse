// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as ActionTypes from "./line-chart-action-creators"
import { X_ENCODING_INDEX, Y_ENCODING_INDEX } from "./line-chart-constants"
import addDimensionReducer from "reducers/charts/add-dimension-reducer"
import addMeasureReducer from "reducers/charts/add-measure-reducer"
import clearSelectorReducer from "reducers/charts/clear-selector-reducer"
import updateSelectorReducer from "reducers/charts/update-selector-reducer"

export default {
  [ActionTypes.TOGGLE_BINNING](state, { id }) {
    const dimensions = state[id].dimensions.slice()
    const { isBinned } = dimensions[X_ENCODING_INDEX]
    dimensions[X_ENCODING_INDEX].isBinned = !isBinned

    return {
      ...state,
      [id]: {
        ...state[id],
        dimensions
      }
    }
  },
  [ActionTypes.SYNC_BIN_INTERVAL](state, { id, interval }) {
    const dimensions = state[id].dimensions.slice()
    dimensions[X_ENCODING_INDEX].timeBin = interval

    return {
      ...state,
      [id]: {
        ...state[id],
        dimensions
      }
    }
  },
  [ActionTypes.CLEAR_LINE_CHART_FILTERS](state, { id }) {
    return {
      ...state,
      [id]: {
        ...state[id],
        filters: [],
        rangeFilter: []
      }
    }
  },
  [ActionTypes.RESET_LINE_CHART](state, { id, spec }) {
    return {
      ...state,
      [id]: {
        ...state[id],
        ...spec
      }
    }
  },
  [ActionTypes.UPDATE_NUM_BINS](state, { id, numBins }) {
    const dimensions = state[id].dimensions.slice()
    dimensions[X_ENCODING_INDEX].numOfBins = numBins

    return {
      ...state,
      [id]: {
        ...state[id],
        dimensions
      }
    }
  },
  [ActionTypes.UPDATE_BIN_EXTENT](state, { id, extent }) {
    const dimensions = state[id].dimensions.slice()
    dimensions[X_ENCODING_INDEX].currentLowValue = extent[0]
    dimensions[X_ENCODING_INDEX].currentHighValue = extent[1]

    return {
      ...state,
      [id]: {
        ...state[id],
        dimensions
      }
    }
  },
  [ActionTypes.UPDATE_LINE_MEASURE_AGGTYPE](state, { id, aggType }) {
    const measures = state[id].measures.slice()
    measures[Y_ENCODING_INDEX].aggType = aggType

    return {
      ...state,
      [id]: {
        ...state[id],
        measures
      }
    }
  },
  [ActionTypes.UPDATE_DATETRUNC_INTERVAL](state, { id, interval }) {
    const dimensions = state[id].dimensions.slice()
    dimensions[X_ENCODING_INDEX].timeBin = interval
    dimensions[X_ENCODING_INDEX].extract = false

    return {
      ...state,
      [id]: {
        ...state[id],
        dimensions
      }
    }
  },
  [ActionTypes.UPDATE_EXTRACT_INTERVAL](state, { id, interval }) {
    const dimensions = state[id].dimensions.slice()
    dimensions[X_ENCODING_INDEX].timeBin = interval
    dimensions[X_ENCODING_INDEX].extract = true
    dimensions[X_ENCODING_INDEX].autobin = false

    return {
      ...state,
      [id]: {
        ...state[id],
        dimensions
      }
    }
  },
  [ActionTypes.TOGGLE_RANGE_CHART_OFF](state, { id }) {
    return {
      ...state,
      [id]: {
        ...state[id],
        rangeChartEnabled: false
      }
    }
  },
  [ActionTypes.TOGGLE_RANGE_CHART_ON](state, { id }) {
    return {
      ...state,
      [id]: {
        ...state[id],
        rangeChartEnabled: true
      }
    }
  },
  [ActionTypes.UPDATE_LINE_SOLID_COLOR](state, { id, updates }) {
    return {
      ...state,
      [id]: {
        ...state[id],
        ...updates
      }
    }
  },
  [ActionTypes.UPDATE_LINE_CHART](state, { id, updates }) {
    return {
      ...state,
      [id]: {
        ...state[id],
        ...updates
      }
    }
  },
  [ActionTypes.REMOVE_LINE_CHART_DIMENSION]: (state, { id, index }) =>
    clearSelectorReducer(state, {
      chartId: id,
      selectorType: "dimensions",
      selectorIndex: index
    }),
  [ActionTypes.REMOVE_LINE_CHART_MEASURE]: (state, { id, index }) =>
    clearSelectorReducer(state, {
      chartId: id,
      selectorType: "measures",
      selectorIndex: index
    }),
  [ActionTypes.ADD_LINE_CHART_DIMENSION](state, { id, ...rest }) {
    return addDimensionReducer(state, { chartId: id, ...rest })
  },
  [ActionTypes.ADD_LINE_CHART_MEASURE](state, { id, ...rest }) {
    return addMeasureReducer(state, { chartId: id, ...rest })
  },
  [ActionTypes.UPDATE_LINE_CHART_MEASURE](state, { id, index, setter }) {
    return updateSelectorReducer(state, {
      chartId: id,
      selectorType: "measures",
      selectorIndex: index,
      setter
    })
  },
  [ActionTypes.UPDATE_LINE_CHART_DIMENSION](state, { id, index, setter }) {
    return updateSelectorReducer(state, {
      chartId: id,
      selectorType: "dimensions",
      selectorIndex: index,
      setter
    })
  }
}
