// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { rawSetParameterValue } from "./actions"
import { makeGetParameterSetIdsForTabId } from "./selectors"
import reducer from "./reducer"

// https://www.youtube.com/watch?v=ASQvZr6Zz4o

export const mergeQueryParamsIntoParameters = (
  parameters = {},
  queryParams = {},
  selectedTabId
) => {
  // Lance Armstrong cheated like crazy. We can, too!
  // we're gonna directly access the reducer and selectors, since the initial parameters
  // we were given are exactly what would be in the state in redux anyway.
  let state = parameters

  // first off, figure out the parmeterSetId we're dealing with.
  const parameterSetIds =
    makeGetParameterSetIdsForTabId({ parameters })(selectedTabId) || []

  // if we somehow don't have a parameter set, we bomb out.
  if (!parameterSetIds.length) {
    return parameters
  }

  // again, for now, we only care about the first parameter set ID.
  // once we support multiple sets, we'll need to revisit this.
  const parameterSetId = parameterSetIds[0]

  // and we let the reducer do all the work.
  // generate a setParameterValue action, send it into the state, repeat until we're done.
  // OF NOTE - this isn't doing any validation. So you can set a column to whatever BS value
  // you want or a string to a number column or whatever.
  //
  // Right now validation happens up in the params ui components, so validating here will require
  // refactoring to give us validated action creators that we can call here. "later"
  //
  // we're using the raw dispatch so we won't need to worry about wiring up dispatch/getState functions
  // to the setParameterValue thunk.
  Object.entries(queryParams).forEach(([name, value]) => {
    // only set values on defined parameters. This should also be guarded in the action creator.
    if (parameters.definitions[name]) {
      state = reducer(
        state,
        rawSetParameterValue({ name, value, parameterSetId })
      )
    }
  })

  return state
}
