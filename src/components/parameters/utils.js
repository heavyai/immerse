// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { varExtractRegex } from "components/parameters/validation"

export const chartIdMatchesUsageId = (chartId, usageId) => {
  if (typeof usageId !== "string" || typeof chartId !== "string") {
    return undefined
  }
  const chartIdWithLayerRegex = new RegExp(`^${chartId}-`)
  return Boolean(usageId === chartId || usageId.match(chartIdWithLayerRegex))
}

export const getChartIdFromUsageId = (usageId) => {
  if (typeof usageId !== "string") {
    return undefined
  }
  const m = usageId.match(/^(\w+)/)
  return m ? m[0] : undefined
}

export const parametersInValue = (value = "") => {
  return Array.from(value.matchAll(new RegExp(varExtractRegex, "g"))).map(
    ([, p]) => p
  )
}

export const valueContainsParameter = (value = "", parameterName) => {
  return parametersInValue(value).includes(parameterName)
}

export const parameterValueRequiresParens = (value) =>
  !value.match(/^\s*\(.+\)\s*$/i) && value.match(/select/i)
