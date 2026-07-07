// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  AUTOSUGGEST_ERROR,
  AUTOSUGGEST_REQUEST,
  AUTOSUGGEST_SUCCESS
} from "constants/action-types"

import action from "utils/redux/action"

// Arbitrary constant previously set to 20, increased to 500 after manual perf testing.
export const NUM_RESULTS = 500

export function populateAutosuggest(columnName, searchString, dataSource) {
  return (dispatch, getState, services) => {
    const expression = columnName
    dispatch(action(AUTOSUGGEST_REQUEST))
    const dimension = services
      .get("crossfilter")
      .getCrossfilter(dataSource)
      .dimension(columnName)
      .order("val")
    if (searchString !== "") {
      dimension.selfFilter(`${columnName} ILIKE '${searchString}%'`)
    }
    const group = dimension.group().reduceCount()
    return group
      .topAsync(NUM_RESULTS, 0, null)
      .then((results) =>
        dispatch(
          action(AUTOSUGGEST_SUCCESS, {
            expression,
            results: results.map((item) => {
              return {
                value: item.key0,
                label: String(item.key0),
                key0: String(item.key0),
                val: item.val,
                count: item.val
              }
            })
          })
        )
      )
      .then(() => {
        dimension.dispose()
      })
      .catch((error) => {
        dispatch(action(AUTOSUGGEST_ERROR, { error }))
      })
  }
}
