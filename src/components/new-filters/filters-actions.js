// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  SET_CUSTOM_SQL_FILTER_VALIDATION_ERROR,
  SET_FILTER_PANEL_VIEW_MODE
} from "constants/action-types"
import {
  setChartFilter,
  setDashboardFilter
} from "vega/actions/filter-action-creators"
import { sqlFilter } from "vega/constants/filter-types"

export const setFilterNewlyCreated = (name) => ({
  type: "SET_FILTER_NEWLY_CREATED",
  name
})

export const unsetFilterNewlyCreated = (name) => ({
  type: "UNSET_FILTER_NEWLY_CREATED",
  name
})

export const setCustomSqlFilterError = (error) => ({
  type: SET_CUSTOM_SQL_FILTER_VALIDATION_ERROR,
  error
})

export const selectParameterizedCustomFilterFromDropdown = (
  row,
  existingFilter,
  shouldAutoEnable
) => (dispatch) => {
  const filter = sqlFilter(
    existingFilter.dataSource,
    existingFilter.dataSource,
    row.value,
    row.value
  )
  if (existingFilter.appliesTo === "CHART") {
    dispatch(
      setChartFilter(
        filter,
        existingFilter.chartId,
        existingFilter.layerId,
        existingFilter.name,
        shouldAutoEnable || undefined,
        Boolean(row.sharedCustom),
        Boolean(row.globalCustom)
      )
    )
  } else {
    dispatch(
      setDashboardFilter(
        filter,
        existingFilter.name,
        undefined,
        undefined,
        shouldAutoEnable || undefined,
        Boolean(row.sharedCustom),
        Boolean(row.globalCustom)
      )
    )
  }
}

export const setFilterPanelViewMode = (viewMode) => ({
  type: SET_FILTER_PANEL_VIEW_MODE,
  viewMode
})
