// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { AST, Parser } from "node-sql-parser"
import { cloneDeep, intersection } from "lodash"
import { LAYER_TYPE } from "./constants"
import { ViewState } from "react-map-gl"
import { MapSettings, PointMapSettings } from "./types"
import { getBounds } from "./utils"
import { VegaTypeMap } from "components/sql-notebook/types"

/**
 * Default parser options for our sql parser
 */
export const parserOptions = {
  database: "heavydb"
}

const parser = new Parser()

/**
 * Convenience wrapper, astify can return an array or a single AST
 *
 * @param query Query to get AST for
 * @returns AST from node-sql-parser
 */
export const getAST = (query: string) => {
  const queryAST = parser.astify(query, parserOptions)
  if (Array.isArray(queryAST)) {
    return queryAST[0]
  } else {
    return queryAST
  }
}

/**
 * Thin wrapper around parser sqlify, so we don't need to export the parser
 * itself. Keeps parser + options consistent.
 *
 * @param queryAST Node sql parser ast object
 * @returns String HeavySQL query
 */
export const sqlify = (queryAST: AST) => {
  return parser.sqlify(queryAST, parserOptions)
}

/**
 * Returns true if the query is a select * query
 * @param query Query to check
 * @returns boolean true if the query is a select *
 */
export const isSelectStar = (query: string) => {
  const ast = getAST(query)
  return ast.columns[0]?.expr?.column === "*"
}

/**
 *
 * @param func Function to wrap the field in
 * @param columnExpr Field to call the function with, could be a string field name or AST object
 * @param alias How to alias the field
 * @returns AST for an aliased function call
 */
export const funcWithAlias = (
  func: string,
  columnExpr: object,
  alias?: string,
  exprType = "function"
) => {
  const astExpr = {
    expr: {
      type: exprType,
      name: func,
      args: {
        type: "expr_list",
        value: [columnExpr]
      },
      over: null
    }
  }
  if (alias) {
    astExpr.as = alias
  }
  return astExpr
}

/**
 * Given an AST expression, this returns all columns and aliases present in that expression
 *
 * @param expr AST Expression
 * @param columnList - list of aliases/columns, should be empty to start
 * @returns A list of columns and aliases in the provided expression
 */
export const columnsInExpression = (
  expr: any,
  includeAlias = true,
  columnList: Array<string> = []
): string[] => {
  if (!expr) {
    return columnList
  }
  // If this expression has an alias, count it
  if (expr.as && includeAlias) {
    columnList.push(expr.as)
  }
  // functions/expressions
  if (expr.type === "function") {
    return columnsInExpression(expr.args, includeAlias, columnList)
  }
  if (expr.type === "expr") {
    return columnsInExpression(expr.expr, includeAlias, columnList)
  }
  if (expr.type === "binary_expr") {
    return columnList.concat(
      columnsInExpression(expr.left, includeAlias, columnList),
      columnsInExpression(expr.right, includeAlias, columnList)
    )
  }
  if (expr.type === "expr_list") {
    return columnList.concat(
      ...expr.value.map((e) => columnsInExpression(e, includeAlias, columnList))
    )
  }

  // leafs
  if (expr.type === "column_ref") {
    const columnExpr = expr.column
    // This can be an expression or a leaf
    if (columnExpr.expr) {
      return columnList.concat(
        columnsInExpression(columnExpr.expr, includeAlias, columnList)
      )
    } else {
      return columnList.concat(columnExpr)
    }
  }
  if (expr.value) {
    return columnList.concat(expr.value)
  }
  return columnList
}

/**
 * Searches an AST for a field name that could be a column name or alias
 *
 * @param queryAST The query AST to search
 * @param fieldName Field name to find
 * @returns A column matching the alias or column name of the fieldName provided
 */
export const findQueryColumn = (queryAST: AST, fieldName: string) => {
  // field could be an alias, this grabs the actual column from the AST
  // so we can get the non aliased expression
  return queryAST.columns.find((column) => {
    return columnsInExpression(column).includes(fieldName)
  })
}

