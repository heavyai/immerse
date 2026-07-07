// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { importableCreateQueuedConnector as createQueuedConnector } from "services/ConnectorWithQueue-importable"
import { importableProcess as processParameters } from "utils/ImmerseSQLPlusPlus/parser-importable"
import { getErrorMessageFromBackendError } from "utils/error-handling-helpers"
import { ParameterTypes } from "components/parameters/parameters-types"
import { simpleSetParameterValue } from "components/parameters/actions/simple-action-wrappers"
import { setCustomSqlFilterError } from "components/new-filters/filters-actions"
import { closeCustomSQLManager } from "components/custom-sql-manager/custom-sql-manager-actions"
import { addParameterDefinition } from "components/parameters/actions"
import {
  clearColorDomain,
  toggleColorMeasurePaletteReversal
} from "vega/actions/scale-settings-action-creators"
import { setDimension, setMeasure } from "vega/actions/data-selection-thunks"
import sql from "vega/utils/sql-tag"
import { dimensionToExprStr, getLayerById } from "vega/utils/data-selection"
import {
  BarDimensionName,
  BarMeasureName,
  CustomSqlExpression,
  DimensionExpression,
  isGroupable
} from "vega/constants/data-selection-types"
import { createGlobalExpressionAsync } from "utils/global-expressions"
import { varExtractRegex } from "components/parameters/validation"
import { getComputedMinMax, getLatestBeatData } from "vega/utils/data"
import {
  buildGlobalExpressionParameterName,
  GlobalExpressionType
} from "components/data-manager/utils/global-custom-sql"
import { getDimensionExpression } from "vega/utils/query-building"

const getDimensionExpressions = (dataSelection, binSettings, data) => {
  // Include the dimensions in the validate query so that it's possible to
  // build custom measures that include window functions using them
  const { xAxis, color } = dataSelection.dimensions

  // Take minmax results from focus chart as source of truth
  const minmaxData = data
    ? data.focus
        .map(getLatestBeatData)
        .map((beatData) => (beatData ? beatData.minmax : null))
    : []
  const minmax = getComputedMinMax(minmaxData, binSettings)
  const dimensionExpressions = xAxis.map((dimension, index) => {
    return `${getDimensionExpression(
      dimension,
      minmax,
      1,
      binSettings
    )} AS dimension${index}`
  })

  if (color) {
    dimensionExpressions.push(
      `${dimensionToExprStr(color)} AS dimension${xAxis.length}`
    )
  }

  return dimensionExpressions
}

// the custom measure MUST be the first column in the generated sql
const buildMeasureValidationQuery = (
  dimensionExpressions,
  customSqlMeasure
) => sql`
    ${sql.select(
      `${customSqlMeasure.sql} AS custom_measure`,
      dimensionExpressions
    )}
    ${sql.from(customSqlMeasure.table)}
    ${sql.groupBy(dimensionExpressions.map((_, index) => `dimension${index}`))}`

