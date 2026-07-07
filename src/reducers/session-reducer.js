// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  SET_SESSION_VALID,
  SET_SESSION_INVALID,
  SET_IDLE_SESSION_DURATION,
  SET_MAX_SESSION_DURATION
} from "constants/action-types"

import createReducer from "utils/redux/create-reducer"

export const initialState = {
  valid: false,
  fetching: false,
  idleSessionDuration: null,
  maxSessionDuration: null
}

const reducers = {
  [SET_SESSION_VALID]: (state) => ({
    ...state,
    valid: true
  }),
  [SET_SESSION_INVALID]: (state) => ({
    ...state,
    valid: false
  }),
  [SET_IDLE_SESSION_DURATION]: (state, { idleSessionDuration }) => ({
    ...state,
    idleSessionDuration
  }),
  [SET_MAX_SESSION_DURATION]: (state, { maxSessionDuration }) => ({
    ...state,
    maxSessionDuration
  })
}

export default createReducer(reducers, initialState)
