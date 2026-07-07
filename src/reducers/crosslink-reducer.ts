// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { cloneDeep } from "lodash"

import createReducer from "utils/redux/create-reducer"
import {
  SAVE_CROSSLINK,
  TOGGLE_CROSSLINK,
  DELETE_CROSSLINK
} from "constants/action-types"
import { CrossLink } from "constants/crosslink-types"

type CrossLinkState = CrossLink[]
export const initialState: CrossLinkState = []

const reducer = {
  [SAVE_CROSSLINK](
    state: CrossLinkState,
    { crosslink }: { crosslink: CrossLink }
  ): CrossLinkState {
    const newState = [...state]
    const idx = newState.findIndex(({ id }) => id === crosslink.id)
    if (idx >= 0) {
      newState[idx] = cloneDeep(crosslink)
    } else {
      newState.push(cloneDeep(crosslink))
    }
    return newState
  },

  [TOGGLE_CROSSLINK](
    state: CrossLinkState,
    { id: toggleId }: { id: CrossLink["id"] }
  ): CrossLinkState {
    const newState = [...state]
    const idx = newState.findIndex(({ id }) => id === toggleId)
    if (idx >= 0) {
      const enabled = !newState[idx].enabled
      newState[idx] = {
        ...newState[idx],
        enabled
      }
    }
    return newState
  },

  [DELETE_CROSSLINK](
    state: CrossLinkState,
    { id: removedId }: { id: CrossLink["id"] }
  ): CrossLinkState {
    return state.filter(({ id }) => id !== removedId)
  }
}

export default createReducer(reducer, initialState)
