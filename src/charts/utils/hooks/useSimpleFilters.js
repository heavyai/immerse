// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useStaticValue } from "hooks"
import { useEnabledFilters } from "./useFilters"

import { useInternalCrossfilterId } from "./useInternalCrossfilterId"

import { simplifyFilter } from "./simplify-filters"

export const useSimpleFilters = ({
  chartId,
  name = "crossfilter",
  useGeneratedInternalId = true
}) => {
  const internalID = useInternalCrossfilterId({
    chartId,
    name,
    useGeneratedInternalId
  })

  const filterMeta = useEnabledFilters().find(
    (f) => f.name === internalID && f.chartId === chartId
  )

  const simplifiedFilter = filterMeta
    ? simplifyFilter(filterMeta.filter)
    : undefined

  return useStaticValue(simplifiedFilter)
}