export const filterColumns = (queryAST: AST, fieldNames: Array<string>) => {
  return queryAST.columns.filter((column) => {
    return intersection(columnsInExpression(column), fieldNames).length === 0
  })
}
export const column = (col: string) => ({ type: "column_ref", column: col })
export const columnExpression = (col: string) => {
  return {
    expr: column(col),
    type: "expr"
  }
}

export const expression = (expr: object, alias?: string) => {
  return {
    type: "expr",
    expr,
    as: alias
  }
}

export const aggrFuncWithAlias = (
  func: string,
  args: object,
  alias?: string
) => {
  return {
    type: "aggr_func",
    name: func,
    args,
    over: null,
    as: alias
  }
}

export const astLiteral = (type: string, value: string | number) => {
  return {
    type,
    value
  }
}

export const binaryExpression = (
  left: string | object,
  right: string | object,
  operator: string,
  alias?: string
) => {
  return {
    type: "binary_expr",
    operator,
    left,
    right,
    as: alias
  }
}

/**
 *
 * @param query Existing query to generate a domain query from
 * @param limit How many distinct values to select for this ordinal domain
 * @param field The field to get the domain for
 * @returns A new query selecting the domain of the ordinal field specified.
 */
export const asOrdinalDomainQuery = (
  query: string,
  limit: number,
  field: string
) => {
  const queryAST = getAST(query)

  // field could be an alias, this grabs the actual column from the AST
  // so we can get the non aliased expression. If it's not found, it's used as is
  let queryColumn = findQueryColumn(queryAST, field)

  if (!queryColumn && isSelectStar(query)) {
    queryColumn = columnExpression(field)
  }
  const recordCountField = "topKNumRecords"
  // Parse query
  queryAST.limit = {
    seperator: "",
    value: [
      {
        type: "number",
        value: limit
      }
    ]
  }
  queryAST.columns = [
    queryColumn,
    {
      expr: {
        type: "aggr_func",
        name: "COUNT",
        args: {
          distinct: null,
          expr: {
            type: "number",
            value: 1
          },
          orderby: null,
          separator: null
        },
        over: null
      },
      as: recordCountField
    }
  ]
  queryAST.groupby = [
    {
      type: "column_ref",
      table: null,
      column: queryColumn
    }
  ]
  queryAST.orderby = [
    {
      expr: {
        type: "column_ref",
        table: null,
        column: recordCountField
      },
      type: "DESC"
    }
  ]

  return parser.sqlify(queryAST, parserOptions)
}
/**
 *
 * @param query Existing query to generate the domain query from
 * @param field Field to get the domain of
 * @returns A new query, which selects the domain of the field specified.
 *          The rest of the query remains unchanged
 */
export const asContinuousDomainQuery = (query: string, field: string) => {
  // When does this return an array vs just a single AST?
  const queryAST = getAST(query)

  const domainQuery = "continuousDomainQuery"
  // This is aggregating to 4 values, no limit on CTE query
  delete queryAST.limit
  // Use our original query as CTE
  queryAST.with = [
    {
      name: { type: "default", value: domainQuery },
      stmt: cloneDeep(queryAST)
    }
  ]
  queryAST.from = [
    {
      table: domainQuery
    }
  ]

  // None of this needed in the outer query
  delete queryAST.groupby
  delete queryAST.orderby
  delete queryAST.where
  queryAST.columns = [
    expression(aggrFuncWithAlias("MIN", columnExpression(field), "min")),
    expression(aggrFuncWithAlias("MAX", columnExpression(field), "max"))
  ]
  return parser.sqlify(queryAST, parserOptions)
}