export const submitCustomSqlMeasure = (
  chartId: string,
  layerId: string,
  measureName: BarMeasureName,
  measureIndex: number | null,
  customSqlMeasure: CustomSqlExpression,
  isShared = false,
  isGlobal = false
) => async (dispatch, getState, services) => {
  const connector = createQueuedConnector({
    connector: services.get("DbCon"),
    dashboardId: getState().dashboard.id,
    chartId,
    table: customSqlMeasure.table
  })
  const chart = getState().charts[chartId]
  const dataSelection = getLayerById(chart.dataSelections, layerId)

  if (typeof dataSelection === "undefined") {
    throw new Error(`No layer ${layerId}`)
  }

  const parameterizedCustomMeasure = { ...customSqlMeasure }

  const validateQuery = buildMeasureValidationQuery(
    getDimensionExpressions(dataSelection, chart.binSettings, chart.data),
    customSqlMeasure
  )

  try {
    const [column] = await connector.validateQuery(validateQuery)
    if (isGroupable(column)) {
      if (isShared) {
        const paramId = `CUSTOM_MEASURE_${parameterizedCustomMeasure.table.replace(
          varExtractRegex,
          "$1"
        )}_${customSqlMeasure.name}`
        const selectorValue = `$\{${paramId}}`

        parameterizedCustomMeasure.sql = selectorValue
        parameterizedCustomMeasure.name = selectorValue
        parameterizedCustomMeasure.sharedCustom = true

        dispatch(
          addParameterDefinition({
            name: paramId,
            displayName: customSqlMeasure.name,
            type: ParameterTypes.CUSTOM_MEASURE,
            defaultValue: customSqlMeasure.sql,
            source: parameterizedCustomMeasure.table,
            defaultColumnMetadata: column
          })
        )

        dispatch(simpleSetParameterValue(paramId, customSqlMeasure.sql))
      } else if (isGlobal) {
        const globalExpressionId = await createGlobalExpressionAsync({
          name: customSqlMeasure.name,
          value: customSqlMeasure.sql,
          dataSourceType: "TABLE",
          dataSourceName: parameterizedCustomMeasure.table,
          selectorType: GlobalExpressionType.MEASURE
        })

        const paramId = buildGlobalExpressionParameterName({
          dataSource: parameterizedCustomMeasure.table,
          label: customSqlMeasure.name,
          globalExpressionType: GlobalExpressionType.MEASURE
        })

        const selectorValue = `$\{${paramId}}`

        parameterizedCustomMeasure.sql = selectorValue
        parameterizedCustomMeasure.name = selectorValue
        parameterizedCustomMeasure.globalCustom = true

        dispatch(
          addParameterDefinition({
            name: paramId,
            displayName: customSqlMeasure.name,
            type: ParameterTypes.GLOBAL_DIMENSION,
            defaultValue: customSqlMeasure.sql,
            source: parameterizedCustomMeasure.table,
            defaultColumnMetadata: column,
            globalExpressionId
          })
        )

        await dispatch(simpleSetParameterValue(paramId, customSqlMeasure.sql))
      }

      await dispatch(setCustomSqlFilterError(""))
      await dispatch(closeCustomSQLManager())

      const measure = { ...parameterizedCustomMeasure, column }

      if (measureName === "color") {
        await dispatch(clearColorDomain(chartId))
        await dispatch(toggleColorMeasurePaletteReversal(chartId, false))
      }

      await dispatch(
        setMeasure(chartId, layerId, measureName, measureIndex, measure)
      )
    } else {
      await dispatch(
        setCustomSqlFilterError("Custom SQL expression must be groupable")
      )
    }
  } catch (error) {
    await dispatch(
      setCustomSqlFilterError(getErrorMessageFromBackendError(error))
    )
  }
}
export const submitCustomSqlDimension = (
  chartId: string,
  layerId: string,
  dimensionName: BarDimensionName,
  dimensionIndex: number | null,
  customSqlDimension: CustomSqlExpression,
  isShared = false,
  isGlobal = false
) => async (dispatch, _getState, services) => {
  const connector = createQueuedConnector({
    connector: services.get("DbCon"),
    dashboardId: _getState().dashboard.id,
    chartId,
    table: customSqlDimension.table
  })

  try {
    const [column] = await connector.validateQuery(
      `SELECT ${customSqlDimension.sql} AS custom_dimension FROM ${customSqlDimension.table} GROUP BY custom_dimension`
    )
    const parameterizedCustomDimension = { ...customSqlDimension }

    if (isShared) {
      const { name: _, ...defaultColumnMetadata } = column
      const paramId = `CUSTOM_DIMENSION_${parameterizedCustomDimension.table.replace(
        varExtractRegex,
        "$1"
      )}_${customSqlDimension.name}`
      const selectorValue = `$\{${paramId}}`

      parameterizedCustomDimension.sql = selectorValue
      parameterizedCustomDimension.name = selectorValue
      parameterizedCustomDimension.sharedCustom = true

      dispatch(
        addParameterDefinition({
          name: paramId,
          displayName: customSqlDimension.name,
          type: ParameterTypes.CUSTOM_DIMENSION,
          defaultValue: customSqlDimension.sql,
          source: parameterizedCustomDimension.table,
          defaultColumnMetadata
        })
      )

      await dispatch(simpleSetParameterValue(paramId, customSqlDimension.sql))
    } else if (isGlobal) {
      const globalExpressionId = await createGlobalExpressionAsync({
        name: customSqlDimension.name,
        value: customSqlDimension.sql,
        dataSourceType: "TABLE",
        dataSourceName: parameterizedCustomDimension.table,
        selectorType: GlobalExpressionType.DIMENSION
      })
      const paramId = buildGlobalExpressionParameterName({
        globalExpressionType: GlobalExpressionType.DIMENSION,
        dataSource: parameterizedCustomDimension.table,
        label: customSqlDimension.name
      })
      const selectorValue = `$\{${paramId}}`

      parameterizedCustomDimension.sql = selectorValue
      parameterizedCustomDimension.name = selectorValue
      parameterizedCustomDimension.globalCustom = true
      dispatch(
        addParameterDefinition({
          name: paramId,
          displayName: customSqlDimension.name,
          type: ParameterTypes.GLOBAL_DIMENSION,
          defaultValue: customSqlDimension.sql,
          source: parameterizedCustomDimension.table,
          defaultColumnMetadata: column,
          globalExpressionId
        })
      )

      await dispatch(simpleSetParameterValue(paramId, customSqlDimension.sql))
    }

    // Most of this block is copied from setDimensionColumn. This could definitely
    // be improved to share more logic with that.
    if (isGroupable(column)) {
      await dispatch(setCustomSqlFilterError(""))
      await dispatch(closeCustomSQLManager())

      const expression: DimensionExpression = {
        ...parameterizedCustomDimension,
        column
      }

      await dispatch(
        setDimension(
          chartId,
          layerId,
          dimensionName,
          dimensionIndex,
          expression
        )
      )

      processParameters(customSqlDimension.sql, {
        chartId,
        token: `dimension:${layerId}:${dimensionName}:${dimensionIndex}`,
        useDisplayName: true
      })
    } else {
      await dispatch(
        setCustomSqlFilterError("Custom SQL expression must be groupable")
      )
    }
  } catch (error) {
    await dispatch(
      setCustomSqlFilterError(getErrorMessageFromBackendError(error))
    )
  }
}
