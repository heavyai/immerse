// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import createReducer from "utils/redux/create-reducer"

import {
  RESET_SNAPSHOTS,
  SAVE_SNAPSHOT,
  LOAD_SNAPSHOT,
  DISCARD_SNAPSHOT,
  DISCARD_ALL_SNAPSHOTS
} from "./snapshots-action-creators"

export const initialState = {
  chart: {}
}

const snapshotsReducers = {
  [RESET_SNAPSHOTS]() {
    return initialState
  },
  // if we're saving a named snapshot, then we'll overwrite any previous snapshot with that name.
  // if one doesn't exist, we'll append to the end of the array.
  //
  // if it's an unnamed snapshot, then we'll append it to the end of the list, as long as it isn't a dupe.
  [SAVE_SNAPSHOT](state, action) {
    const { id, snapshot, type, name } = action.payload
    const snapshots = state[type][id] || []
    const newSnapshots = [...snapshots]
    let hasChanges = false
    // do we have snapshots?
    if (snapshots && snapshots.length) {
      // do we have a name?
      if (name !== undefined) {
        const lastSnapIdx = snapshots.findIndex((s) => s.name === name)
        // did we find a snapshot with that name?
        if (lastSnapIdx > 0) {
          // if it's different, then overwrite it
          if (snapshots[lastSnapIdx].snapshot !== snapshot) {
            newSnapshots[lastSnapIdx] = { name, snapshot }
            hasChanges = true
          }
        } else {
          // didn't find it? tack on to end of array
          newSnapshots.push({ name, snapshot })
          hasChanges = true
        }
      } else if (snapshots[snapshots.length - 1].snapshot !== snapshot) {
        // no name, and it's not the same snap? append to end of array
        newSnapshots.push({ name, snapshot })
        hasChanges = true
      }
    } else {
      newSnapshots.push({ name, snapshot })
      hasChanges = true
    }

    if (hasChanges) {
      return {
        ...state,
        [type]: {
          ...state[type],
          [id]: newSnapshots
        }
      }
    } else {
      return state
    }
  },
  [LOAD_SNAPSHOT](state) {
    // this is a placeholder action. I may not add something here.
    return state
  },
  [DISCARD_SNAPSHOT](state, action) {
    const { id, type, name } = action.payload
    const snapshots = state[type][id]
    if (snapshots && snapshots.length) {
      const newSnapshots =
        name === undefined
          ? snapshots.slice(0, snapshots.length - 1)
          : snapshots.filter((snapshot) => snapshot.name !== name)
      return {
        ...state,
        [type]: {
          ...state[type],
          [id]: newSnapshots
        }
      }
    } else {
      return state
    }
  },
  [DISCARD_ALL_SNAPSHOTS](state, action) {
    const { id, type } = action.payload
    const snapshots = state[type][id]
    if (snapshots && snapshots.length) {
      return {
        ...state,
        [type]: {
          ...state[type],
          [id]: []
        }
      }
    } else {
      return state
    }
  }
}

export default createReducer(snapshotsReducers, initialState)
