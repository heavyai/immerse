// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as ActionTypes from "constants/action-types"
import {
  setInitXDomain,
  setInitYDomain
} from "actions/init-domain-action-creators"
import { importableServices as Services } from "services/immerse-importable"
import { importableCreateQueuedConnector as createQueuedConnector } from "services/ConnectorWithQueue-importable"
import { importableProcess as processSQLParameters } from "utils/ImmerseSQLPlusPlus/parser-importable"
import { NUMERICAL_AND_TIME_TYPES as BINABLE_TYPES } from "constants/data-types"
import { getDataSource } from "reducers/charts/helpers/multi-source-helpers"
import {
  HEAT_DIMENSION_X_AXIS_NAME,
  HEAT_DIMENSION_Y_AXIS_NAME
} from "charts/heat/constants"
import {
  CARDINALITY_TOKEN,
  RASTER_STRIDE_TOKEN
} from "utils/ImmerseSQLPlusPlus/trackable-tokens"
import { getWindowFunctions } from "utils/windowfuncs"

export function swapSelectors(chartId, selectorType) {
  return (hoverIndex, dragIndex) => ({
    type: ActionTypes.SWAP_SELECTORS,
    chartId,
    selectorType,
    hoverIndex,
    dragIndex
  })
}

export function updateSelectorAction(
  chartId,
  selectorType,
  selectorIndex,
  setter
) {
  return {
    type: ActionTypes.UPDATE_SELECTOR,
    chartId,
    selectorType,
    selectorIndex,
    setter
  }
}

export function setSelectorError(id, { index, type }) {
  return {
    type: ActionTypes.SET_SELECTOR_ERROR,
    index,
    chartId: id,
    selectorType: type
  }
}

export function addMeasure(chartId, index, measure) {
  return function addMeasureThunk(dispatch) {
    measure.colorType = "quantitative" // because doing count unique category.
    dispatch({ type: ActionTypes.ADD_MEASURE, index, chartId, measure })
  }
}

export function setDimensionBinning(
  chartId,
  chartType,
  index,
  dimension,
  bounds,
  cardinality,
  elasticX,
  elasticY
) {
  return {
    type: ActionTypes.UPDATE_BIN_PARAMS,
    selectorIndex: index,
    chartId,
    chartType,
    dimension,
    cardinality,
    minMaxValues: {
      min_val: bounds[0],
      max_val: bounds[1]
    },
    elasticX,
    elasticY
  }
}

function getQueuedConnector(tableName, currentState = {}) {
  const dashboardId = (currentState.dashboard || {}).id
  const chartId = (currentState.chartEditor || {}).editId
  return createQueuedConnector({
    connector: Services.get("DbCon"),
    dashboardId,
    chartId,
    tableName
  })
}

export function getColumnType(column, table, currentState) {
  return getQueuedConnector(table, currentState)
    .validateQuery(`SELECT ${column} FROM ${table}`)
    .then((cols) => cols[0].type)
}

export function getCustomColumnMetadata(column, table, currentState) {
  // NOTE: this function is called when creating/editing custom SQL, both from
  // within the chart editor, and from the dashboard. Because it is called from
  // the dashboard, it can have NO knowledge of chart configuration such as
  // dimensions, measures, etc.
  const connector = getQueuedConnector(table, currentState)
  return connector
    .validateQuery(`SELECT ${column} FROM ${table}`)
    .catch((err) => {
      if (typeof column === "string") {
        const windowfuncs = getWindowFunctions(column)
        if (windowfuncs.length > 0) {
          // If validation failed, but we have a window function, let's try
          // validating again with an aggregate.  This is hacky, but without
          // knowledge of chart configuration, we need to massage our window
          // function to validate it... they generally take the form:
          //   func(...) over(...)
          //
          // We'll replace everything inside the over clause with "partition by 1
          // order by 1". That won't change the column's metadata, but will allow
          // us to control the aggregate. We need to count parentheses to find
          // the matching closing parenthesis.
          windowfuncs.reverse().forEach(({ index }) => {
            const parenthesesStart = column.indexOf("(", index)
            let parenthesesCount = 1
            for (let i = parenthesesStart + 1; i < column.length; i++) {
              if (column[i] === "(") {
                parenthesesCount++
              } else if (column[i] === ")") {
                parenthesesCount--
                if (parenthesesCount === 0) {
                  column = `${column.substring(
                    0,
                    parenthesesStart + 1
                  )}partition by 1 order by 1${column.substring(i)}`
                  break
                }
              }
            }
          })

          // lastly, we add a fake column to group-by for the aggregate
          const sql = `SELECT ${column}, 1 AS dim FROM ${table} GROUP BY dim`
          return connector.validateQuery(sql)
        }
      }

      // if there's no window function, just rethrow the error
      throw err
    })
    .then((cols) => {
      delete cols[0].name
      return cols[0]
    })
}

