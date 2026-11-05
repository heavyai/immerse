// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createVegaResultReducers } from "@immerse/query-runtime"
import * as types from "vega/constants/vega-data-action-types"
import { getErrorMessageFromBackendError } from "utils/error-handling-helpers"

export default createVegaResultReducers({
  types,
  getErrorMessageFromBackendError
})