export const asContinuousDomainTwoStdDev = (query: string, field: string) => {
  const queryAST = getAST(query)
  const queryColumn = findQueryColumn(queryAST, field) || field
  const columnName = queryColumn.expr?.column

  queryAST.columns = [
    {
      type: "expr",
      expr: {
        type: "function",
        name: "max",
        args: {
          type: "expr_list",
          value: [
            aggrFuncWithAlias("MIN", columnExpression(columnName)),
            binaryExpression(
              aggrFuncWithAlias("AVG", columnExpression(columnName)),
              binaryExpression(
                astLiteral("number", 2),
                {
                  type: "function",
                  name: "STDDEV",
                  args: {
                    type: "expr_list",
                    value: [column(columnName)]
                  }
                },
                "*"
              ),
              "-"
            )
          ]
        }
      },
      as: "min"
    },
    {
      type: "expr",
      expr: {
        type: "function",
        name: "MIN",
        args: {
          type: "expr_list",
          value: [
            aggrFuncWithAlias("MAX", columnExpression(columnName)),
            binaryExpression(
              aggrFuncWithAlias("AVG", columnExpression(columnName)),
              binaryExpression(
                astLiteral("number", 2),
                {
                  type: "function",
                  name: "STDDEV",
                  args: {
                    type: "expr_list",
                    value: [column(columnName)]
                  }
                },
                "*"
              ),
              "+"
            )
          ]
        }
      },
      as: "max"
    }
  ]

  return parser.sqlify(queryAST, parserOptions)
}

/**
 * Adds a limit expression to any query, will hard override any limits already there
 * Will not add limits to CTEs
 *
 * @param query Query to limit
 * @param limit The limit to impose
 * @returns Query with the new limit added
 */
export const overrideLimit = (query: string, limit: number) => {
  const queryAST = getAST(query)
  const limitValue = queryAST.limit?.value?.[0]?.value
  if (limitValue === undefined || limitValue > limit) {
    queryAST.limit = {
      seperator: "",
      value: [
        {
          type: "number",
          value: limit
        }
      ]
    }
  }
  return parser.sqlify(queryAST, parserOptions)
}

export const addSampleRatio = (query: string, limit: number) => {
  if (query.match(/SAMPLE_RATIO/i)) {
    // Don't override any existing sample ratio expressions
    return query
  }
  const queryAST = getAST(query)

  const sampleRatioExpression = binaryExpression(
    { type: "number", value: `${limit.toFixed(2)}` },
    {
      // Prevents a divide by 0 bug
      // CASE WHEN COUNT(1) > 0 THEN CAST(COUNT(1) AS FLOAT) ELSE 1 END
      type: "case",
      expr: null,
      args: [
        {
          type: "when",
          cond: binaryExpression(
            {
              type: "aggr_func",
              name: "COUNT",
              args: {
                expr: { type: "number", value: 1 }
              }
            },
            { type: "number", value: 0 },
            ">"
          ),
          result: {
            type: "aggr_func",
            name: "COUNT",
            args: {
              expr: { type: "number", value: 1 }
            }
          }
        },
        { type: "else", result: { type: "number", value: 1 } }
      ]
    },
    "/"
  )

  const sampleRatioFilter = {
    type: "function",
    name: { name: { type: "default", value: "SAMPLE_RATIO" } },
    args: {
      type: "expr_list",
      value: [
        {
          ast: {
            type: "select",
            columns: [
              {
                type: "expr",
                expr: sampleRatioExpression
              }
            ],
            // Use filters + data sources from the original query
            from: queryAST.from,
            where: queryAST.where,
            limit: null
          }
        }
      ]
    }
  }
  // If we already have filters, make this an AND expression with the existing filters
  if (queryAST.where) {
    queryAST.where = binaryExpression(sampleRatioFilter, queryAST.where, "AND")
  } else {
    // Otherwise this is our only filter
    queryAST.where = sampleRatioFilter
  }

  return parser.sqlify(queryAST, parserOptions)
}

/**
 * Trims query provided, returns a new query projecting only the fields specified
 *
 * @param query Query to trim projected columns from
 * @param fields The fields to KEEP
 * @returns New sql query containing only the fields specified
 */
