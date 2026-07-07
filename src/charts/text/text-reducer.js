// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as ActionTypes from "./text-action-creators"

export default {
  [ActionTypes.UPDATE_TEXT](state, { id, text }) {
    return {
      ...state,
      [id]: {
        ...state[id],
        text
      }
    }
  }
}
