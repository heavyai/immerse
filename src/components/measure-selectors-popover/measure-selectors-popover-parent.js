// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  compose,
  concat,
  filter,
  find,
  identity,
  ifElse,
  length,
  prop,
  sortBy,
  view,
  lensPath,
  path,
  T
} from "ramda"
import {
  DEFAULT_SELECTOR_TYPES,
  filterOptions,
  isArrayColumn,
  isNonDictString,
  TEXT_AND_BOOL_TYPES,
  ALL_NUMERICAL_TYPES
} from "constants/data-types"
import { CHART_TYPES, CHARTS } from "constants/charts"
import { connect } from "react-redux"
import { CUSTOM_MEASURE_VALUE } from "constants/magic-variables"
import { isEmpty } from "utils/selector-helpers"
import MeasureSelectorsPopover from "./measure-selectors-popover"
import { isGeoTypeSupportedRasterChart } from "charts/raster-chart/raster-utils"
import { enhanceColumnMetadata } from "services/ImmerseCrossFilter/utils"
import { ParameterTypes } from "components/parameters/parameters-types"
import {
  getParameterizedCustomSqlMetadata,
  parameterDefinitionToOldSelectorMetadata
} from "utils/parameterized-custom-sql-metadata"
import { CHART_TYPE_WINDBARB } from "charts/raster-chart/windbarb/constants"
import { isCrossSectionType } from "charts/raster-chart/cross-section/utils/is-cross-section-type"
import { getTablesForDataSource } from "components/join-manager/utils"

export const numValues = compose(
  length,
  filter((d) => d.value)
)

function notTime({ type }) {
  return type !== "TIMESTAMP" && type !== "DATE"
}

const addAllRows = concat([
  {
    label: "# Records",
    value: "*",
    type: "SMALLINT"
  }
])

const addCustomOptions = (dataSource) =>
  concat([
    {
      label: "Custom SQL Measure",
      value: CUSTOM_MEASURE_VALUE,
      type: "CUSTOM"
    },
    ...getParameterizedCustomSqlMetadata(
      dataSource,
      ParameterTypes.CUSTOM_MEASURE,
      parameterDefinitionToOldSelectorMetadata
    ),
    ...getParameterizedCustomSqlMetadata(
      dataSource,
      ParameterTypes.GLOBAL_MEASURE,
      parameterDefinitionToOldSelectorMetadata
    )
  ])

function maybeAddAllRows(
  chartType,
  dimensions,
  measures,
  selectorName,
  isNonGeoJoinedChoroplethColorMeasure
) {
  // This is dumb and needs to be refactored, but basically, DON'T add
  // "# Records" if:
  //    1. This is a geo measure
  //    2. This is a color measure in a non-geojoined choropleth
  //    3. Dimensions are empty and is one of "table" | "pointmap" |
  //       "backendScatter" | "backendChoropleth"
  //    4. This is a linemap, cross-section, windbarb, or contour
  return ifElse(
    () => {
      // These charts + a join datasource get auto grouped, so should
      // allow the # Records option
      const isAutoGroupedType = [
        CHART_TYPES.BACKEND_CHOROPLETH,
        CHART_TYPES.LINEMAP
      ].includes(chartType)
      const isGeoSelector = selectorName === "geo"
      if (isAutoGroupedType && measures[0]?.is_join && !isGeoSelector) {
        return false
      }

      if (isGeoSelector || isNonGeoJoinedChoroplethColorMeasure) {
        return true
      } else {
        return (
          (isEmpty(dimensions) &&
            (chartType === "table" ||
              chartType === "pointmap" ||
              chartType === "backendScatter" ||
              chartType === "backendChoropleth" ||
              chartType.startsWith("deckgl"))) ||
          chartType === "linemap" ||
          isCrossSectionType(chartType) ||
          chartType === CHART_TYPES.CONTOUR ||
          chartType === CHART_TYPE_WINDBARB
        )
      }
    },
    identity,
    addAllRows
  )
}

function maybeAddCustomOptions(chartType, selectorName, dataSource) {
  return ifElse(
    () => {
      if (isGeoTypeSupportedRasterChart(chartType)) {
        const joinTables = getTablesForDataSource(dataSource)
        return selectorName !== "geo" && joinTables.length <= 1
      } else {
        return true
      }
    },
    addCustomOptions(dataSource),
    identity
  )
}

const filterNonDictString = (measure) => !isNonDictString(measure)
const filterisArrayColumn = (measure) => !isArrayColumn(measure)
const filterDefaultTypes = (measure) => DEFAULT_SELECTOR_TYPES[measure.type]
const filterNonNumericalTypes = (measure) => ALL_NUMERICAL_TYPES[measure.type]

export function maybeFilterMeasures(
  chartType,
  dimensions,
  selectorName,
  isNonGeoJoinedChoroplethColorMeasure
) {
  const currentMeasure =
    selectorName === "postFilter"
      ? CHARTS[chartType].postFilters
      : CHARTS[chartType].measures
  const selector = find(
    (measure) => measure.name === selectorName,
    currentMeasure
  )

  return compose(
    filterOptions(currentMeasure, selectorName),
    filter(
      chartType === "table" && numValues(dimensions) === 0
        ? () => true
        : notTime
    ),
    filter(chartType === "table" ? () => true : filterisArrayColumn),
    filter(chartType === "table" ? () => true : filterNonDictString),
    // If the choropleth is non-geojoined, and there is a dimension specified,
    // remove non-numerical types from measure selector
    filter(
      isNonGeoJoinedChoroplethColorMeasure && !isEmpty(dimensions)
        ? filterNonNumericalTypes
        : () => true
    ),
    filter(selector && selector.type ? () => true : filterDefaultTypes)
  )
}

