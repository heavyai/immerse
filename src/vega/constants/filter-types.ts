// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import moment from "moment"
import * as HeavyAIDraw from "import-shims/heavyai-draw"
import * as LatLonUtils from "vega/charts/raster/utils-latlon"

import sqltag from "vega/utils/sql-tag"

import { isDateType, isTimeType } from "constants/data-types"
import { DataType } from "constants/prop-types"
import { DATETIME_FORMAT, TIME_FORMAT } from "constants/magic-variables"

import {
  getDataSourcesForFilter,
  formatCoordinate,
  getTablesForFilter
} from "vega/utils/filter"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

import {
  FILTER_TYPE_ISNULL,
  FILTER_TYPE_ISNOTNULL,
  FILTER_TYPE_SIMPLE,
  FILTER_TYPE_BETWEEN,
  FILTER_TYPE_IN,
  FILTER_TYPE_NOT_IN,
  FILTER_TYPE_POLYGON,
  FILTER_TYPE_ST_CONTAINS,
  FILTER_TYPE_ST_INTERSECTS,
  FILTER_TYPE_DISTANCE,
  FILTER_TYPE_ST_DISTANCE,
  FILTER_TYPE_BOUNDING_BOX,
  FILTER_TYPE_NOT,
  FILTER_TYPE_UNLIKELY,
  FILTER_TYPE_AND,
  FILTER_TYPE_OR,
  FILTER_TYPE_MULTISOURCE,
  FILTER_TYPE_EMPTY_COHORT,
  FILTER_TYPE_SQL
} from "vega/constants/filter-type-constants"
import { getTablesForDataSource } from "components/join-manager/utils"
import { hasParamSyntax } from "utils/parameters"

export type FilterValue = any
export type Point = [number, number]
export type SimpleOperator =
  | "="
  | "<>"
  | "<"
  | ">"
  | "<="
  | ">="
  | "LIKE"
  | "ILIKE"
  | "STARTS_WITH"
  | "ISTARTS_WITH"
  | "ENDS_WITH"
  | "IENDS_WITH"

export type DatePart =
  | "DECADE"
  | "YEAR"
  | "QUARTER"
  | "MONTH"
  | "WEEK"
  | "DAY"
  | "HOUR"
  | "MINUTE"
  | "SECOND"
  | "MILLISECOND"
  | "MICROSECOND"
  | "NANOSECOND"

export type SimpleAggregateFilterDataExpression = {
  type: "SimpleAggregateFilterDataExpression"
  value: string
  function: string
}

export type FilterDataExpression = SimpleAggregateFilterDataExpression | string
export function isSimpleAggregate(
  dataExpression: any
): dataExpression is SimpleAggregateFilterDataExpression {
  return Boolean(
    dataExpression &&
      dataExpression.type === "SimpleAggregateFilterDataExpression"
  )
}

export type BaseFilter = {
  table: string
  dataExpression: FilterDataExpression
  dataSource: string
  dataType: DataType
  dataTypeIsArray?: boolean
  extract?: string
}
export function isBaseFilter(filter: any): filter is BaseFilter {
  return Boolean(filter && filter.dataSource && filter.dataExpression)
}

export type BaseLatLonFilter = {
  table: string
  dataSource: string
  latExpression: string
  lonExpression: string
  latDataType: DataType
  lonDataType: DataType
}
export function isBaseLatLonFilter(filter: any): filter is BaseLatLonFilter {
  return Boolean(filter && filter.latExpression && filter.lonExpression)
}

export type NullFilter = BaseFilter & {
  filterType: typeof FILTER_TYPE_ISNULL
}
export function nullFilter(
  table: string,
  dataSource: string,
  dataExpression: string,
  dataType: DataType,
  options: {
    dataTypeIsArray?: boolean
    extract?: string
  } = {}
): NullFilter {
  return {
    filterType: FILTER_TYPE_ISNULL,
    dataSource,
    table,
    dataExpression,
    dataType,
    dataTypeIsArray: options.dataTypeIsArray,
    extract: options.extract
  }
}

export type NotNullFilter = BaseFilter & {
  filterType: typeof FILTER_TYPE_ISNOTNULL
}
export function notNullFilter(
  table: string,
  dataSource: string,
  dataExpression: string,
  dataType: DataType,
  options: {
    dataTypeIsArray?: boolean
    extract?: string
  } = {}
): NotNullFilter {
  return {
    table,
    filterType: FILTER_TYPE_ISNOTNULL,
    dataSource,
    dataExpression,
    dataType,
    dataTypeIsArray: options.dataTypeIsArray,
    extract: options.extract
  }
}

