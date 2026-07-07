// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { SET_INIT_X_DOMAIN, SET_INIT_Y_DOMAIN } from "constants/action-types"

export const setInitXDomain = (domain, chartId, dimensionAxisName) => ({
  chartId,
  domain,
  dimensionAxisName,
  type: SET_INIT_X_DOMAIN
})

export const setInitYDomain = (domain, chartId, dimensionAxisName) => ({
  chartId,
  domain,
  dimensionAxisName,
  type: SET_INIT_Y_DOMAIN
})
