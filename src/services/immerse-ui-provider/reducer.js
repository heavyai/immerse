// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  SET_IMMERSE_UI_KEY,
  SET_IMMERSE_UI_KEYS,
  ENABLE_ALL_IMMERSE_UI_KEYS,
  DISABLE_ALL_IMMERSE_UI_KEYS
} from "./constants"

const reducer = (state, action) => {
  switch (action.type) {
    case SET_IMMERSE_UI_KEY: {
      const { key, value } = action.payload
      return {
        ...state,
        [key]: value
      }
    }
    case SET_IMMERSE_UI_KEYS: {
      const config = action.payload
      return {
        ...state,
        ...config
      }
    }
    case ENABLE_ALL_IMMERSE_UI_KEYS: {
      return Object.keys(state).reduce((bucket, key) => {
        return { ...bucket, [key]: true }
      }, {})
    }
    case DISABLE_ALL_IMMERSE_UI_KEYS: {
      return Object.keys(state).reduce((bucket, key) => {
        return { ...bucket, [key]: false }
      }, {})
    }
    default:
      return state
  }
}

export default reducer