export type SimpleFilter = BaseFilter & {
  filterType: typeof FILTER_TYPE_SIMPLE
  operator: SimpleOperator
  value: FilterValue
  caseSensitive?: boolean
}
export function simpleFilter(
  table: string,
  dataSource: string,
  dataExpression: string,
  dataType: DataType,
  operator: SimpleOperator,
  value: FilterValue,
  options: {
    caseSensitive?: boolean
    dataTypeIsArray?: boolean
    extract?: string
  } = {}
): SimpleFilter {
  return {
    filterType: FILTER_TYPE_SIMPLE,
    dataExpression,
    dataSource,
    table,
    dataType,
    caseSensitive: options.caseSensitive,
    dataTypeIsArray: options.dataTypeIsArray,
    extract: options.extract,
    operator,
    value
  }
}

export type BetweenFilter = BaseFilter & {
  filterType: typeof FILTER_TYPE_BETWEEN
  isRelative: false
  start: FilterValue
  end: FilterValue
}
export function betweenFilter(
  table: string,
  dataSource: string,
  dataExpression: string,
  dataType: DataType,
  start: FilterValue,
  end: FilterValue,
  options: {
    dataTypeIsArray?: boolean
    extract?: string
  } = {}
): BetweenFilter {
  return {
    table,
    filterType: FILTER_TYPE_BETWEEN,
    isRelative: false,
    dataExpression,
    dataSource,
    dataType,
    dataTypeIsArray: options.dataTypeIsArray,
    extract: options.extract,
    start,
    end
  }
}

export type InFilter = BaseFilter & {
  filterType: typeof FILTER_TYPE_IN
  values: FilterValue[]
}
export function inFilter(
  table: string,
  dataSource: string,
  dataExpression: string,
  dataType: DataType,
  values: FilterValue[],
  options: {
    dataTypeIsArray?: boolean
    extract?: string
  } = {}
): InFilter {
  return {
    filterType: FILTER_TYPE_IN,
    dataExpression,
    dataSource,
    table,
    dataType,
    dataTypeIsArray: options.dataTypeIsArray,
    extract: options.extract,
    values
  }
}

export type NotInFilter = BaseFilter & {
  filterType: typeof FILTER_TYPE_NOT_IN
  values: FilterValue[]
}
export function notInFilter(
  table: string,
  dataSource: string,
  dataExpression: string,
  dataType: DataType,
  values: FilterValue[],
  options: {
    dataTypeIsArray?: boolean
    extract?: string
  } = {}
): NotInFilter {
  return {
    filterType: FILTER_TYPE_NOT_IN,
    dataExpression,
    dataSource,
    table,
    dataType,
    dataTypeIsArray: options.dataTypeIsArray,
    extract: options.extract,
    values
  }
}

export type RelativeOperand =
  | "NOW"
  | FilterValue
  | {
      func: "ADD"
      datePart: DatePart
      adjustment: number
      value: RelativeOperand
    }
  | {
      func: "TRUNC"
      datePart: DatePart
      value: RelativeOperand
    }
export type RelativeFilter = BaseFilter & {
  filterType: typeof FILTER_TYPE_BETWEEN
  isRelative: true
  start: RelativeOperand
  end: RelativeOperand
}
export function relativeFilter(
  table: string,
  dataSource: string,
  dataExpression: string,
  dataType: DataType,
  start: RelativeOperand,
  end: RelativeOperand
): RelativeFilter {
  return {
    filterType: FILTER_TYPE_BETWEEN,
    isRelative: true,
    dataExpression,
    dataSource,
    table,
    dataType,
    start,
    end
  }
}

export type PolygonFilter = BaseLatLonFilter & {
  filterType: typeof FILTER_TYPE_POLYGON
  points: Point[]
  aabox?: number[]
  useLonLat?: boolean
  boundingBox?: {
    xmin: number
    xmax: number
    ymin: number
    ymax: number
  }
}
export function polygonFilter(
  table: string,
  dataSource: string,
  latExpression: string,
  lonExpression: string,
  latDataType: DataType,
  lonDataType: DataType,
  points: Point[],
  boundingBox?: PolygonFilter["boundingBox"]
): PolygonFilter {
  return {
    table,
    filterType: FILTER_TYPE_POLYGON,
    dataSource,
    latExpression,
    lonExpression,
    latDataType,
    lonDataType,
    points,
    boundingBox
  }
}

export type STPolygonFilterTypes =
  | typeof FILTER_TYPE_ST_CONTAINS
  | typeof FILTER_TYPE_ST_INTERSECTS
export type STPolygonFilter = BaseFilter & {
  filterType: STPolygonFilterTypes
  polygon: Point[]
}
export function stPolygonFilter(
  table: string,
  dataSource: string,
  dataExpression: string,
  dataType: DataType,
  filterType: STPolygonFilterTypes,
  polygon: Point[]
): STPolygonFilter {
  return {
    filterType,
    dataExpression,
    dataSource,
    table,
    dataType,
    polygon
  }
}

