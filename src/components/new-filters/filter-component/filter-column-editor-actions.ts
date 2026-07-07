// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import pushid from "pushid"

import { DATA_TYPE_CATEGORY } from "components/data-column-selector/constants"

import {
  setDashboardFilter,
  toggleFilterByName,
  setDashboardCohort,
  clearFilterByName,
  setChartFilter,
  setChartCohort
} from "vega/actions/filter-action-creators"

import {
  selectParameterizedCustomFilterFromDropdown,
  setFilterNewlyCreated
} from "components/new-filters/filters-actions"

import {
  updatedFilterFromOption,
  typeCategory,
  multiSelect,
  defaultAggregateFilter,
  isCountStarAggregateFilter
} from "components/new-filters/filter-component/filter-component-options"

import {
  setCohortAggregateFilter,
  setCohortAggregateFilterValidity
} from "components/new-filters/filter-sets-action-creators"

import { defaultFilter } from "components/custom-sql-manager/custom-sql-manager-utils"
import { getTypeCategory } from "components/data-column-selector/utils"
import { checkFilterForCompleteness } from "components/new-filters/filter-selectors"
import { getFullColumnName } from "components/join-manager/utils"

// Post-apply actions
export const SWITCH_SELECTED_DASHBOARD_COHORT =
  "SWITCH_SELECTED_DASHBOARD_COHORT"
export const SWITCH_SELECTED_CHART_COHORT = "SWITCH_SELECTED_CHART_COHORT"
export const SUBMIT_DASHBOARD_FILTER = "SUBMIT_DASHBOARD_FILTER"
export const SUBMIT_PREFILTER = "SUBMIT_PREFILTER"
export const SUBMIT_COHORT_AGGREGATE_FILTER = "SUBMIT_COHORT_AGGREGATE_FILTER"

export const shouldTransferOldValues = (activeRowData, existingFilterData) =>
  typeCategory({ dataType: existingFilterData.dataType }) ===
    typeCategory({ dataType: activeRowData.type }) &&
  !existingFilterData.overwrite &&
  !existingFilterData.newlyCreated &&
  existingFilterData.dataSource ===
    (activeRowData.source ?? activeRowData.table) &&
  !(
    existingFilterData.optionName === multiSelect.name && !activeRowData.is_dict
  ) &&
  activeRowData.is_array === existingFilterData.dataTypeIsArray

const submitCohort = async (existingFilterData, activeRowData, dispatch) => {
  const { dimension, filter } = activeRowData.cohortData
  const name = existingFilterData.name || pushid()
  await dispatch(setDashboardCohort(dimension, filter, name))
  // and ensure that the cohort is enabled
  dispatch(toggleFilterByName(name, true))
}

const submitDashboardFilterEdit = async (
  existingFilterData,
  activeRowData,
  dispatch
) => {
  const { value, start, end, optionName, name, dataType } = existingFilterData
  const { table, source, type, is_array } = activeRowData
  const filterValue = type === dataType ? value : null
  const dataExpression = getFullColumnName(activeRowData)
  const updatedFilter = updatedFilterFromOption(
    optionName,
    {
      dataSource: source ?? table,
      dataExpression,
      dataType: type,
      dataTypeIsArray: is_array
    },
    {
      value: filterValue,
      start,
      end
    }
  )

  // if the filterValue becomes null, then it's invalid,
  // so we ensure it's not enabled.
  if (filterValue === null) {
    dispatch(toggleFilterByName(name, false))
  }

  await dispatch(setDashboardFilter(updatedFilter, name))
}

const submitDashboardFilter = async (
  existingFilterData = {},
  activeRowData,
  dispatch
) => {
  const { source, table, label, type, is_array, is_join } = activeRowData
  const { name } = existingFilterData
  const dataExpression = is_join ? `${table}.${label}` : label
  if (name) {
    if (shouldTransferOldValues(activeRowData, existingFilterData)) {
      submitDashboardFilterEdit(existingFilterData, activeRowData, dispatch)
    } else {
      const filter = defaultFilter(
        table,
        source,
        dataExpression,
        type,
        getTypeCategory(type),
        { dataTypeIsArray: is_array }
      )
      await dispatch(
        setDashboardFilter(
          filter,
          name,
          undefined,
          undefined,
          checkFilterForCompleteness(filter)
        )
      )
    }
  } else {
    const newName = pushid()
    const filter = defaultFilter(
      table,
      source,
      dataExpression,
      type,
      getTypeCategory(type),
      { dataTypeIsArray: is_array }
    )
    await dispatch(
      setDashboardFilter(
        filter,
        newName,
        undefined,
        undefined,
        checkFilterForCompleteness(filter)
      )
    )
  }
}

const submitChartFilterEdit = (existingFilterData, activeRowData, dispatch) => {
  const { chartId, layerId, optionName, name } = existingFilterData
  const { source, table, label, type, is_join } = activeRowData

  const dataExpression = is_join ? `${table}.${label}` : label
  const updatedFilter = updatedFilterFromOption(
    optionName,
    { dataSource: source ?? table, dataExpression, dataType: type },
    existingFilterData
  )
  dispatch(setChartFilter(updatedFilter, chartId, layerId, name))
}

