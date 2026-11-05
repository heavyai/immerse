// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Application semantics (types, joins and SQL dialect) arrive through explicit ports.
function createFilterEngine({
  isBERendered,
  chartTypes,
  getTablesForFilter,
  getTablesForDataSource,
  chartSupportsChartSpecificFilters,
  buildOmnifilterSql,
  filterHasChildren,
  buildCrossLinkFiltersInternal,
  getJoinFilters
}) {
  const intersection = (a, b) => a.filter((value) => b.includes(value))
  function getChartFiltersInternal({
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
      isBERendered(chart.type) || chart.type === chartTypes().BACKEND_CHOROPLETH
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
            layer.type === chartTypes().BACKEND_CHOROPLETH
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

  function getDashboardFiltersInternal({
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

  function buildFilterStringInternal(
    chartId,
    {
      chart,
      omnifilters,
      includeGlobal = true,
      includeCharts = true,
      tables,
      dataSource,
      layerId,
      excludeFilters,
      excludeChartFilters = [],
      crossLinks = []
    } = {}
  ) {
    const allFilters = []
    // getChartFiltersInternal and getDashboardfiltersInternal will grab any omnifilters
    // that have _any_ overlapping tables with the chart's datasource.
    // Then we need to filter any multisource or AND/OR filters (which can contain filters with different tables)
    // to only grab the ones that have the tables provided.
    if (includeCharts) {
      allFilters.push(
        ...getChartFiltersInternal({
          chartId,
          tables,
          layerId,
          chart,
          omnifilters,
          excludeChartFilters
        })
      )
    }
    if (includeGlobal) {
      allFilters.push(
        ...getDashboardFiltersInternal({
          tables,
          excludeFilters,
          omnifilters
        })
      )
      allFilters.push(
        ...buildCrossLinkFiltersInternal(chartId, tables, crossLinks)
      )
      allFilters.push(
        ...getJoinFilters({
          tables,
          chartId
        })
      )
    }
    // Certain filter types (AND, OR, MULTISOURCE) can have multiple tables and datasources
    // Now we check all filters and if they have child filters we only keep
    // the ones that have a table specified by the "tables" arg.
    const allRelevantFilters = allFilters.map((f) => {
      if (filterHasChildren(f)) {
        return {
          ...f,
          filters: f.filters.filter((childFilter) => {
            // Make sure the table of this filter is included in the tables
            // we are getting filters for
            return tables === null || tables === undefined
              ? undefined
              : tables.includes(childFilter.table)
          })
        }
      } else {
        return f
      }
    })
    const allFilterStrings = allRelevantFilters.map((f) => {
      if (typeof f === "string") {
        return f
      } else {
        return buildOmnifilterSql(
          f,
          dataSource,
          f.chartId === chartId ? layerId : undefined
        )
      }
    })
    // Filter out blank strings, if buildOmnifilterSql generates nothing
    // for the given datasource + filter, it could return blank string
    return allFilterStrings.filter(Boolean).join(" AND ")
  }
  exports.buildFilterStringInternal = buildFilterStringInternal

  return {
    getChartFilters: getChartFiltersInternal,
    getDashboardFilters: getDashboardFiltersInternal,
    buildFilterString: buildFilterStringInternal
  }
}
module.exports = { createFilterEngine }

function createLegacyFilterMigrator({
  isValidFilter,
  Omnifilter,
  isNumerical,
  pushid
}) {
  function moveOldFiltersIntoOmnifilters(dashboardState) {
    const { filters = [] } = dashboardState
    const omnifilters = [...(dashboardState.omnifilters || [])]

    const convertRelativeValue = (relativeValue, datePart) => {
      if (relativeValue.now) {
        return "NOW"
      }

      const operator =
        typeof relativeValue.operator === "undefined"
          ? "DATE_ADD"
          : relativeValue.operator

      if (typeof relativeValue.number === "object") {
        // AFAIK for all of the old preset options this nested datePart is always *supposed* to be the same as the same as the parent datePart,
        // but in relative-filter-types.js the "Last Month" option was seemingly incorrectly entered, so let's pass the correct one in.
        return convertRelativeValue(
          relativeValue.number,
          relativeValue.datepart.toUpperCase()
        )
      }

      const value = relativeValue.number === 0 ? "NOW" : relativeValue.number
      const adjustment = relativeValue.add || relativeValue.number

      if (operator === "DATE_ADD") {
        return {
          func: "ADD",
          datePart: datePart || relativeValue.datepart.toUpperCase(),
          adjustment,
          value
        }
      }

      return {
        func: "TRUNC",
        datePart: datePart || relativeValue.datepart.toUpperCase(),
        adjustment,
        value
      }
    }

    const newFilters = Object.values(filters)
      .map((filter) => {
        if (!isValidFilter(filter)) {
          return null
        }

        switch (filter.operator) {
          case "=":
            if (filter.isRelative) {
              return Omnifilter.relativeFilter(
                filter.table,
                filter.dataSource,
                filter.value,
                filter.type,
                convertRelativeValue(filter.operand[0]),
                convertRelativeValue(filter.operand[1])
              )
            } else if (filter.type === "BOOL") {
              return Omnifilter.simpleFilter(
                filter.table,
                filter.dataSource,
                filter.value,
                filter.type,
                "=",
                filter.operand === "true"
              )
            }

          // eslint-disable-next-line no-fallthrough
          case "<":
          case ">":
          case "!=":
          case "<>":
          case "<=":
          case ">=":
          case "EQUALS":
          case "NOT EQUALS": {
            let operator = filter.operator
            let negated = false
            if (operator === "!=") {
              operator = "="
              negated = true
            } else if (operator === "EQUALS") {
              operator = "="
            } else if (operator === "NOT EQUALS") {
              operator = "="
              negated = true
            } else if (operator === "<>") {
              operator = "="
              negated = true
            }
            const simpleFilter = Omnifilter.simpleFilter(
              filter.table,
              filter.dataSource,
              filter.value,
              filter.type,
              operator,
              isNumerical(filter.type)
                ? parseFloat(filter.operand)
                : filter.operand
            )

            return negated ? Omnifilter.notFilter(simpleFilter) : simpleFilter
          }

          case "CONTAINS":
          case "NOT CONTAINS": {
            const containsFilter = filter.is_array
              ? Omnifilter.simpleFilter(
                  filter.table,
                  filter.dataSource,
                  filter.value,
                  filter.type,
                  "=",
                  filter.operand,
                  { dataTypeIsArray: true }
                )
              : Omnifilter.simpleFilter(
                  filter.table,
                  filter.dataSource,
                  filter.value,
                  filter.type,
                  "ILIKE",
                  filter.operand
                )

            if (filter.operator === "NOT CONTAINS") {
              return Omnifilter.notFilter(containsFilter)
            } else {
              return containsFilter
            }
          }

          case "IS":
          case "BTW":
            return Omnifilter.betweenFilter(
              filter.table,
              filter.dataSource,
              filter.value,
              filter.type,
              filter.operand[0],
              filter.operand[1]
            )

          case "IS NULL":
            return Omnifilter.nullFilter(
              filter.table,
              filter.dataSource,
              filter.value,
              filter.type
            )

          case "NOT NULL":
            return Omnifilter.notNullFilter(
              filter.table,
              filter.dataSource,
              filter.value,
              filter.type
            )

          default:
            return Omnifilter.sqlFilter(
              filter.table,
              filter.dataSource,
              filter.expression
            )
        }
      })
      .filter(Boolean)

    const convertedDashboardFilterIds = []

    newFilters.forEach((filter) => {
      const name = pushid()
      convertedDashboardFilterIds.push(name)

      omnifilters.push({
        appliesTo: "GLOBAL",
        enabled: true,
        dataSources: [
          filter.filter ? filter.filter.dataSource : filter.dataSource
        ],
        name,
        filter
      })
    })

    return {
      dashboardStateOmnifilters: {
        ...dashboardState,
        filters: [],
        omnifilters
      },
      convertedDashboardFilterIds
    }
  }

  return moveOldFiltersIntoOmnifilters
}
module.exports.createLegacyFilterMigrator = createLegacyFilterMigrator