export type DistanceFilter = BaseLatLonFilter & {
  filterType: typeof FILTER_TYPE_DISTANCE
  point: Point
  distanceInMeters: number
}
export function distanceFilter(
  table: string,
  dataSource: string,
  latExpression: string,
  lonExpression: string,
  latDataType: DataType,
  lonDataType: DataType,
  point: Point,
  distanceInMeters: number
): DistanceFilter {
  return {
    filterType: FILTER_TYPE_DISTANCE,
    dataSource,
    table,
    latExpression,
    lonExpression,
    latDataType,
    lonDataType,
    point,
    distanceInMeters
  }
}

export type STDistanceFilter = BaseFilter & {
  filterType: typeof FILTER_TYPE_ST_DISTANCE
  point: Point
  distanceInKM: number
}
export function stDistanceFilter(
  table: string,
  dataSource: string,
  dataExpression: string,
  dataType: DataType,
  point: Point,
  distanceInKM: number
): STDistanceFilter {
  return {
    filterType: FILTER_TYPE_ST_DISTANCE,
    table,
    dataSource,
    dataExpression,
    dataType,
    point,
    distanceInKM
  }
}

export type BoundingBoxLatLonFilter = BaseLatLonFilter & {
  filterType: typeof FILTER_TYPE_BOUNDING_BOX
  latMin: number
  latMax: number
  lonMin: number
  lonMax: number
}
export type BoundingBoxGeoFilter = {
  filterType: typeof FILTER_TYPE_BOUNDING_BOX
  dataSource: string
  table: string
  geoExpression: string
  geoDataType: DataType
  latMin: number
  latMax: number
  lonMin: number
  lonMax: number
}
export type BoundingBoxFilter = BoundingBoxLatLonFilter | BoundingBoxGeoFilter
export function boundingBoxFilter(
  table: string,
  dataSource: string,
  latExpression: string,
  lonExpression: string,
  latDataType: DataType,
  lonDataType: DataType,
  latMin: number,
  latMax: number,
  lonMin: number,
  lonMax: number
): BoundingBoxFilter {
  return {
    filterType: FILTER_TYPE_BOUNDING_BOX,
    latExpression,
    lonExpression,
    latDataType,
    lonDataType,
    dataSource,
    table,
    latMin,
    latMax,
    lonMin,
    lonMax
  }
}
export function boundingBoxGeoFilter(
  table: string,
  dataSource: string,
  geoExpression: string,
  geoDataType: DataType,
  latMin: number,
  latMax: number,
  lonMin: number,
  lonMax: number
): BoundingBoxFilter {
  return {
    filterType: FILTER_TYPE_BOUNDING_BOX,
    geoExpression,
    geoDataType,
    dataSource,
    table,
    latMin,
    latMax,
    lonMin,
    lonMax
  }
}
export function isBoundingBoxGeoFilter(
  filter: BoundingBoxFilter
): filter is BoundingBoxGeoFilter {
  return "geoExpression" in filter
}

export type FilterWithChild = {
  filter: Filter
}
export function filterHasChild(filter: any): filter is FilterWithChild {
  return Boolean(filter && filter.filter)
}

export type NegatedFilter = FilterWithChild & {
  filterType: typeof FILTER_TYPE_NOT
}
export function notFilter(filter: Filter): NegatedFilter {
  return {
    filterType: FILTER_TYPE_NOT,
    filter
  }
}

export type UnlikelyFilter = FilterWithChild & {
  filterType: typeof FILTER_TYPE_UNLIKELY
}
export function unlikelyFilter(filter: Filter): UnlikelyFilter {
  return {
    filterType: FILTER_TYPE_UNLIKELY,
    filter
  }
}

export type FilterWithChildren = {
  filters: Filter[]
}
export function filterHasChildren(filter: any): filter is FilterWithChildren {
  return Boolean(filter && filter.filters)
}

export type ConjunctiveFilter = FilterWithChildren & {
  filterType: typeof FILTER_TYPE_AND
}
export function andFilter(filters: Filter[]): ConjunctiveFilter {
  return {
    filterType: FILTER_TYPE_AND,
    filters
  }
}

export type DisjunctiveFilter = FilterWithChildren & {
  filterType: typeof FILTER_TYPE_OR
}
export function orFilter(filters: Filter[]): DisjunctiveFilter {
  return {
    filterType: FILTER_TYPE_OR,
    filters
  }
}

