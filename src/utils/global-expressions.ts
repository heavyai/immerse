// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Services from "services/immerse"
import { importableProcess as process } from "utils/ImmerseSQLPlusPlus/parser-importable"

enum DataSourceTypeEnum {
  TABLE = 0
}

/**
 * A global expression is a database object that will contain a user defined
 * SQL expression and is sharable across dashboards. They can only be created
 * by admin users, but can be used by any user with access to the data source
 * the expression pertains to
 */

export async function createGlobalExpressionAsync(globalExpression: {
  name: string
  value: string
  dataSourceType: "TABLE" // 6.0 may introduce more complex types like DATA_MODEL
  dataSourceName: string // e.g. table name
  selectorType: "DIMENSION" | "MEASURE" | "FILTER"
}) {
  const {
    name,
    value,
    dataSourceType,
    dataSourceName,
    selectorType
  } = globalExpression

  const tableStmt = `SELECT ${value} from ${dataSourceName}`
  const connector = Services.get("DbCon")
  const expressionDetails = await connector.validateQuery(process(tableStmt))
  return connector.createCustomExpressionAsync({
    name,
    data_source_type: DataSourceTypeEnum[dataSourceType],
    data_source_name: dataSourceName,
    expression_json: JSON.stringify({
      ...expressionDetails[0],
      name,
      value,
      selectorType
    })
  })
}

export async function updateGlobalExpressionAsync(
  id: number,
  newValue: string
) {
  const connector = Services.get("DbCon")

  const expressions = await connector.getCustomExpressionsAsync()
  const expression = expressions.find((exp: { id: number }) => exp.id === id)
  if (!expression) {
    throw new Error("Custom expression not found")
  }

  const { data_source_name: tableName, expression_json } = expression
  const tableStmt = `SELECT ${newValue} from ${tableName}`
  const expressionDetails = await connector.validateQuery(process(tableStmt))
  const parsedExpressionPayload = JSON.parse(expression_json)
  await connector.updateCustomExpressionAsync(
    id,
    JSON.stringify({
      ...parsedExpressionPayload,
      ...expressionDetails[0],
      value: newValue
    })
  )
}

export async function deleteGlobalExpressionsAsync(idOrIds: number | number[]) {
  const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds]

  const connector = Services.get("DbCon")

  // second arg allows for a soft delete (toggles an `is_deleted` flag)
  // this functionality was scoped out
  return connector.deleteCustomExpressionsAsync(ids, false)
}
