// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { doRedrawAll } from "vega/actions/filter-action-creators"
import {
  SAVE_CROSSLINK,
  TOGGLE_CROSSLINK,
  DELETE_CROSSLINK
} from "constants/action-types"
import { CrossLink } from "constants/crosslink-types"

export function saveCrossLink(crosslink: CrossLink) {
  return async function saveCrossLinkThunk(dispatch, getState) {
    const { crossLinks } = getState() as { crossLinks: CrossLink[] }
    const oldCrosslink = crossLinks.find(({ id }) => id === crosslink.id)

    await dispatch({
      type: SAVE_CROSSLINK,
      crosslink
    })

    const dataSources = new Set([crosslink.sourceA, crosslink.sourceB])
    if (oldCrosslink) {
      dataSources.add(oldCrosslink.sourceA)
      dataSources.add(oldCrosslink.sourceB)
    }
    doRedrawAll(dispatch, getState, dataSources, { skipLinked: true })
  }
}

export function toggleCrossLink(id: CrossLink["id"]) {
  return async function toggleCrossLinkThunk(dispatch, getState) {
    const { crossLinks } = getState() as { crossLinks: CrossLink[] }
    const crosslink = crossLinks.find(({ id: thisId }) => thisId === id)

    await dispatch({
      type: TOGGLE_CROSSLINK,
      id
    })

    if (crosslink) {
      doRedrawAll(
        dispatch,
        getState,
        new Set([crosslink.sourceA, crosslink.sourceB]),
        { skipLinked: true }
      )
    }
  }
}

export function deleteCrossLink(id: CrossLink["id"]) {
  return async function deleteCrossLinkThunk(dispatch, getState) {
    const { crossLinks } = getState() as { crossLinks: CrossLink[] }
    const crosslink = crossLinks.find(({ id: thisId }) => thisId === id)

    await dispatch({
      type: DELETE_CROSSLINK,
      id
    })

    if (crosslink) {
      doRedrawAll(
        dispatch,
        getState,
        new Set([crosslink.sourceA, crosslink.sourceB]),
        { skipLinked: true }
      )
    }
  }
}
