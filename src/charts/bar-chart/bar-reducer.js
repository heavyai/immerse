// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as actions from "./bar-action-creators"
import { clone, update } from "ramda"
import { Y_AXIS_ORIENTATIONS } from "constants/charts"
import { getLabel } from "./utils"

export default {
  [actions.RECEIVE_BAR_CHART_DATA](state, { id, data }) {
    return {
      ...state,
      [id]: {
        ...state[id],
        data,
        isLoadingData: false
      }
    }
  },
  [actions.REQUEST_BAR_CHART_DATA](state, { id }) {
    return {
      ...state,
      [id]: {
        ...state[id],
        isLoadingData: true
      }
    }
  },
  [actions.SET_BAR_CHART_X_AXIS_LABEL](state, { id, label }) {
    const dimensions = clone(state[id].dimensions)
    dimensions[0].axisLabel = label
    return {
      ...state,
      [id]: {
        ...state[id],
        dimensions
      }
    }
  },
  [actions.SET_BAR_CHART_Y_AXIS_LABEL](state, { id, label }) {
    const measures = clone(state[id].measures)

    // look up our existing label. If we're not changing from the CALCULATED
    // value, then don't modify the state. This is because the label could be
    // an aggregate field - `${aggType} ${label}`, and the user could persist it
    // by mistake
    const existingLabel = getLabel(measures[0])
    if (label === existingLabel) {
      return state
    }

    measures[0].axisLabel = label
    return {
      ...state,
      [id]: {
        ...state[id],
        measures
      }
    }
  },
  [actions.SET_BAR_CHART_Y_AXIS_DOMAIN](state, { id, extent }) {
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
  [actions.SET_BAR_CHART_X_AXIS_DOMAIN](state, { id, extent }) {
    const dimensions = clone(state[id].dimensions)
    dimensions[0].currentLowValue = extent[0]
    dimensions[0].currentHighValue = extent[1]
    return {
      ...state,
      [id]: {
        ...state[id],
        dimensions,
        elasticX: false
      }
    }
  },
  [actions.TOGGLE_BAR_CHART_X_DOMAIN_LOCK](state, { id, isLocked }) {
    const dimensions = clone(state[id].dimensions)
    if (isLocked) {
      dimensions[0].currentLowValue = dimensions[0].min_val
      dimensions[0].currentHighValue = dimensions[0].max_val
    }
    return {
      ...state,
      [id]: {
        ...state[id],
        dimensions,
        elasticX: !isLocked
      }
    }
  },
  [actions.TOGGLE_BAR_CHART_Y_DOMAIN_LOCK](state, { id, isLocked, extent }) {
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
  [actions.SET_BAR_CHART_BINNING](state, { id, bin }) {
    const dimensions = clone(state[id].dimensions)
    dimensions[0].autobin = false
    dimensions[0].timeBin = bin
    return {
      ...state,
      [id]: {
        ...state[id],
        dimensions
      }
    }
  },
  [actions.SET_BAR_CHART_AUTO_BIN](state, { id, isSelected }) {
    const dimensions = clone(state[id].dimensions)
    if (isSelected) {
      dimensions[0].autobin = true
      dimensions[0].timeBin = "auto"
      return {
        ...state,
        [id]: {
          ...state[id],
          dimensions
        }
      }
    } else {
      return state
    }
  },
  [actions.DISABLE_BAR_CHART_DIMENSION](state, { id, index }) {
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
  [actions.ENABLE_BAR_CHART_DIMENSION](state, { id, index }) {
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
  [actions.DISABLE_BAR_CHART_MEASURE](state, { id, index }) {
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
  [actions.ENABLE_BAR_CHART_MEASURE](state, { id, index }) {
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
  [actions.RESET_BAR_CHART_COLORS](state, { id }) {
    const chart = state[id]
    const { key, val } = chart.color
    const newColor = {
      type: "solid",
      defaultOtherDomain: "Default",
      key,
      val
    }
    return {
      ...state,
      [id]: {
        ...chart,
        color: newColor
      }
    }
  },
  [actions.ADD_BAR_CHART_FILTER](state, { id, value }) {
    const chart = state[id]
    const { filters } = chart
    return {
      ...state,
      [id]: {
        ...chart,
        filters: [...filters, value]
      }
    }
  },
  [actions.REMOVE_BAR_CHART_FILTER](state, { id, value }) {
    const chart = state[id]
    const { filters } = chart
    return {
      ...state,
      [id]: {
        ...chart,
        filters: filters.filter((d) => d !== value)
      }
    }
  }
}
