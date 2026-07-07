// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import moment from "moment"
import { importableStore as store } from "store/importableStore"
import { isBERendered } from "charts/raster-chart/raster-utils"
import { CHART_TYPES } from "constants/charts"
import { getTablesForFilter } from "vega/utils/filter"
import { chartSupportsChartSpecificFilters } from "charts/utils/chart-type"
import { makeBinEndDate, makeBinStartDate } from "./utils-date-bin"
import {
  makeGetParameterColumnsForTable,
  makeGetParametersOfType
} from "components/parameters/selectors"
import { ParameterTypes } from "components/parameters/parameters-types"
import { importableProcess as process } from "utils/ImmerseSQLPlusPlus/parser-importable"
import { intersection, snakeCase } from "lodash"
import RESERVED_COLUMN_NAME_SET from "constants/reserved-column-names"
import { createProjectMeasures } from "utils/helpers"
import { hasParamSyntax, toParameterSyntax } from "utils/parameters"
import {
  getFullColumnName,
  getTablesForDataSource
} from "components/join-manager/utils"

export const getStore = () => {
  return store
}

// you probably don't want to use this directly. This one and the internal method really only
// exist because crossfilter lives in this weird parallel shadow world outside of the real react
// world we all want to live in. That said, the logic of pulling out appropriate filters is useful!
//
// But you still probably don't want to use this directly. Go use the hooks in charts/utils/hooks/useFilter
// instead. They route to here anyway, but keep things nicely synced with the store.
export function getChartFilters(chartId, table, layerId, useFakeChart) {
  const state = getStore().getState()
  const chart = useFakeChart ? undefined : state.charts[chartId]
  const omnifilters = state.omnifilters

  return getChartFiltersInternal({
    chartId,
    tables: [table],
    layerId,
    chart,
    omnifilters
  })
}

export function getChartFiltersInternal({
  chartId,
  tables,
  layerId,
  chart = {},
  omnifilters = [],
  excludeChartFilters = []
}) {
  if (chartId === undefined) {
    return []
  }

  if (chart === undefined) {
    return []
  }

  // my life is pain. We can't just look at the chart's type to check for self-application.
  // because it could be a multi-layer chart. So we actually need to find a layer that matches
  // our table and if THAT is BERendered AND it's a simple filter, then we self-apply. Fun.

  let selfApplyBERendered =
    isBERendered(chart.type) || chart.type === CHART_TYPES.BACKEND_CHOROPLETH
  const isGeoJoin = chart && chart.geoJoin && chart.geoJoin.table
  const excludeChartFilterSet = new Set(excludeChartFilters)

  const layers = []
  if (chart.layers) {
    if (layerId === "master" || layerId === undefined) {
      layers.push(...chart.layers)
    } else if (chart.layers[layerId]) {
      layers.push(chart.layers[layerId])
    }
  }

  if (layers.length > 1) {
    layers.forEach((layer) => {
      const layerTables = getTablesForDataSource(layer.dataSource)
      if (intersection(tables, layerTables).length) {
        selfApplyBERendered =
          isBERendered(layer.type) ||
          layer.type === CHART_TYPES.BACKEND_CHOROPLETH
      }
    })
  }

  const selfApplyFilters =
    (chart && selfApplyBERendered && !isGeoJoin) ||
    Boolean(chart.selfApplyFilters) ||
    (chart.type === "table" &&
      !chart.dimensions.some((d) => d.value !== undefined))

  return omnifilters.filter((filterMetaData) => {
    // If any tables are shared, grab the filter. The string will be
    // generated per table (source) so will only include relevant filters
    // from multisource filters

    const hasSharedTables = Array.from(
      getTablesForFilter(filterMetaData)
    ).some((filterTable) => tables.includes(filterTable))
    const layerIdValid =
      layerId === undefined ||
      filterMetaData.layerId === undefined ||
      filterMetaData.layerId === layerId
    const appliesToChart =
      chartSupportsChartSpecificFilters(chart) &&
      filterMetaData.appliesTo === "CHART" &&
      filterMetaData.chartId === chartId &&
      layerIdValid
    const applyCrossfilters =
      // we have a crossfilter and it doesn't match the chart's id or selfApplyFilters is true
      // which is true when a layer matches the data source and is BE rendered
      filterMetaData.appliesTo === "CROSSFILTER" &&
      (filterMetaData.chartId !== chartId || selfApplyFilters)
    const notExcluded =
      // AND the filter doesn't match an excluded filter
      !excludeChartFilterSet.has(filterMetaData.name)

    return (
      filterMetaData.enabled &&
      hasSharedTables &&
      (appliesToChart || applyCrossfilters) &&
      notExcluded
    )
  })
}