const submitPreFilter = (
  existingFilterData,
  activeRowData,
  shouldEnable,
  dispatch
) => {
  const activeRow = activeRowData
  const { chartId, layerId } = existingFilterData
  const areEditingExistingFilter = existingFilterData && existingFilterData.name
  // Use source as the table, so its associated with the right data sources,
  // but if it's a join we need to qualify which table the columns coming from
  const column = getFullColumnName(activeRow)
  if (areEditingExistingFilter) {
    if (activeRowData.sharedCustom || activeRowData.globalCustom) {
      dispatch(
        selectParameterizedCustomFilterFromDropdown(
          activeRowData,
          existingFilterData,
          shouldEnable
        )
      )
    } else if (shouldTransferOldValues(activeRow, existingFilterData)) {
      submitChartFilterEdit(existingFilterData, activeRowData, dispatch)
    } else {
      const filter = defaultFilter(
        activeRow.table,
        activeRow.source,
        column,
        activeRow.type,
        getTypeCategory(activeRow.type),
        { dataTypeIsArray: activeRow.is_array }
      )
      dispatch(
        setChartFilter(
          filter,
          chartId,
          layerId,
          existingFilterData.name,
          checkFilterForCompleteness(filter)
        )
      )
    }
  } else {
    const newName = pushid()
    if (getTypeCategory(activeRow.type) === "COHORT") {
      const { dimension, filter } = activeRow.cohortData
      dispatch(setChartCohort(dimension, filter, chartId, layerId, newName))
    } else {
      dispatch(setFilterNewlyCreated(newName))
      const filter = defaultFilter(
        activeRow.table,
        activeRow.source,
        column,
        activeRow.type,
        getTypeCategory(activeRow.type),
        { dataTypeIsArray: activeRow.is_array }
      )
      dispatch(setChartFilter(filter, chartId, layerId, newName))
    }
  }
}

// If the user clicks on a cohort already being applied in the filter panel
// (as a filter, not in the cohort builder), and wants to switch out the
// cohort being used with a different cohort
const switchSelectedDashboardCohort = (
  existingFilterData,
  activeRowData,
  dispatch
) => {
  dispatch(clearFilterByName(existingFilterData.name))
  submitCohort(existingFilterData, activeRowData, dispatch)
}

const switchSelectedChartCohort = (
  existingFilterData,
  activeRowData,
  dispatch
) => {
  dispatch(clearFilterByName(existingFilterData.name))
  submitCohort(existingFilterData, activeRowData, dispatch)
}

const submitCohortAggregateFilterEdit = (
  existingFilterData,
  activeRowData,
  dispatch
) => {
  const {
    value,
    start,
    end,
    optionName,
    name,
    dataExpression
  } = existingFilterData
  const { value: activeRowValue } = activeRowData
  const updatedFilter = updatedFilterFromOption(
    optionName,
    {
      ...existingFilterData.filter,
      dataExpression: { ...dataExpression, value: activeRowValue }
    },
    {
      value,
      start,
      end
    }
  )
  dispatch(setCohortAggregateFilter(updatedFilter, name))
}

const submitCohortAggregateFilter = (
  existingFilterData,
  activeRowData,
  dispatch
) => {
  if (existingFilterData.name) {
    if (existingFilterData.dataExpression.value === activeRowData.value) {
      return
    }
    if (
      typeCategory({ dataType: activeRowData.type }) ===
        typeCategory({ dataType: existingFilterData.dataType }) &&
      !activeRowData.isCount &&
      !isCountStarAggregateFilter(existingFilterData)
    ) {
      submitCohortAggregateFilterEdit(
        existingFilterData,
        activeRowData,
        dispatch
      )
    } else {
      dispatch(setCohortAggregateFilterValidity(existingFilterData.name, false))
      dispatch(
        setCohortAggregateFilter(
          defaultAggregateFilter(activeRowData.value, activeRowData),
          existingFilterData.name
        )
      )
    }
  } else {
    dispatch(
      setCohortAggregateFilter(
        defaultAggregateFilter(activeRowData.value, activeRowData)
      )
    )
  }
}

// This thunk gets passed the Data Selection Modal props and state
export const selectFilterColumn = (
  existingFilterData,
  activeRowData,
  columnSelectAction,
  shouldEnable
) => (dispatch) => {
  // These are all the actions that can get called when the user clicks the
  // "apply" button
  switch (columnSelectAction) {
    case SWITCH_SELECTED_DASHBOARD_COHORT:
      switchSelectedDashboardCohort(existingFilterData, activeRowData, dispatch)
      break
    case SWITCH_SELECTED_CHART_COHORT:
      switchSelectedChartCohort(existingFilterData, activeRowData, dispatch)
      break
    case SUBMIT_DASHBOARD_FILTER:
      if (getTypeCategory(activeRowData.type) === DATA_TYPE_CATEGORY.COHORT) {
        submitCohort(existingFilterData, activeRowData, dispatch)
      } else if (activeRowData.sharedCustom || activeRowData.globalCustom) {
        dispatch(
          selectParameterizedCustomFilterFromDropdown(
            activeRowData,
            existingFilterData,
            shouldEnable
          )
        )
      } else {
        submitDashboardFilter(existingFilterData, activeRowData, dispatch)
      }
      break
    case SUBMIT_PREFILTER:
      submitPreFilter(existingFilterData, activeRowData, shouldEnable, dispatch)
      break
    case SUBMIT_COHORT_AGGREGATE_FILTER:
      submitCohortAggregateFilter(existingFilterData, activeRowData, dispatch)
      break
    default:
      // the data selection modal needs an onApplyAction to know how to save the
      // user's selections
      throw new Error(
        "Filter column editor was called without an onApplyAction"
      )
  }
}
