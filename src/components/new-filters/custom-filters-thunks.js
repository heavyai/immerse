// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import pushid from "pushid"
import { addParameterDefinition } from "components/parameters/actions"
import { ParameterTypes } from "components/parameters/parameters-types"
import { simpleSetParameterValue } from "components/parameters/actions/simple-action-wrappers"
import {
  setChartFilter,
  setDashboardFilter,
  toggleFilterByName
} from "vega/actions/filter-action-creators"
import { closeCustomSQLManager } from "components/custom-sql-manager/custom-sql-manager-actions"
import { getErrorMessageFromBackendError } from "utils/error-handling-helpers"
import { importableCreateQueuedConnector as createQueuedConnector } from "services/ConnectorWithQueue-importable"
import { setCustomSqlFilterError } from "components/new-filters/filters-actions"
import { createGlobalExpressionAsync } from "utils/global-expressions"
import {
  buildGlobalExpressionParameterName,
  GlobalExpressionType
} from "components/data-manager/utils/global-custom-sql"
import { FILTER_TYPE_SQL } from "vega/constants/filter-type-constants"

export const validateCustomSqlFilter = (filter, chartId) => (
  dispatch,
  getState,
  services
) => {
  const query = `SELECT 1 FROM ${filter.dataSource} WHERE ${filter.sql} LIMIT 1`
  const connector = createQueuedConnector({
    connector: services.get("DbCon"),
    dashboardId: getState().dashboard.id,
    chartId,
    tableName: filter.dataSource
  })

  return connector.validateQuery(query)
}
export const submitCustomSqlFilter = (
  filter,
  name,
  chartId,
  layerId,
  autoEnable,
  isShared,
  isGlobal
) => (dispatch) => {
  dispatch(validateCustomSqlFilter(filter, chartId))
    .then(async () => {
      const newFilter = { ...filter }

      if (isShared) {
        const paramId = `CUSTOM_FILTER_${filter.dataSource}_${filter.dataExpression}`
        const selectorValue = `$\{${paramId}}`

        dispatch(
          addParameterDefinition({
            name: paramId,
            displayName: filter.dataExpression,
            type: ParameterTypes.CUSTOM_FILTER,
            defaultValue: filter.sql,
            source: filter.dataSource
          })
        )

        newFilter.sql = selectorValue
        newFilter.dataExpression = selectorValue

        dispatch(simpleSetParameterValue(paramId, filter.sql))
      } else if (isGlobal) {
        const globalExpressionId = await createGlobalExpressionAsync({
          name: filter.dataExpression,
          value: filter.sql,
          dataSourceType: "TABLE",
          dataSourceName: filter.dataSource,
          selectorType: GlobalExpressionType.FILTER
        })
        const paramId = buildGlobalExpressionParameterName({
          dataSource: filter.dataSource,
          label: filter.dataExpression,
          globalExpressionType: GlobalExpressionType.FILTER
        })
        const selectorValue = `$\{${paramId}}`
        newFilter.sql = selectorValue
        newFilter.dataExpression = selectorValue

        dispatch(
          addParameterDefinition({
            name: paramId,
            displayName: filter.dataExpression,
            type: ParameterTypes.GLOBAL_FILTER,
            defaultValue: filter.sql,
            source: filter.dataSource,
            globalExpressionId
          })
        )

        dispatch(simpleSetParameterValue(paramId, filter.sql))
      }

      if (chartId) {
        await dispatch(
          setChartFilter(
            newFilter,
            chartId,
            layerId,
            name,
            autoEnable || undefined,
            isShared
          )
        )
      } else {
        await dispatch(
          setDashboardFilter(
            newFilter,
            name,
            undefined,
            undefined,
            autoEnable || undefined,
            isShared
          )
        )
      }
      await dispatch(setCustomSqlFilterError(""))
      await dispatch(closeCustomSQLManager())
    })
    .then(() => {
      if (autoEnable) {
        dispatch(toggleFilterByName(name, true))
      }
    })
    .catch((error) => {
      dispatch(setCustomSqlFilterError(getErrorMessageFromBackendError(error)))
    })
}
export const submitCustomSql = (
  filterEditing,
  customSqlFilter,
  shouldAutoEnable,
  shared,
  global
) => (dispatch) => {
  // Use existing name if editing a filter
  const filterName =
    filterEditing &&
    filterEditing.filterType === FILTER_TYPE_SQL &&
    filterEditing.name
      ? filterEditing.name
      : pushid()

  dispatch(
    submitCustomSqlFilter(
      customSqlFilter,
      filterName,
      filterEditing.chartId,
      filterEditing.layerId,
      shouldAutoEnable,
      shared,
      global
    )
  )
}
