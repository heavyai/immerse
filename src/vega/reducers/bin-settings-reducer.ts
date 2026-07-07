// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as binSettingsConstants from "vega/constants/bin-settings-action-types"
import { CLEAR_BY_NAME } from "../constants/filter-action-types"
import { isRangeChartFilterName } from "../utils/filter"

export default {
  [binSettingsConstants.SET_CHART_BIN](state, { chartId, binSettings }) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        binSettings
      }
    }
  },

  [binSettingsConstants.CLEAR_CHART_BIN](state, { chartId }) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        binSettings: null
      }
    }
  },

  [binSettingsConstants.SET_BINNING_NUMBER_OF_BINS](
    state,
    { chartId, numOfBins }
  ) {
    const binSettings = state[chartId].binSettings

    if (binSettings.dimensionType === "binned_numeric") {
      return {
        ...state,
        [chartId]: {
          ...state[chartId],
          binSettings: {
            ...state[chartId].binSettings,
            numOfBins
          }
        }
      }
    } else {
      return state
    }
  },

  [binSettingsConstants.SET_BINNING_TIME_UNIT](state, { chartId, timeUnit }) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        binSettings: {
          ...state[chartId].binSettings,
          timeUnit
        }
      }
    }
  },

  [binSettingsConstants.SET_EXTRACT_TIME_UNIT](state, { chartId, timeUnit }) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        binSettings: {
          ...state[chartId].binSettings,
          timeUnit
        }
      }
    }
  },

  [binSettingsConstants.SET_BINNING_MANUAL_MIN](state, { chartId, min }) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        binSettings: {
          ...state[chartId].binSettings,
          manualMin: min
        }
      }
    }
  },

  [binSettingsConstants.SET_BINNING_MANUAL_MAX](state, { chartId, max }) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        binSettings: {
          ...state[chartId].binSettings,
          manualMax: max
        }
      }
    }
  },

  [binSettingsConstants.SET_BINNING_MANUAL_MIN_MAX](
    state,
    { chartId, minmax }
  ) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        binSettings: {
          ...state[chartId].binSettings,
          manualMin: minmax[0],
          manualMax: minmax[1]
        }
      }
    }
  },

  [binSettingsConstants.CLEAR_BINNING_MANUAL_MIN](state, { chartId }) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        binSettings: {
          ...state[chartId].binSettings,
          manualMin: null
        }
      }
    }
  },

  [binSettingsConstants.CLEAR_BINNING_MANUAL_MAX](state, { chartId }) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        binSettings: {
          ...state[chartId].binSettings,
          manualMax: null
        }
      }
    }
  },

  [binSettingsConstants.SET_BASE_DIMENSION_FORMAT](
    state,
    { chartId, baseDimensionFormat }
  ) {
    // If we explicitly turned binning off, binSettings will be null. In this
    // state, we can still set the format, though. When we do that, we'll set
    // dimensionType to "unbinned".
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        binSettings: {
          dimensionType: "unbinned",
          ...state[chartId].binSettings,
          format: baseDimensionFormat
        }
      }
    }
  },

  // Clear manual min/max if clearing a range chart filter by name
  [CLEAR_BY_NAME](state, { name, chartId }) {
    if (!chartId) {
      return state
    }

    const binSettings = state[chartId]?.binSettings
    if (
      isRangeChartFilterName(name) &&
      (binSettings?.manualMin || binSettings?.manualMax)
    ) {
      return {
        ...state,
        [chartId]: {
          ...state[chartId],
          binSettings: {
            ...state[chartId].binSettings,
            manualMin: null,
            manualMax: null
          }
        }
      }
    }
    return state
  }
}
