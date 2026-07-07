// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { simpleFilter, betweenFilter } from "vega/constants/filter-types"
import { DATA_TYPE_CATEGORY } from "components/data-column-selector/constants"
import { TEXT_TYPES, BOOL_TYPES } from "constants/data-types"
import { isSupportedTypeForFilterComponent } from "components/new-filters/filter-component/data-type-filters"
/**
 * Reusable default filter util function
 * @param table
 * @param label
 * @param type
 * @param typeCategory
 * @returns {*}
 */
export const defaultFilter = (
  table = null, // The actual SQL table
  dataSource = null, // Datasource can be a join or custom source param, or just the same as table
  label = null,
  type = null,
  typeCategory = null,
  { dataTypeIsArray } = {}
) => {
  let filter = null
  let operator = "="
  const value = null

  if (TEXT_TYPES[type]) {
    operator = "="
  }

  if (typeCategory === DATA_TYPE_CATEGORY.DATE_TIME) {
    filter = betweenFilter(table, dataSource, label, type, null, null, {
      dataTypeIsArray
    })
  } else if (BOOL_TYPES[type]) {
    filter = simpleFilter(table, dataSource, label, type, operator, true, {
      dataTypeIsArray
    })
  } else {
    filter = simpleFilter(table, dataSource, label, type, operator, value, {
      dataTypeIsArray
    })
  }

  return filter
}

// Filter geospatial data types, array + time, or array + decimal types from
// column metadata because they're not supported, currently
export const getDataSourcesWithUnsupportedColumnsRemoved = (dataSources) => {
  const ds = {
    ...dataSources
  }
  Object.keys(ds).forEach((key) => {
    ds[key] = {
      ...ds[key],
      columnMetadata: ds[key].columnMetadata.filter(({ type, is_array }) =>
        isSupportedTypeForFilterComponent(type, is_array)
      )
    }
  })
  return ds
}

import { createSelector } from "reselect"
import { isVegaChart } from "constants/charts"
import {
  vegaChartHasDataSource,
  vegaChartHasError,
  vegaChartSelectorsEmpty
} from "vega/utils/data-selection"
import Services from "services/immerse"
import { ParameterTypes } from "components/parameters/parameters-types"

// Get the dashboard data sources + column metadata with unsupported column
// types removed
export const getAllDataSources = createSelector(
  [(state) => state.dashboard.dataSources],
  getDataSourcesWithUnsupportedColumnsRemoved
)

// Get cohorts, and create rows to display in the table
export const getCohortRows = createSelector(
  [(state) => state.cohorts],
  (cohorts) =>
    Object.keys(cohorts).map((cohort) => ({
      table: cohorts[cohort].dataSource,
      value: cohorts[cohort].name,
      label: cohorts[cohort].name,
      is_dict: false,
      type: DATA_TYPE_CATEGORY.COHORT,
      cohortData: cohorts[cohort]
    }))
)

export const CONFIRMATION_MODAL_TYPES = {
  DELETE_SHARED: "DELETE_SHARED",
  DELETE_GLOBAL: "DELETE_GLOBAL",
  MODIFY: "MODIFY"
}

export const parameterTypeToHeader = (parameterType) => {
  switch (parameterType) {
    case ParameterTypes.CUSTOM_DIMENSION:
    case ParameterTypes.GLOBAL_DIMENSION:
      return "dimension"
    case ParameterTypes.CUSTOM_MEASURE:
    case ParameterTypes.GLOBAL_MEASURE:
      return "measure"
    case ParameterTypes.CUSTOM_FILTER:
    case ParameterTypes.GLOBAL_FILTER:
      return "filter"
    default:
      return ""
  }
}

export const chartIsRendered = (chart) => {
  if (isVegaChart(chart.type)) {
    return (
      vegaChartHasDataSource(chart) &&
      !(vegaChartHasError(chart) || vegaChartSelectorsEmpty(chart))
    )
  }

  return Boolean(Services.get("dc").getChart(chart.dcFlag))
}