// you probably don't want to use this directly. This one and the internal method really only
// exist because crossfilter lives in this weird parallel shadow world outside of the real react
// world we all want to live in. That said, the logic of pulling out appropriate filters is useful!
//
// But you still probably don't want to use this directly. Go use the hooks in charts/utils/hooks/useFilter
// instead. They route to here anyway, but keep things nicely synced with the store.
export function getDashboardFilters(table, excludeFilters = []) {
  const state = getStore().getState()
  const omnifilters = state.omnifilters

  return getDashboardFiltersInternal({
    tables: [table],
    omnifilters,
    excludeFilters
  })
}

export function getDashboardFiltersInternal({
  tables,
  excludeFilters = [],
  omnifilters = []
}) {
  const excludeFilterSet = new Set(excludeFilters)
  return omnifilters.filter((filterMetaData) => {
    // If any tables are shared, grab the filter. The string will be
    // generated per table (source) so will only include relevant filters
    // from multisource filters
    const hasSharedTables = Array.from(
      getTablesForFilter(filterMetaData)
    ).some((filterTable) => tables.includes(filterTable))
    return (
      filterMetaData.enabled &&
      hasSharedTables &&
      filterMetaData.appliesTo === "GLOBAL" &&
      !excludeFilterSet.has(filterMetaData.name)
    )
  })
}

export function isRelative(sqlStr) {
  return /DATE_ADD\(([^,|.]+), (DATEDIFF\(\w+, ?\d+, ?\w+\(\)\)[-+0-9]*|[-0-9]+), ([0-9]+|NOW\(\))\)|NOW\(\)/g.test(
    sqlStr
  )
}

const TYPES = {
  undefined: "undefined",
  number: "number",
  boolean: "boolean",
  string: "string",
  "[object Function]": "function",
  "[object RegExp]": "regexp",
  "[object Array]": "array",
  "[object Date]": "date",
  "[object Error]": "error"
}

export function type(o) {
  return (
    TYPES[typeof o] ||
    TYPES[Object.prototype.toString.call(o)] ||
    (o ? "object" : "null")
  )
}