export type MultiSourceFilter = {
  filterType: typeof FILTER_TYPE_MULTISOURCE
  filtersByDataSource: Record<string, Filter>
}
export function isMultiSourceFilter(filter: any): filter is MultiSourceFilter {
  return Boolean(filter && filter.filtersByDataSource)
}
export function multiSourceFilter(
  filtersByDataSource: Record<string, Filter>
): MultiSourceFilter {
  return {
    filterType: FILTER_TYPE_MULTISOURCE,
    filtersByDataSource
  }
}

// If the user saves a cohort with no filters, we'll use this type as the
// cohort's "filter"
export type EmptyCohortFilter = {
  filterType: typeof FILTER_TYPE_EMPTY_COHORT
  dataSource: string
  table?: string
  dimension: string
  sql: string
}
export const emptyCohortSql = (
  dataSource: string,
  dimension: string,
  table: string
): EmptyCohortFilter => ({
  filterType: FILTER_TYPE_EMPTY_COHORT,
  dataSource,
  table,
  dimension,
  sql: `SELECT DISTINCT(${dimension}) as n FROM ${dataSource}`
})

export type SqlFilter = {
  filterType: typeof FILTER_TYPE_SQL
  dataSource: string
  table?: string
  sql: string
  dataExpression?: string
}
export function sqlFilter(
  table: string,
  dataSource: string,
  sql: string,
  dataExpression?: string
): SqlFilter {
  return {
    filterType: FILTER_TYPE_SQL,
    dataSource,
    table,
    sql,
    dataExpression
  }
}

export type Filter =
  | BetweenFilter
  | BoundingBoxFilter
  | ConjunctiveFilter
  | DisjunctiveFilter
  | DistanceFilter
  | EmptyCohortFilter
  | InFilter
  | NotInFilter
  | MultiSourceFilter
  | NegatedFilter
  | NotNullFilter
  | NullFilter
  | PolygonFilter
  | RelativeFilter
  | STDistanceFilter
  | STPolygonFilter
  | SimpleFilter
  | SqlFilter
  | UnlikelyFilter

export const formatDateTimeSqlValue = (
  value: FilterValue,
  dataType: DataType
): string => {
  const m = moment.utc(value)
  if (m.isValid()) {
    if (isDateType(dataType)) {
      return `'${m.format(DATETIME_FORMAT)}'`
    }
    return `'${m.format(TIME_FORMAT)}'`
  }
  return value
}

export const buildRelativeSql = (
  value: RelativeOperand,
  dataType: DataType
): string => {
  if (value === "NOW") {
    return "NOW()"
  } else if (value.func === "ADD") {
    return `DATEADD('${value.datePart}', ${
      value.adjustment
    }, ${buildRelativeSql(value.value, dataType)})`
  } else if (value.func === "TRUNC") {
    if (value.adjustment) {
      return `DATE_TRUNC(${value.datePart}, DATEADD('${value.datePart}', ${
        value.adjustment
      }, ${buildRelativeSql(value.value, dataType)}))`
    }
    return `DATE_TRUNC(${value.datePart}, ${buildRelativeSql(
      value.value,
      dataType
    )})`
  }
  return formatDateTimeSqlValue(value, dataType)
}

