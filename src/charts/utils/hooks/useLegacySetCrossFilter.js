// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useDispatch } from "react-redux"

import { forceUserGeneratedFilter } from "vega/actions/filter-action-creators-crossfilter-interop"

import { setChartFilters } from "actions/charts-filter-action-creators"

import { useLegacyChartingCrossFilterId } from "./useLegacyChartingCrossFilterId"

export const useLegacySetCrossFilter = (chartId, options) => {
  const dispatch = useDispatch()
  const crossfilterId = useLegacyChartingCrossFilterId(chartId)

  return async (filters) => {
    forceUserGeneratedFilter(crossfilterId, options.forceUserGenerated)
    await dispatch(setChartFilters(chartId, filters))
    forceUserGeneratedFilter(crossfilterId)
  }
}
