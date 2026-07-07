// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as rasterConstants from "vega/constants/raster-action-types"

export default {
  [rasterConstants.REQUEST_RASTER_DATA](state, { id }) {
    return {
      ...state,
      [id]: {
        ...state[id],
        isLoadingData: true
      }
    }
  },

  [rasterConstants.RECEIVE_RASTER_DATA](state, { id, data }) {
    return {
      ...state,
      [id]: {
        ...state[id],
        data,
        isLoadingData: false
      }
    }
  }
}
