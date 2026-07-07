// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { all, concat, values } from "ramda"
import { setChart } from "reducers/charts/charts-reducer-helpers"

const missing = (selector) =>
  selector.isRequired ? !selector.value || selector.loading : false

const noError = (selector) => !selector.isError && !missing(selector)

function hasError(chartId, state) {
  const selectors = concat(
    values(state[chartId].measures),
    values(state[chartId].dimensions)
  )
  return !all(noError, selectors)
}

export default (chartId) => (state) =>
  setChart(chartId, "hasError", hasError(chartId, state))(state)
