// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import deepEquals from "fast-deep-equal"

export default function updateChartReducer(state, { chartId, payload }) {
  // Prevent the bug where some charts would call `updateChart` after a chart has been
  // deleted, causing an incomplete chart object to be re-added to the `charts` list in the state.
  if (!state[chartId]) {
    // eslint-disable-next-line no-console
    console.warn(
      `Warning: tried to update chart #${chartId}, which doesn't exist. Payload:`,
      payload
    )
    return state
  }

  // first thing we're gonna do is not actually change -anything- if the value hasn't changed.
  let needsUpdate = false
  for (const key in payload) {
    if (deepEquals(state[chartId][key], payload[key]) === false) {
      needsUpdate = true
      break
    }
  }

  if (needsUpdate === false) {
    return state
  } else {
    const chart = state[chartId]
    return {
      ...state,
      [chartId]: {
        ...chart,
        ...payload,
        color: {
          ...chart.color,
          ...payload.color
        }
      }
    }
  }
}