export const escapeSqlString = (value: string): string =>
  value && typeof value === "string" ? value.replace(/'/g, "''") : value

export const escapeSqlStringPattern = (value: string): string =>
  value === null || value === undefined
    ? value
    : value.replace(/%/g, "\\%").replace(/_/g, "\\_")

export const formatSqlValue = (
  value: FilterValue,
  dataType: DataType,
  extract?: string
): string => {
  if (!extract && isTimeType(dataType)) {
    return formatDateTimeSqlValue(value, dataType)
  } else if (dataType === "STR") {
    value = escapeSqlString(value)
    value = escapeSqlStringPattern(value)
    return `'${value}'`
  }
  return value
}

// A map of data sources to columns, used to determine if we need to prepend
// `dataSource.` to a dataExpression
let dataSourcesAndColumns: Record<string, string[]> = {}

// this is called in reducers/dashboard.js when dataSources is updated
export const setDataSourcesAndColumns = (dataSources) => {
  if (dataSources) {
    dataSourcesAndColumns = Object.fromEntries(
      Object.entries(dataSources).flatMap(([dataSource, metadata]) =>
        metadata && metadata.columnMetadata
          ? [[dataSource, metadata.columnMetadata.map(({ value }) => value)]]
          : []
      )
    )
  }
}

const isColumn = (dataSource: string, dataExpression: string): boolean => {
  // datasource coul be join or a table name.
  // dataSourcesAndColumns could have a join key, which includes this column
  // check both cases
  const dataSources = Object.keys(dataSourcesAndColumns)
  const dataSourcesContainJoins = dataSources.some(
    (ds) => hasParamSyntax(ds) && getTablesForDataSource(ds).length > 1
  )
  if (Boolean(dataSource) && dataSources.includes(dataSource)) {
    return dataSourcesAndColumns[dataSource].includes(dataExpression)
  } else if (!hasParamSyntax(dataSource) && dataSourcesContainJoins) {
    // Check our dataSourcesAndColumns to see if we find a matching column
    // only if dataSourcesAndColumns contains joins, but dataSource is NOT a join
    const matchingDataSources = dataSources.filter((ds) =>
      getTablesForDataSource(ds).includes(dataSource)
    )
    return (
      matchingDataSources.filter((ds) =>
        dataSourcesAndColumns[ds].includes(dataExpression)
      ).length > 0
    )
  }
  return false
}

export const escapeName = (name: string) => `"${name.replace('"', '""')}"`

export const buildDataExpression = (
  dataSource: string,
  dataExpression: FilterDataExpression,
  extract?: string
): string => {
  if (extract) {
    const expr = buildDataExpression(dataSource, dataExpression)
    return `EXTRACT(${extract} FROM ${expr})`
  } else if (hasParamSyntax(dataSource)) {
    // Aggregate filters for joins have param syntax in data source for join param
    // and use an object for the data expression.
    // typeof null === "object" is true
    if (dataExpression && typeof dataExpression === "object") {
      const { function: func, value } = dataExpression
      return `${func}(${buildDataExpression(dataSource, value)})`
    }
    return dataExpression
  } else if (typeof dataExpression === "string") {
    if (isColumn(dataSource, dataExpression)) {
      dataSource = escapeName(dataSource)
      dataExpression = escapeName(dataExpression)
      return `${dataSource}.${dataExpression}`
    }
    return dataExpression
  } else if (isSimpleAggregate(dataExpression)) {
    const { function: func, value } = dataExpression
    return `${func}(${buildDataExpression(dataSource, value)})`
  } else {
    return String(dataExpression)
  }
}

function getLatExpression(
  dataSource: string,
  latExpression: string,
  latDataType = "FLOAT"
) {
  const expr = buildDataExpression(dataSource, latExpression)
  if (latDataType === "POINT") {
    return `ST_Y(${expr})`
  } else if (latDataType !== "FLOAT" && latDataType !== "DOUBLE") {
    return `CAST(${expr} AS FLOAT)`
  } else {
    return expr
  }
}

function getLonExpression(
  dataSource: string,
  lonExpression: string,
  lonDataType = "FLOAT"
) {
  const expr = buildDataExpression(dataSource, lonExpression)
  if (lonDataType === "POINT") {
    return `ST_X(${expr})`
  } else if (lonDataType !== "FLOAT" && lonDataType !== "DOUBLE") {
    return `CAST(${expr} AS FLOAT)`
  } else {
    return expr
  }
}

export const buildFilterSql = (
  filters: Filter[],
  dataSource: string,
  layerId?: string
): string[] => {
  const filtersSql = filters.map((filter) => {
    // if we've been given a layerId AND if the filter doesn't match, then just return back a known
    // valid value. This way we can remove the filter but still generate a valid string in an array
    // with the same number of elements.
    //
    // NOTE: this function should *not* be doing this sort of filtering - it
    // should just return a string, given some filters. Pruning the set of
    // filters should be up to the caller. But, I'm going to leave this in to
    // deal with filters that have already been set this way.
    if (
      filter === undefined ||
      (layerId !== undefined &&
        filter.layerId !== undefined &&
        filter.layerId !== layerId &&
        filter.layerId !== "master" &&
        filter.filterType !== FILTER_TYPE_MULTISOURCE &&
        filter.filterType !== FILTER_TYPE_AND &&
        filter.filterType !== FILTER_TYPE_OR &&
        filter.filterType !== FILTER_TYPE_UNLIKELY)
    ) {
      return "77=77"
    }

    switch (filter.filterType) {
      case FILTER_TYPE_SQL:
      case FILTER_TYPE_EMPTY_COHORT:
        return `(${filter.sql})`

      case FILTER_TYPE_MULTISOURCE: {
        const dataSourceTables = getTablesForDataSource(dataSource)
        const filterSql = buildFilterSql(
          Object.values(filter.filtersByDataSource).filter((f) => {
            const filterDataSources = getDataSourcesForFilter(f)
            const filterTables = getTablesForFilter(f)
            const filterHasValidTables = Array.from(filterTables).every((ft) =>
              dataSourceTables.includes(ft)
            )
            return (
              f.filterType !== undefined &&
              (dataSource === undefined ||
                filterDataSources.has(dataSource) ||
                filterHasValidTables)
            )
          }),
          dataSource,
          layerId
        ).join(" AND ")
        // If we ended up with a filter wrap it in parens, otherwise no filter
        return filterSql.length ? `(${filterSql})` : ""
      }

      case FILTER_TYPE_AND:
      case FILTER_TYPE_OR:
        // there's a race condition - if you pop open a chart with a big or filter and open the panel
        // before the charts are loaded, it'll crash because the subfilters of the OR won't be loaded
        // yet. I don't know why. But for now, just ignore them.
        return `(${buildFilterSql(
          filter.filters.filter((f) => f.filterType !== undefined),
          dataSource,
          layerId
        ).join(` ${filter.filterType} `)})`

      case FILTER_TYPE_NOT:
      case FILTER_TYPE_UNLIKELY:
        return `${filter.filterType} (${buildFilterSql(
          [filter.filter],
          dataSource,
          layerId
        )})`

      case FILTER_TYPE_ISNULL: {
        const dataExpression = buildDataExpression(
          filter.dataSource,
          filter.dataExpression,
          filter.extract
        )
        return `${dataExpression} IS NULL`
      }

      case FILTER_TYPE_ISNOTNULL: {
        const dataExpression = buildDataExpression(
          filter.dataSource,
          filter.dataExpression,
          filter.extract
        )
        return `${dataExpression} IS NOT NULL`
      }

      case FILTER_TYPE_ST_CONTAINS:
      case FILTER_TYPE_ST_INTERSECTS: {
        const dataExpression = buildDataExpression(
          filter.dataSource,
          filter.dataExpression,
          filter.extract
        )

        let polygon = filter.polygon.map((point) => point.join(" ")).join(",")
        if (filter.polygon.length > 0) {
          polygon += `,${filter.polygon[0].join(" ")}`
        }

        return `${filter.filterType}(ST_GeomFromText('POLYGON((${polygon}))', 4326), ${dataExpression})`
      }

      case FILTER_TYPE_ST_DISTANCE: {
        const dataExpression = buildDataExpression(
          filter.dataSource,
          filter.dataExpression,
          filter.extract
        )

        const point = filter.point.join(" ")
        return `ST_Distance(ST_GeomFromText('POINT(${point})', 4326), ${dataExpression}) <= ${
          filter.distanceInKM / 100
        }`
      }

      case FILTER_TYPE_POLYGON: {
        const polyFilters = []

        const latExpression = getLatExpression(
          filter.dataSource,
          filter.latExpression,
          filter.latDataType
        )
        const lonExpression = getLonExpression(
          filter.dataSource,
          filter.lonExpression,
          filter.lonDataType
        )

        polyFilters.push(
          `${lonExpression} is not null`,
          `${latExpression} is not null`
        )

        polyFilters.push(
          createUnlikelyStmtFromShape(
            filter.aabox,
            lonExpression,
            latExpression,
            filter.useLonLat
          )
        )

        let polygon = filter.points.map((point) => point.join(" ")).join(",")
        if (filter.points.length > 0) {
          polygon += `,${filter.points[0].join(" ")}`
        }
        const srid = filter.useLonLat ? 4326 : 0
        polyFilters.push(
          `ST_Contains(ST_GeomFromText('POLYGON((${polygon}))', ${srid}), ST_SetSRID(ST_Point(${lonExpression}, ${latExpression}), ${srid}))`
        )

        return `(${polyFilters.join(" AND ")})`
      }
      case FILTER_TYPE_DISTANCE: {
        const latExpression = getLatExpression(
          filter.dataSource,
          filter.latExpression,
          filter.latDataType
        )
        const lonExpression = getLonExpression(
          filter.dataSource,
          filter.lonExpression,
          filter.lonDataType
        )
        return `DISTANCE_IN_METERS(${filter.point[0]}, ${filter.point[1]}, ${lonExpression}, ${latExpression}) < ${filter.distanceInMeters}`
      }

      case FILTER_TYPE_BOUNDING_BOX: {
        if (isBoundingBoxGeoFilter(filter)) {
          const dataExpression = buildDataExpression(
            filter.dataSource,
            filter.geoExpression
          )
          return `ST_XMax(${dataExpression}) >= ${filter.lonMin}
          AND ST_XMin(${dataExpression}) <= ${filter.lonMax}
          AND ST_YMax(${dataExpression}) >= ${filter.latMin}
          AND ST_YMin(${dataExpression}) <= ${filter.latMax}`
        } else {
          const latExpression = getLatExpression(
            filter.dataSource,
            filter.latExpression,
            filter.latDataType
          )
          const lonExpression = getLonExpression(
            filter.dataSource,
            filter.lonExpression,
            filter.lonDataType
          )
          return `(${lonExpression} is not null
          AND ${latExpression} is not null
          AND ${lonExpression} >= ${filter.lonMin} AND ${lonExpression} <= ${filter.lonMax} AND ${latExpression} >= ${filter.latMin} AND ${latExpression} <= ${filter.latMax})`
        }
      }

      case FILTER_TYPE_IN:
      case FILTER_TYPE_NOT_IN: {
        const dataExpression = buildDataExpression(
          filter.dataSource,
          filter.dataExpression,
          filter.extract
        )

        const values = filter.values.map((v) =>
          formatSqlValue(v, filter.dataType, filter.extract)
        )

        return `${dataExpression} ${filter.filterType} (${values.join(",")})`
      }

      case FILTER_TYPE_BETWEEN: {
        const dataExpression = buildDataExpression(
          filter.dataSource,
          filter.dataExpression,
          filter.extract
        )

        const start = filter.isRelative
          ? buildRelativeSql(filter.start, filter.dataType)
          : formatSqlValue(filter.start, filter.dataType, filter.extract)
        const end = filter.isRelative
          ? buildRelativeSql(filter.end, filter.dataType)
          : formatSqlValue(filter.end, filter.dataType, filter.extract)

        if (filter.isRelative) {
          return `${dataExpression} >= ${start} AND ${dataExpression} < ${end}`
        }
        return `${dataExpression} BETWEEN ${start} AND ${end}`
      }

      case FILTER_TYPE_SIMPLE: {
        const dataExpression = buildDataExpression(
          filter.dataSource,
          filter.dataExpression,
          filter.extract
        )

        let operator = filter.operator
        let value = filter.value
        if (isTimeType(filter.dataType)) {
          if (!filter.extract) {
            value = formatDateTimeSqlValue(value, filter.dataType)
          }
        } else if (filter.dataType === "STR") {
          if (filter.caseSensitive) {
            switch (operator) {
              case "ILIKE":
                operator = "LIKE"
                break
              case "ISTARTS_WITH":
                operator = "STARTS_WITH"
                break
              case "IENDS_WITH":
                operator = "ENDS_WITH"
                break
              default:
                break
            }
          }

          value = escapeSqlString(value)
          if (operator === "LIKE" || operator === "ILIKE") {
            value = escapeSqlStringPattern(value)
            value = `'%${value}%'`
          } else if (
            operator === "STARTS_WITH" ||
            operator === "ISTARTS_WITH"
          ) {
            value = escapeSqlStringPattern(value)
            operator = operator === "STARTS_WITH" ? "LIKE" : "ILIKE"
            value = `'${value}%'`
          } else if (operator === "ENDS_WITH" || operator === "IENDS_WITH") {
            value = escapeSqlStringPattern(value)
            operator = operator === "ENDS_WITH" ? "LIKE" : "ILIKE"
            value = `'%${value}'`
          } else {
            value = `'${value}'`
          }
        }

        if (filter.dataTypeIsArray) {
          return `${value} ${operator} ANY ${dataExpression}`
        }
        return `${dataExpression} ${operator} ${value}`
      }
      default:
        throw new Error(`unknown filter type ${(filter as Filter).filterType}`)
    }
  })

  return filtersSql
}

/* simple wrapper function - given a filter metadata object, will return the
   appropriate SQL string - if it has a cohorDimension, it calls buildCohortSql,
   and if it doesn't then it calls buildFilterSql */

export function buildOmnifilterSql(
  filterMetadata: any,
  dataSource: string,
  layerId?: string
): string {
  if (filterMetadata.cohortDimension) {
    return buildCohortSql(
      dataSource,
      filterMetadata.cohortDimension,
      filterMetadata.filter,
      filterMetadata.cohortDimension.negated,
      filterMetadata.cohortDimension.postFilters,
      layerId,
      filterMetadata
    )
  } else {
    const filters = []
    if (filterHasChild(filterMetadata)) {
      filters.push(filterMetadata.filter)
    } else if (filterHasChildren(filterMetadata)) {
      filters.push(...filterMetadata.filters)
    }
    return buildFilterSql(filters, dataSource, layerId)[0]
  }
}

export function buildCohortSql(
  dataSource: string,
  dimension: any,
  filter: Filter,
  negated = false,
  postFilters: Filter[] = [],
  layerId?: string,
  filterMetadata?: any
): string {
  if (dataSource === undefined) {
    dataSource = dimension.dataSource
  }
  if (dataSource !== dimension.dataSource) {
    return "88=88"
  }
  if (filter.filterType === FILTER_TYPE_EMPTY_COHORT) {
    return sqltag`
      ${dimension.name} ${negated ? FILTER_TYPE_NOT_IN : FILTER_TYPE_IN} ( ${
      filter.sql
    } ${sqltag.groupBy(dimension.name)}
    ${sqltag.having(
      buildFilterSql(postFilters, dataSource, layerId).join(" AND ")
    )})
    `
  } else if (
    getFeatureFlag(available_feature_flags.USE_CACHED_COHORTS) &&
    filterMetadata?.cohortDimension.cohortName
  ) {
    const table = window.getCohortTableName(
      filterMetadata.cohortDimension.cohortName
    )

    const stmt = sqltag`
        ${dimension.name} ${negated ? FILTER_TYPE_NOT_IN : FILTER_TYPE_IN} (
          ${sqltag.select("*")}
          ${sqltag.from(table)}
        )
      `
    return stmt
  }
  const where = buildFilterSql([filter], dataSource, layerId)
  if (where.length > 0) {
    return sqltag`
        ${dimension.name} ${negated ? FILTER_TYPE_NOT_IN : FILTER_TYPE_IN} (
          ${sqltag.select(dimension.name)}
          ${sqltag.from(dataSource)}
          ${sqltag.where(sqltag.and(where))}
          ${sqltag.groupBy(dimension.name)}
          ${sqltag.having(
            buildFilterSql(postFilters, dataSource, layerId).join(" AND ")
          )}
        )
      `
  }

  return ""
}

export const buildFilterLabel = (filterMetaData) => {
  if (filterMetaData.label !== undefined && filterMetaData.label.length) {
    return filterMetaData.label
  } else if (
    filterMetaData !== undefined &&
    filterMetaData.filter !== undefined
  ) {
    return buildFilterSql([filterMetaData.filter])[0]
  } else {
    return ""
  }
}

export const buildCohortCountSql = (
  dataSource: string,
  dimension: string,
  dataType: DataType,
  filters?: Filter[]
): string => {
  // If the user saved a cohort with no filters, it'll have a single filter with
  // filterType FILTER_TYPE_EMPTY_COHORT
  let count = `COUNT(DISTINCT ${dimension})`
  if (dataType === "BIGINT") {
    count = `APPROX_COUNT_DISTINCT(${dimension})`
  }
  if (
    filters &&
    filters.length === 1 &&
    filters[0].filterType === FILTER_TYPE_EMPTY_COHORT
  ) {
    return sqltag`
      ${sqltag.select(`${count} as n`)}
      ${sqltag.from(dataSource)}`
  } else {
    return sqltag`
      ${sqltag.select(`${count} as n`)}
      ${sqltag.from(dataSource)}
      ${filters ? sqltag.where(sqltag.and(filters)) : ""}`
  }
}

export function createUnlikelyStmtFromShape(aabox, xAttr, yAttr, useLonLat) {
  let xmin = aabox[HeavyAIDraw.AABox2d.MINX]
  let xmax = aabox[HeavyAIDraw.AABox2d.MAXX]
  let ymin = aabox[HeavyAIDraw.AABox2d.MINY]
  let ymax = aabox[HeavyAIDraw.AABox2d.MAXY]
  let cast = true
  if (useLonLat) {
    xmin = formatCoordinate(LatLonUtils.conv900913To4326X(xmin))
    xmax = formatCoordinate(LatLonUtils.conv900913To4326X(xmax))
    ymin = formatCoordinate(LatLonUtils.conv900913To4326Y(ymin))
    ymax = formatCoordinate(LatLonUtils.conv900913To4326Y(ymax))
    cast = false
  }

  if (cast) {
    return `UNLIKELY(CAST(${xAttr} AS FLOAT) >= ${xmin} AND CAST(${xAttr} AS FLOAT) <= ${xmax} AND CAST(${yAttr} AS FLOAT) >= ${ymin} AND CAST(${yAttr} AS FLOAT) <= ${ymax})`
  } else {
    return `UNLIKELY(${xAttr} >= ${xmin} AND ${xAttr} <= ${xmax} AND ${yAttr} >= ${ymin} AND ${yAttr} <= ${ymax})`
  }
}

export function getDataExpressionsForFilter(filter, dataExpressions) {
  if (!dataExpressions) {
    dataExpressions = new Set()
  }

  if (filterHasChild(filter)) {
    getDataExpressionsForFilter(filter.filter, dataExpressions)
  } else if (filterHasChildren(filter)) {
    filter.filters.forEach((f) => {
      getDataExpressionsForFilter(f, dataExpressions)
    })
  } else if (isMultiSourceFilter(filter)) {
    Object.values(filter.filtersByDataSource).forEach((f) => {
      getDataExpressionsForFilter(f, dataExpressions)
    })
  } else {
    dataExpressions.add(filter.dataExpression)
  }

  return dataExpressions
}
