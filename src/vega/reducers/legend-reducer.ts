// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as legendConstants from "../constants/legend-action-types"

export default {
  [legendConstants.TOGGLE_LEGEND_PINNING](state, { chartId, pinned }) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        layersLegendPinned: pinned
      }
    }
  },
  [legendConstants.TOGGLE_LEGEND_COLLAPSED](
    state,
    { chartId, layerId, collapsed }
  ) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        collapsedLegendLayers: {
          ...state[chartId].collapsedLegendLayers,
          [layerId]: collapsed
        }
      }
    }
  }
}
