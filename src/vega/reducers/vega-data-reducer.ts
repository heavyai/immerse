// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as vegaConstants from "vega/constants/vega-data-action-types"

export default {
  [vegaConstants.DATA_LOADED](state, { id }) {
    return {
      ...state,
      [id]: {
        ...state[id],
        isLoadingData: false
      }
    }
  }
}
