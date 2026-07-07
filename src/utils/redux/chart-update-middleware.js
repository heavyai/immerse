// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as ChartUpdateActionTypes from "constants/chart-update-action-types"
import { compose, curry, intersection, keys, length } from "ramda"
import { saveLastChartAction } from "actions/app-action-creators"

const UPDATES_FROM_EVENTS = [
  "filters",
  "timeBinInputVal",
  "loading",
  "mapZoomCenter"
]

const intersects = curry((a, b) => length(intersection(a, b)) > 0)
const isEventUpdate = compose(intersects(UPDATES_FROM_EVENTS), keys)
const isValid = (payload) => payload.sortColumn || payload.ordering

function shouldSave(action) {
  if (ChartUpdateActionTypes[action.type]) {
    return action.type === "UPDATE_CHART"
      ? !isEventUpdate(action.payload) && isValid(action.payload)
      : true
  } else {
    return false
  }
}

export default function chartUpdateMiddleware() {
  return ({ dispatch }) => (next) => (action) => {
    if (shouldSave(action)) {
      dispatch(saveLastChartAction(action))
    }
    return next(action)
  }
}