export function formatFilterValue(value, wrapInQuotes, isExact) {
  const valueType = type(value)
  if (valueType === "string") {
    let escapedValue = value.replace(/'/g, "''")

    if (!isExact) {
      escapedValue = escapedValue.replace(/%/g, "\\%")
      escapedValue = escapedValue.replace(/_/g, "\\_")
    }

    return wrapInQuotes ? `'${escapedValue}'` : escapedValue
  } else if (valueType === "date") {
    return `TIMESTAMP(3) '${value
      .toISOString()
      .slice(0, -1)
      .replace("T", " ")}'`
  } else {
    return value
  }
}

export function replaceRelative(sqlStr) {
  const relativeDateRegex = /DATE_ADD\(([^,|.]+), (DATEDIFF\(\w+, ?\d+, ?\w+\(\)\)[-+0-9]*|[-0-9]+), ([0-9]+|NOW\(\))\)/g
  const now = moment().utc()
  const withRelative = sqlStr.replace(
    relativeDateRegex,
    (match, datepart, number) => {
      if (isNaN(number)) {
        const num = Number(number.slice(number.lastIndexOf(")") + 1))
        if (isNaN(num)) {
          return formatFilterValue(now.clone().startOf(datepart).toDate(), true)
        } else {
          return formatFilterValue(
            now.clone().add(num, datepart).utc().startOf(datepart).toDate(),
            true
          )
        }
      } else {
        return formatFilterValue(
          now.clone().add(number, datepart).toDate(),
          true
        )
      }
    }
  )
  return withRelative.replace(
    /NOW\(\)/g,
    formatFilterValue(now.clone().toDate(), true)
  )
}

export function unBinResults(queryBinParams, results) {
  const unbinnedResults = [...results]
  const numRows = results.length
  for (let b = 0; b < queryBinParams.length; b += 1) {
    if (queryBinParams[b] === null) {
      // eslint-disable-next-line no-continue
      continue
    }

    const queryBinParam = queryBinParams[b]
    const { numBins, binBounds, extract } = queryBinParam
    const keyName = `key${b}`

    if (binBounds[0] instanceof Date && binBounds[1] instanceof Date) {
      const timeBin = queryBinParam.timeBin

      if (extract) {
        for (let r = 0; r < numRows; r += 1) {
          const result = results[r][keyName]
          if (result !== null) {
            unbinnedResults[r] = {
              ...unbinnedResults[r],
              [keyName]: [
                {
                  value: result,
                  timeBin,
                  isExtract: true,
                  extractUnit: timeBin
                }
              ]
            }
          }
        }
        // jscs:enable
      } else {
        for (let r = 0; r < numRows; r += 1) {
          const result = results[r][keyName]
          if (result !== null) {
            // jscs:disable

            const minValue =
              result instanceof Date
                ? result
                : makeBinStartDate(binBounds[0], timeBin, result)

            const min = {
              value: minValue,
              timeBin,
              isBin: true,
              binUnit: timeBin
            }

            const maxValue = makeBinEndDate(minValue, timeBin)
            const max = {
              value: maxValue,
              timeBin,
              isBin: true,
              binUnit: timeBin
            }

            // jscs:enable
            unbinnedResults[r] = {
              ...unbinnedResults[r],
              [keyName]: [min, max]
            }
          }
        }
      }
    } else {
      const unitsPerBin = (binBounds[1] - binBounds[0]) / numBins
      for (let r = 0; r < numRows; r += 1) {
        if (results[r][keyName] !== null) {
          const min = results[r][keyName] * unitsPerBin + binBounds[0]
          const max = min + unitsPerBin
          unbinnedResults[r] = {
            ...unbinnedResults[r],
            [keyName]: [
              min < binBounds[0] ? binBounds[0] : min,
              max > binBounds[1] ? binBounds[1] : max
            ]
          }
        }
      }
    }
  }

  return unbinnedResults
}

export const getExpressionAlias = (expression) => {
  const { agg_mode, measureName } = expression || {}
  return `${expression.name} AS ${snakeCase(
    `${agg_mode}_${process(measureName, { useDisplayName: true })}`
  )}`
}

const mapCustomExpressionStringsToDimensionLabels = (
  crossFilterDimension,
  dimensions
) =>
  crossFilterDimension
    .getDimensionName()
    .map((expressionString, i) =>
      dimensions[i].custom ? dimensions[i].label : expressionString
    )

export const getUnbinnedQuery = (
  query,
  { chartId },
  crossFilterDimension,
  crossFilterGroup
) => {
  const { charts } = getStore().getState()
  const { dimensions, measures } = charts[chartId]

  if (crossFilterGroup) {
    const columnNames = mapCustomExpressionStringsToDimensionLabels(
      crossFilterDimension,
      dimensions
    )

    const binParams = crossFilterGroup.binParams() || []
    const expressions = (crossFilterGroup.getExpressions() || []).filter(
      ({ agg_mode, name }) => agg_mode !== "count" && name !== "val"
    ) // Filter out "hidden" count(*) from select
    const expressionsAliases = expressions.map(getExpressionAlias)

    const queryBits = binParams.reduce(
      (result, params, i) => {
        const unBinnedColumn = !params
        const { binBounds = [], numBins = 0 } = params || {}
        const [minBounds = 0, maxBounds = 0] = binBounds
        let columnName = snakeCase(
          process(columnNames[i], { useDisplayName: true })
        )
        if (RESERVED_COLUMN_NAME_SET.has(columnName.toUpperCase())) {
          columnName += "_"
        }
        const unitsPerBin = ((maxBounds - minBounds) / numBins).toFixed(4)
        const castClause = `(CAST(key${i} AS DECIMAL(12, 2)) * ${unitsPerBin}) + ${minBounds} AS ${columnName}BinMin`
        const isDateColumn = [minBounds, maxBounds].every(
          (bounds) => bounds instanceof Date
        )
        const selectAsIs = isDateColumn || unBinnedColumn
        return {
          finalColumns: [
            ...result.finalColumns,
            ...(selectAsIs
              ? [`key${i} AS ${columnName}`]
              : [
                  `${columnName}BinMin`,
                  `${columnName}BinMin + ${unitsPerBin} AS ${columnName}BinMax`
                ])
          ],
          castClauses: [
            ...result.castClauses,
            selectAsIs ? `key${i}` : castClause
          ],
          selectedAsIs: [...result.selectedAsIs, selectAsIs]
        }
      },
      {
        finalColumns: [],
        castClauses: [],
        selectedAsIs: []
      }
    )

    const allSelectedAsIs = queryBits.selectedAsIs.every((value) =>
      Boolean(value)
    )
    const castSubQuery = `SELECT ${queryBits.castClauses.join(
      ", "
    )}, ${crossFilterGroup.getReduceVars()} FROM (${query})`

    return process(
      `SELECT ${queryBits.finalColumns.join(", ")}${
        expressionsAliases.length ? `, ${expressionsAliases.join(", ")}` : ""
      } FROM (${
        allSelectedAsIs ? query : castSubQuery
      }) ${crossFilterGroup.getCurrentOrderBySegment(true).join(" ")}`,
      { trackUsage: false }
    )
  }
  return `SELECT ${createProjectMeasures(measures, true)} FROM (${query})`
}

export function getLayerIdFromName(layerName, chart) {
  if (layerName === undefined) {
    return layerName
  }
  const m = layerName.match(/Layer(\d+)$/)
  const layerId = m ? parseInt(m[1], 10) : undefined

  // fine. The weird case. If we've gotten to here and we have a layer name but NOT a layerID
  // that means it doesn't match the pattern. That means we're in the chart editor when the name
  // is still just the layer type, and not the real one. Fix it.

  // return layer id, if we found one
  if (layerId !== undefined) {
    return layerId
  }
  // otherwise, if we have a valid chart and it has a currentLayer, send that back.
  else if (chart && chart.currentLayer) {
    return chart.currentLayer
  }
  // Scatter chart is not multilayer chart, so return undefined for layerId
  else if (layerName === "backendScatter") {
    return undefined
  }
  // oh! but if it's a -single- layer chart, then it's not named either. In that case, just return 0.
  else {
    return 0
  }
}

export function enhanceTables(tables = []) {
  // if we've been given no tables to enhance, then we just return what we've got.
  const thisStore = getStore()
  if (!tables.length || !thisStore.getState) {
    return tables
  }

  const enhancedTables = [...tables]
  const state = thisStore.getState()
  const tableParams = makeGetParametersOfType(state)(ParameterTypes.TABLE)

  // Add join data sources
  state.joinDataSources.forEach((jds) => {
    enhancedTables.push({
      name: jds.name,
      // Removes label, add type, parameter, and datasource
      type: ParameterTypes.JOIN,
      parameter: jds.parameter,
      dataSource: toParameterSyntax(jds.parameter)
    })
  })

  tableParams.forEach((tableParam) =>
    enhancedTables.push({
      // TODO: Add a dataSource here that is the parameter, and that
      // will allow the name to be param name
      name: toParameterSyntax(tableParam),
      label: "obs"
    })
  )

  return enhancedTables.sort((a, b) => a.name.localeCompare(b.name))
}

export function enhanceColumnMetadata(columnMetadata = [], table = null) {
  // if we've been given no columnMetadata to enhance, then we just return what we've got.
  const thisStore = getStore()
  if (!columnMetadata.length || !thisStore.getState) {
    return columnMetadata
  }

  const enhancedColumnMetadata = [...columnMetadata]

  // these all should be the same table, so just pull out the first one.
  table = table || columnMetadata[0].table

  const state = thisStore.getState()

  const paramColumns = makeGetParameterColumnsForTable(state)(table)
  Object.entries(paramColumns).forEach(([paramName, column]) => {
    const existingColumn = columnMetadata.find(
      (metadata) => getFullColumnName(metadata, "value") === column
    )

    const parameter = toParameterSyntax(paramName)
    enhancedColumnMetadata.push({
      ...existingColumn,
      column: parameter,
      label: parameter,
      value: parameter,
      parameter: true
    })
  })

  return enhancedColumnMetadata
}

// this just gets the field info for the table, along with objects to populate from it.
// it all slots directly into the sharedCrossFilter

export function getCustomTableExpressionFields({
  connector,
  table,
  columnTypeMap = {},
  columnNameCountMap = {}
}) {
  const tableStmt = `SELECT * from ${table}`
  return connector.validateQuery(process(tableStmt)).then((res) => {
    res.forEach((element) => {
      const compoundName = `${table}.${element.name}`
      columnTypeMap[compoundName] = {
        table,
        column: element.name,
        type: element.type,
        precision: element.precision,
        is_array: element.is_array,
        is_dict: element.is_dict,
        name_is_ambiguous: false
      }
      columnNameCountMap[element.name] =
        columnNameCountMap[element.name] === undefined
          ? 1
          : columnNameCountMap[element.name] + 1
    })
    return res
  })
}

function getTableFields({
  connector,
  table,
  compoundColumnMap = {},
  columnTypeMap = {},
  columnNameCountMap = {},
  tableDescriptors = [],
  joinDataSources = [],
  isJoin = false
}) {
  if (hasParamSyntax(table)) {
    return getCustomTableExpressionFields({
      connector,
      table,
      compoundColumnMap,
      columnTypeMap,
      columnNameCountMap,
      tableDescriptors,
      joinDataSources
    })
  }

  return connector.getFieldsAsync(table).then((tableDescriptor) => {
    tableDescriptors.push(tableDescriptor)
    const columns = [...tableDescriptor.columns]
    tableDescriptor.columns.forEach((element, i) => {
      const compoundName = `${table}.${element.name}`
      columnTypeMap[compoundName] = {
        table,
        column: element.name,
        type: element.type,
        precision: element.precision,
        is_array: element.is_array,
        is_dict: element.is_dict,
        is_join: isJoin,
        name_is_ambiguous: false
      }
      columnNameCountMap[element.name] =
        columnNameCountMap[element.name] === undefined
          ? 1
          : columnNameCountMap[element.name] + 1

      columns[i] = {
        ...element,
        table,
        column: element.name,
        is_join: isJoin
      }
    })

    for (const key in columnTypeMap) {
      if (columnNameCountMap[columnTypeMap[key].column] > 1) {
        columnTypeMap[key].name_is_ambiguous = true
      } else {
        compoundColumnMap[columnTypeMap[key].column] = key
      }
    }

    return columns
  })
}

export async function getFields({
  connector,
  tables,
  compoundColumnMap = {},
  columnTypeMap = {},
  columnNameCountMap = {},
  tableDescriptors = []
}) {
  const isJoin = tables.length > 1
  const columns = []
  for (const table of tables) {
    let tableColumns = []
    if (hasParamSyntax(table)) {
      tableColumns = await getCustomTableExpressionFields({
        connector,
        table,
        compoundColumnMap,
        columnTypeMap,
        columnNameCountMap,
        tableDescriptors
      })
    } else {
      tableColumns = await getTableFields({
        connector,
        table,
        compoundColumnMap,
        columnTypeMap,
        columnNameCountMap,
        tableDescriptors,
        isJoin
      })
    }
    columns.push(...tableColumns)
  }

  return {
    columns,
    compoundColumnMap,
    columnTypeMap,
    columnNameCountMap,
    tableDescriptors
  }
}
