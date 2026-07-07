// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { combineReducers } from "redux"

import definitions from "./parameter-definitions"
import values from "./parameter-values"
import sets from "./parameter-sets"
import usage from "./parameter-usage"
import crossfilterTokens from "./parameter-crossfilter-tokens"

export default combineReducers({
  definitions,
  values,
  sets,
  usage,
  crossfilterTokens
})