export function finalFilter(chartType, dimensions, selectorName) {
  const shouldRemoveAllRows =
    !isEmpty(dimensions) &&
    (chartType === "pointmap" || chartType === "backendScatter") &&
    (selectorName === "x" || selectorName === "y")
  return filter(shouldRemoveAllRows ? isNotStar : T)
}

function selectOptions(
  chartType,
  dimensions,
  measures,
  selectorName,
  isNonGeoJoinedChoroplethColorMeasure,
  dataSource
) {
  return compose(
    finalFilter(chartType, dimensions, selectorName),
    maybeAddCustomOptions(chartType, selectorName, dataSource),
    maybeAddAllRows(
      chartType,
      dimensions,
      measures,
      selectorName,
      isNonGeoJoinedChoroplethColorMeasure
    ),
    maybeFilterMeasures(
      chartType,
      dimensions,
      selectorName,
      isNonGeoJoinedChoroplethColorMeasure
    ),
    sortBy(prop("value"))
  )
}

function isNotStar(selector) {
  return Boolean(selector.value) && selector.value !== "*"
}

function hasValues(dimensions) {
  return dimensions.some((dim) => Boolean(dim.value) && !dim.inactive)
}

function includeGeoJoinSources(chart, selectorName) {
  // TODO(adb): Specify the join dimension in the chart spec rather than hardcoding the first dimension as the join dimension here
  if (!chart.geoJoin || !chart.geoJoin.column) {
    return false
  }
  if (!path(["dimensions", 0, "value"], chart)) {
    return false
  }
  const MEASURES = CHARTS[chart.type].measures
  const maybeIncludeJoinDataSources = view(
    lensPath([0, "includeJoinDataSources"]),
    MEASURES.filter((MEASURE) => MEASURE.name === selectorName)
  )
  return maybeIncludeJoinDataSources === true
}

export function usesAggType(
  selector,
  dimensions,
  chartType,
  isNonGeoJoinedChoroplethColorMeasure
) {
  const {
    IFRAME,
    GAUGE,
    NUMBER,
    CHOROPLETH,
    BACKEND_CHOROPLETH,
    CONTOUR,
    LINEMAP
  } = CHART_TYPES
  const invalidSelectorType = TEXT_AND_BOOL_TYPES[selector.type]
  const hasDimsOrExemptType =
    hasValues(dimensions) ||
    [IFRAME, GAUGE, NUMBER, CHOROPLETH, BACKEND_CHOROPLETH, LINEMAP].includes(
      chartType
    )
  const validChartType = !isCrossSectionType(chartType) && CONTOUR !== chartType
  return (
    isNotStar(selector) &&
    hasDimsOrExemptType &&
    !invalidSelectorType &&
    !isNonGeoJoinedChoroplethColorMeasure &&
    validChartType
  )
}

// Non-geojoined choropleth color measures don't support aggregation, which
// means they're limited to non-aggregated numerical types. So, we have a
// special case for when we're editing a choropleth AND:
//    1. We're editing that choropleth's color measure
//    2. The choropleth is not currently geojoined
// * Exception: When the datasource is already a join (will replace current geo join functionality)
//    we need to aggregate the color measure
export const getIsNonGeoJoinedChoroplethColorMeasure = (chart, selector) =>
  (chart.type === "backendChoropleth" || chart.type === "choropleth") &&
  selector.name === "color" &&
  !chart.geoJoin &&
  !selector.is_join

export function mapStateToProps(
  { charts, dashboard: { dataSources, joinTable } },
  {
    chartId,
    selector,
    loading,
    isDropdownOpen,
    closeCustomSelector,
    showCustom,
    dataSource
  }
) {
  const chart = charts[chartId]

  const isNonGeoJoinedChoroplethColorMeasure = getIsNonGeoJoinedChoroplethColorMeasure(
    chart,
    selector
  )

  const selectByType = selectOptions(
    chart.type,
    chart.dimensions,
    chart.measures,
    selector.name,
    isNonGeoJoinedChoroplethColorMeasure,
    dataSource
  )
  const shouldShowCustomInput =
    !isDropdownOpen && (selector.custom || showCustom)

  const selectorUsesAggType = usesAggType(
    selector,
    chart.dimensions,
    chart.type,
    isNonGeoJoinedChoroplethColorMeasure
  )

  const shouldShowAggTypeSelector =
    !shouldShowCustomInput && !isDropdownOpen && selectorUsesAggType

  const dataSourcesOptions = dataSource
    ? enhanceColumnMetadata(dataSources[dataSource].columnMetadata, dataSource)
    : []

  const geoJoinDataSourcesOptions =
    includeGeoJoinSources(chart, selector.name) && chart.geoJoin
      ? joinTable.columnMetadata
      : []

  return {
    chart,
    shouldShowAggTypeSelector,
    options: selectByType([
      ...dataSourcesOptions,
      ...geoJoinDataSourcesOptions
    ]),
    shouldShowCustomInput,
    measure: selector,
    loading,
    isDropdownOpen,
    closeCustomSelector
  }
}

export default compose(connect(mapStateToProps))(MeasureSelectorsPopover)