export function getCustomColumnMetadataGeoJoin(
  column,
  table, // datasource
  dimension,
  geoJoin,
  chartType,
  currentState
) {
  if (chartType === "linemap") {
    // When the dimension comes from a join, it comes as table.column. Since we're doing that below
    // we'll use label if its a join, which will only have the column name.
    const dimColumn = dimension.is_join ? dimension.label : dimension.value
    return getQueuedConnector(table, currentState)
      .validateQuery(
        `SELECT ${column} FROM ${table}, ${geoJoin.table} WHERE ${table}.${dimColumn} = ${geoJoin.table}.${geoJoin.column}`
      )
      .then((cols) => cols[0])
  } else {
    const processedColumn = processSQLParameters(column, { trackUsage: false })
    const { factProjections, factAliases, expression } = Services.get(
      "dc"
    ).parseFactsFromCustomSQL(table, "color", processedColumn)

    const projections = factProjections
      .map((projection, i) => `, ${projection} AS ${factAliases[i]}`)
      .join("")

    return getQueuedConnector(table, currentState)
      .validateQuery(
        `WITH color AS (
        SELECT ${dimension.value} AS key${projections}
        FROM ${table}
        GROUP BY key
      )
      SELECT ${expression}
      FROM ${geoJoin.table},color
      WHERE color.key = ${geoJoin.table}.${geoJoin.column}`
      )
      .then((cols) => cols[0])
  }
}

/**
 * This function retrieves column metadata for custom sql expression columns
 * for join data sources used in choropleth and line charts (auto aggregated by geometry)
 *
 * @param {*} column - Custom sql expression column
 * @param {*} dataSource - datasource name, should be a join and use parameter syntax
 * @param {*} currentState - redux state
 * @returns - Column metadata for the custom expression
 */
export function getCustomColumnMetadataJoinDataSource(
  column,
  dataSource,
  currentState
) {
  const processedColumn = processSQLParameters(column, { trackUsage: false })
  const query = `SELECT ${processedColumn} AS color0 from ${dataSource}`
  return getQueuedConnector(dataSource, currentState)
    .validateQuery(query)
    .then((cols) => cols[0])
}

export function getCardinality(
  column,
  table,
  currentState,
  token = CARDINALITY_TOKEN
) {
  return getQueuedConnector(table, currentState)
    .queryAsync(
      `SELECT APPROX_COUNT_DISTINCT(${column}) AS card FROM ${table}`,
      {},
      token
    )
    .then(([{ card }]) => card)
}

export const getHeatDimensionBinningAsync = (
  chartId,
  chartType,
  index,
  dimension,
  dcChart
) => async (dispatch, getState, services) => {
  const chart = getState().charts[chartId]
  const table = getDataSource(chart)
  const { dimensions } = chart
  const [xDimension, yDimension] = dimensions

  const xPs = BINABLE_TYPES[xDimension.type]
    ? [
        services
          .get("crossfilter")
          .getCrossfilter(table, chartId)
          .getMinMax(
            xDimension.value,
            { min: "min_val", max: "max_val" },
            { token: "minmax/x" }
          ),
        getCardinality(
          xDimension.value,
          table,
          getState(),
          `cardinality/binning/xDim`
        )
      ]
    : [Promise.resolve(), Promise.resolve()]

  const yPs = BINABLE_TYPES[yDimension.type]
    ? [
        services
          .get("crossfilter")
          .getCrossfilter(table, chartId)
          .getMinMax(
            yDimension.value,
            { min: "min_val", max: "max_val" },
            { token: "minmax/y" }
          ),
        getCardinality(
          yDimension.value,
          table,
          getState(),
          `cardinality/binning/yDim`
        )
      ]
    : [Promise.resolve(), Promise.resolve()]

  const [xBounds, xCardinality, yBounds, yCardinality] = await Promise.all([
    ...xPs,
    ...yPs
  ])
  if (xBounds) {
    dcChart.originalXMinMax = xBounds
    dispatch(setInitXDomain(xBounds, chartId, HEAT_DIMENSION_X_AXIS_NAME))
    if (index === 0 && dcChart.elasticX()) {
      dcChart.x().domain(xBounds)
    }
  }
  if (yBounds) {
    dcChart.originalYMinMax = yBounds
    dispatch(setInitYDomain(yBounds, chartId, HEAT_DIMENSION_Y_AXIS_NAME))
    if (index === 1 && dcChart.elasticY()) {
      dcChart.y().domain(yBounds)
    }
  }
  if (BINABLE_TYPES[dimension.type]) {
    dispatch(
      setDimensionBinning(
        chartId,
        chartType,
        index,
        dimension,
        index === 0 ? xBounds : yBounds,
        index === 0 ? xCardinality : yCardinality,
        dcChart.elasticX(),
        dcChart.elasticY()
      )
    )
  }
}

export function discardInactiveSelectors(chartId) {
  return {
    type: ActionTypes.DISCARD_INACTIVE_SELECTORS,
    chartId
  }
}

export function getRasterStride({
  latColumn,
  lonColumn,
  table,
  chartId,
  dashboardId,
  token = RASTER_STRIDE_TOKEN
}) {
  const isPoint = latColumn.type === "POINT"
  const lonColumnName = isPoint ? `ST_X(${lonColumn.value})` : lonColumn.value
  const latColumnName = isPoint ? `ST_Y(${latColumn.value})` : latColumn.value
  const precision = 0.00001
  const query = `with xd as (
    select avg(delta * ${precision}) as avg_x_delta
    from
      (
        select x - lag(x) over (order by x) as delta
        from (select distinct(cast(${lonColumnName} / ${precision} as int)) as x from ${table})
      )
  ),
  yd as (
    select avg(delta * ${precision}) as avg_y_delta
    from
      (
        select y - lag(y) over (order by y) as delta
        from (select distinct(cast(${latColumnName} / ${precision} as int)) as y from ${table})
      )
  )
  select * from xd, yd`

  const queuedConnector = createQueuedConnector({
    connector: Services.get("DbCon"),
    dashboardId,
    chartId,
    tableName: table
  })
  return queuedConnector.queryAsync(query, {}, token).then((cols) => cols[0])
}