export const trimQueryFields = (query: string, fields: string[]) => {
  const queryAST = getAST(query)
  // ADDS query columns if it's select *, removes any extras if not
  if (isSelectStar(query)) {
    queryAST.columns = fields.map((f) => {
      return columnExpression(f)
    })
  } else {
    const allQueryColumns = queryAST.columns
    // Keeps the expression if it has columms matching our various dims/measures
    const allConfigColumns = allQueryColumns.filter((qc) => {
      const columns = columnsInExpression(qc)
      return intersection(columns, fields).length
    })
    queryAST.columns = allConfigColumns
  }

  // Should not affect the render unless a user limit is specified under 5M
  delete queryAST.orderby
  return parser.sqlify(queryAST, parserOptions)
}

/**
 * Creates a bounding box filter AST given values + fields to check
 *
 * @param The bounding box mins and maxes
 * @param Fields to check against each, minLonField > minLon, maxLonField < maxLon, etc...
 * @returns
 */
export const bboxFilterExpression = (
  [minLon, maxLon, minLat, maxLat]: [number, number, number, number],
  [minLonField, maxLonField, minLatField, maxLatField]: [
    object,
    object,
    object,
    object
  ]
) => {
  return binaryExpression(
    binaryExpression(
      binaryExpression(minLonField, { type: "number", value: minLon }, ">"),
      binaryExpression(maxLonField, { type: "number", value: maxLon }, "<"),
      "AND"
    ),

    binaryExpression(
      binaryExpression(minLatField, { type: "number", value: minLat }, ">"),
      binaryExpression(maxLatField, { type: "number", value: maxLat }, "<"),
      "AND"
    ),
    "AND"
  )
}

export const addBoundingBoxFilter = (
  chartKey: LAYER_TYPE,
  query: string,
  viewState: ViewState,
  mapConfig: MapSettings
) => {
  const [nw, se] = getBounds(viewState)
  const [minLon, maxLat] = nw
  const [maxLon, minLat] = se
  const origQueryAST = getAST(mapConfig.query)

  let bboxFilter = null
  switch (chartKey) {
    case LAYER_TYPE.POINT: {
      // If it's a point geometry, need to use ST_X, and ST_Y
      const latField = (mapConfig as PointMapSettings).latField
      const lonField = (mapConfig as PointMapSettings).lonField
      if (
        latField.type === VegaTypeMap.LATITUDE &&
        lonField.type === VegaTypeMap.LONGITUDE
      ) {
        const lonFieldExpr = findQueryColumn(origQueryAST, lonField.field).expr
        const latFieldExpr = findQueryColumn(origQueryAST, latField.field).expr
        bboxFilter = bboxFilterExpression(
          [minLon, maxLon, minLat, maxLat],
          [lonFieldExpr, lonFieldExpr, latFieldExpr, latFieldExpr]
        )
        break
      } else {
        const geomFieldExpr = findQueryColumn(
          origQueryAST,
          mapConfig.latField.field
        ).expr
        bboxFilter = bboxFilterExpression(
          [minLon, maxLon, minLat, maxLat],
          [
            funcWithAlias("ST_X", geomFieldExpr).expr,
            funcWithAlias("ST_X", geomFieldExpr).expr,
            funcWithAlias("ST_Y", geomFieldExpr).expr,
            funcWithAlias("ST_Y", geomFieldExpr).expr
          ]
        )
        break
      }
    }
    case LAYER_TYPE.LINE:
    case LAYER_TYPE.POLYGON:
    default: {
      const geomFieldExpr = findQueryColumn(
        origQueryAST,
        mapConfig.geomField.field
      ).expr
      bboxFilter = bboxFilterExpression(
        [minLon, maxLon, minLat, maxLat],
        [
          funcWithAlias("ST_XMAX", geomFieldExpr).expr,
          funcWithAlias("ST_XMIN", geomFieldExpr).expr,
          funcWithAlias("ST_YMAX", geomFieldExpr).expr,
          funcWithAlias("ST_YMIN", geomFieldExpr).expr
        ]
      )
    }
  }

  const queryAST = getAST(query)
  if (bboxFilter) {
    if (queryAST.where) {
      // AND this with existing filters if they exist
      queryAST.where = binaryExpression(queryAST.where, bboxFilter, "AND")
    } else {
      // If this is our only filter
      queryAST.where = bboxFilter
    }
  }

  return sqlify(queryAST)
}
