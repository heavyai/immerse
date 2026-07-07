// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { updateChart } from "actions/update-chart-action-creator"
import { setChartFilters } from "actions/charts-filter-action-creators"

export const RESET_SNAPSHOTS = "RESET_SNAPSHOTS"
export const SAVE_SNAPSHOT = "SAVE_SNAPSHOT"
export const LOAD_SNAPSHOT = "LOAD_SNAPSHOT"
export const DISCARD_SNAPSHOT = "DISCARD_SNAPSHOT"
export const DISCARD_ALL_SNAPSHOTS = "DISCARD_ALL_SNAPSHOTS"

export const resetSnapshots = () => ({
  type: RESET_SNAPSHOTS
})

/*
  A lot of what's in here is stubbed out for future use in a world that may never come to pass.

  You can save a snapshot on a chart by just dispatching saveSnapshot(chartId). There are two future
  parameters - type (for when we snapshot more than just charts) and name (for when we wanted named versions)

  load in the same way.

  NOTE - only saving/loading of snapshots of charts is currently supported. But if/when we do anything else,
  here's the place to do it.

  ONE VERY IMPORTANT NOTE - snapshots are ~transient~. Reloading the page destroys the history since they
  are never written to disk. This is by current design, but may change.
*/

export const saveSnapshot = (id, type = "chart", name) => {
  return (dispatch, getState) => {
    let snapshot = null
    if (type === "chart") {
      snapshot = getState().charts[id]
    }
    if (snapshot) {
      dispatch({
        type: SAVE_SNAPSHOT,
        payload: { id, type, snapshot, name }
      })
    }
  }
}

/*
  loadSnapshot works as the inverse of saveSnapshot.

  OF NOTE - loading a snapshot will explicitly delete it, but that's done by dispatching a separate
  DISCARD_SNAPSHOT action. this is to keep it compartmentalized for a world where we don't always discard
  snapshots.
*/

export const loadSnapshot = (id, type = "chart", name) => {
  return async (dispatch, getState) => {
    const snapshots = getState().snapshots[type][id]
    if (snapshots && snapshots.length) {
      const { snapshot } =
        name === undefined
          ? snapshots[snapshots.length - 1]
          : snapshots.find((s) => s.name === name)

      dispatch({ type: LOAD_SNAPSHOT, payload: { id, type, name } })
      dispatch(discardSnapshot(id, type, name))

      if (type === "chart") {
        dispatch(updateChart(id, snapshot))
        const chart = getState().charts[id]
        // crossfilter or dc or something is super twitchy and updateChart isn't necessarily
        // enough to change filters if they already exist. So we defer to our fancy action creator.
        if (chart) {
          dispatch(setChartFilters(id, chart.filters))
        }
      }
    }
  }
}

export function discardSnapshot(id, type = "chart", name) {
  return { type: DISCARD_SNAPSHOT, payload: { id, type, name } }
}

export function discardAllSnapshots(id, type = "chart") {
  return { type: DISCARD_ALL_SNAPSHOTS, payload: { id, type } }
}
