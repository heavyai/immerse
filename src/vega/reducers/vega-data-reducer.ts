// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as vegaConstants from "vega/constants/vega-data-action-types"
import { getErrorMessageFromBackendError } from "utils/error-handling-helpers"

export default {
  [vegaConstants.DATA_LOADED](state, { id }) {
    return {
      ...state,
      [id]: {
        ...state[id],
        isLoadingData: false
      }
    }
  },

  [vegaConstants.RECEIVE_DATA](state, { id, data, dataName }) {
    const currentData =
      state[id].data &&
      !Array.isArray(state[id].data) &&
      typeof state[id].data === "object"
        ? state[id].data
        : {}
    const chart =
      typeof dataName === "string"
        ? {
            ...state[id],
            data: {
              ...currentData,
              [dataName]: data
            }
          }
        : {
            ...state[id],
            data
          }

    return {
      ...state,
      [id]: chart
    }
  },

  [vegaConstants.RECEIVE_DATA_MULTI](
    state,
    { chartId, dataKey, layerIndex, beatId, data }
  ) {
    const currentData = state[chartId].data?.[dataKey]
    const newData = Array.isArray(currentData) ? [...currentData] : []

    const beatIds = Object.keys(newData[layerIndex] || {}).sort(
      ([keyA], [keyB]) => Number(keyB) - Number(keyA)
    )

    // Update data only if this beat id isn't less than those already stored
    if (beatIds.length && Number(beatId) >= Number(beatIds[0])) {
      if (data.incomplete) {
        newData[layerIndex] = {
          ...newData[layerIndex],
          [beatId]: data
        }
      } else {
        newData[layerIndex] = {
          [beatId]: data
        }
      }

      return {
        ...state,
        [chartId]: {
          ...state[chartId],
          data: {
            ...state[chartId].data,
            [dataKey]: newData
          }
        }
      }
    } else {
      return state
    }
  },

  [vegaConstants.RECEIVE_ERROR](
    state,
    { chartId, dataKey, layerIndex, beatId, error }
  ) {
    const currentData = state[chartId].data?.[dataKey]
    const newData = Array.isArray(currentData) ? [...currentData] : []

    const beatIds = Object.keys(newData[layerIndex] || {}).sort(
      ([keyA], [keyB]) => Number(keyB) - Number(keyA)
    )

    const errorMessage = getErrorMessageFromBackendError(error)

    // Update data only if this beat id isn't less than those already stored
    if (
      beatIds.length &&
      Number(beatId) >= Number(beatIds[beatIds.length - 1])
    ) {
      newData[layerIndex] = {
        [beatId]: {
          minmaxQuery: null,
          minmax: null,
          groupByDimensionQuery: null,
          groupByDimension: null,
          tableQuery: null,
          table: null,
          error: errorMessage
        }
      }

      return {
        ...state,
        [chartId]: {
          ...state[chartId],
          data: {
            ...state[chartId].data,
            [dataKey]: newData
          }
        }
      }
    } else {
      return state
    }
  },

  [vegaConstants.REQUEST_DATA](
    state,
    { chartId, dataKey, layerIndex, beatId }
  ) {
    const currentData = state[chartId].data?.[dataKey]
    const newData = Array.isArray(currentData) ? [...currentData] : []

    if (typeof newData[layerIndex] !== "object") {
      newData[layerIndex] = {
        [beatId]: null
      }
    } else {
      newData[layerIndex] = {
        ...newData[layerIndex],
        [beatId]: null
      }
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        data: {
          ...state[chartId].data,
          [dataKey]: newData
        }
      }
    }
  }
}
