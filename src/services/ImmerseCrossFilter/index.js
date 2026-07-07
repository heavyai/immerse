// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { boundingBoxEnabledFilterString } from "./ImmerseCrossFilterBoundingBox"
import { createQueuedConnector } from "services/ConnectorWithQueue"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import { hasParamSyntax } from "utils/parameters"
/*

There's a ~ton~ of opportunity here for refactoring/repair/replacement. This is meant to be as much of a drop
in replacement for old crossfilter as possible. There's a lot of refactoring and re-tooling done, but there's
huge opportunity for more. 

There is a lot of functionality that was in old crossfilter that wasn't ported, because we never used it in Immerse.
It's possible that something was missed.

Realistically, nowadays omni-crossfilter is just storing dimension/measure info and some functions to build queries
from them. The filters are all in omnifilters. This could all be internally refactored and maintain the deprecated
interface, then moved to a newly exposed one. We've got tons of opportunity here.

   This is our new entry point into crossfilter. The API is frustratinggly ~not~ 100% compatible.
  Crossfilter.crossfilter() returns a promise, whereas ImmerseCrossFilter.crossfilter() returns the actual
  crossfilter object. This is because old crossfilter objects would wait for the getFields call to reutrn
  whereas this one does not. There's a getFieldsAsync() to shim in a promise later.

  So the old flavor would be:
  Crossfilter.crossfilter(...).then(...)

  and you'd now do:
  Crossfilter.crossfilter(...).getFieldsAsync().then(...)

  Keeping in mind that the `then` receives a different arg. This is because of cloneWithChartId not behaving
  well if it got a promise by accident

*/

import getGroupAll from "./ImmerseCrossFilterGroupAll"
import getDimension from "./ImmerseCrossFilterDimension"
import { unBinResults, replaceRelative, getStore, getFields } from "./utils"
import buildFilterString from "./build-filter-string.ts"

let CF_ID = 1

/* this may not be necessary any more. old old crossfilter objects were singletons by design that had to be shared
across all charts that were interested - charts would create their own dimensions/group/groupAll objects as desired.

In the early days of the port, FakeCrossFilter was just a facade wrapper around old crossfilter, so it needed to maintain
the same behavior. The old crossfilter object was contained within the sharedCrossFilter array.

The shared singleton now only shares dimension indexes and the column info. 
*/
const cfMap = new Map()

function resetCrossFilter() {
  cfMap.clear()
}

/*
  We can allow THE CHARTS THEMSELVES to override crossfilter's behavior in how SQL is generated.
  Overrides should be provided in the chart's definition file, as an object of functions. The key defines the crossfilter capability
  which is overridden. e.g.,

  {
    orderBy => () => {
      // do something and return some SQL orderBy string
    }
  }

  As of right now, only the `orderBy` override is available. We may add more keys in the future
*/
const crossFilterOverrides = {}
export const registerCrossFilterOverrides = (chartType, overrides) => {
  Object.keys(overrides).forEach((override) => {
    crossFilterOverrides[override] = {
      ...crossFilterOverrides[override],
      [chartType]: overrides[override]
    }
  })
}

const FakeCrossFilter = {
  replaceRelative,
  unBinResults,
  // Now takes tables AND datasource. One datasource can comprise multiple tables eg. a join data source
  crossfilter: (connector, tables, dataSource) => {
    if (!Array.isArray(tables) && tables !== undefined) {
      tables = [tables]
    }

    // if we've never seen crossfilter for this table
    const crossFilters = []
    // Use datasource as the key for the shared crossfilter. We could have two join datasources with the same tables
    // but are different datasources.
    let sharedCrossFilter = cfMap.get(dataSource)
    if (!sharedCrossFilter) {
      sharedCrossFilter = createSharedCrossfilter(connector, tables, dataSource)
    }
    const newCrossFilter = createNewCrossFilter(
      connector,
      tables,
      sharedCrossFilter,
      dataSource
    )
    crossFilters.push(newCrossFilter)

    // Stay compatible with existing code
    return crossFilters.length > 1 ? crossFilters : crossFilters[0]
  }
}

function createSharedCrossfilter(connector, tables, dataSource) {
  const sharedCrossFilter = {
    crossFilterOverrides,
    compoundColumnMap: {},
    columnTypeMap: {},
    columnNameCountMap: {},
    tableDescriptors: [],
    countChartLookup: {},
    myCF_ID: CF_ID++,
    globalDimensionIndex: 99999,
    chartDimensionIndex: 99999,
    connector,
    applyPostProcessors: (value, processors) =>
      processors.reduce((v, p) => p(v), value),
    resetFields: () => {
      sharedCrossFilter.compoundColumnMap = {}
      sharedCrossFilter.columnTypeMap = {}
      sharedCrossFilter.columnNameCountMap = {}
      sharedCrossFilter.tableDescriptors = []
    }
  }

  cfMap.set(dataSource, sharedCrossFilter)
  return sharedCrossFilter
}

function createNewCrossFilter(
  connector,
  tables,
  sharedCrossFilter,
  dataSource
) {
  const newCrossFilter = {
    sharedCrossFilter,
    type: "crossfilter",
    dataSource,
    /*
      This is a _critical_ bit of new functionality - old crossfilter had singletons across data sources,
      and charts would create dimensions/groups/groupAlls with the data. omni-crossfilter gives each chart its
      own crossfilter, which is bound to the chart id. This is so we can look up appropriate chart filters out of
      omnifilters. It'd be great to replace dc<->crossfilter linkages
      with new individual objects

      the keyModifier is used by the queued connector to change the queue key from just chartId to `chartId-keyModifier`

      A typical use case would be handing in a layer ID.
    */
    cloneWithChartId: (chartId, keyModifier) => {
      const queuedConnector = createQueuedConnector({
        connector,
        dashboardId: getStore().getState().dashboard.id,
        chartId,
        keyModifier,
        tableName: dataSource
      })
      const nextCrossFilter = FakeCrossFilter.crossfilter(
        connector,
        newCrossFilter.getTables(),
        newCrossFilter.getDataSource()
      )
      nextCrossFilter.queuedConnector = queuedConnector
      nextCrossFilter.chartId = chartId
      return nextCrossFilter
    },
    queryAsync: (q, o, token) => {
      const myConnector =
        newCrossFilter.queuedConnector ||
        newCrossFilter.sharedCrossFilter.connector
      return myConnector.queryAsync(q, o, token)
    },

    // most of the rest of these methods are pulled out of old crossfilter with Slimer's knowledge of the required public
    // interface. Notes as necessary
    getTables: () => {
      return tables
    },
    getDataSource: () => {
      return dataSource
    },
    isValidTable: () => {
      const dataSourceIsParam = hasParamSyntax(dataSource)
      const dataSourceIsJoin = dataSourceIsParam && tables.length > 1
      return (tables.length && !dataSourceIsParam) || dataSourceIsJoin
    },
    getId: () => {
      return sharedCrossFilter.myCF_ID
    },
    filter: () => ({ filter: () => {} }),
    toggleFilter: () => {},
    filterAll: () => {},
    dimension: (expression, isGlobal) => {
      return getDimension({ expression, isGlobal, newCrossFilter })
    },
    // old crossfilter getFilter would return the filters array of sql strings.
    getFilter: (layerName = "") => {
      const newRes = buildFilterString(newCrossFilter.chartId, {
        includeGlobal: true,
        includeCharts: true,
        tables: newCrossFilter.getTables(),
        dataSource: newCrossFilter.getDataSource(),
        layerName
      })

      return [newRes]
    },
    // a crossfilter applies to a dashboard, so a crossfilter's global filter
    // is a dashboard-wide filter, and not a app-wide filter (such as a global expression filter)
    getGlobalFilterString: () => {
      const newGlobalFilterString = buildFilterString(newCrossFilter.chartId, {
        includeGlobal: true,
        includeCharts: false,
        tables: newCrossFilter.getTables(),
        dataSource: newCrossFilter.getDataSource()
      })

      return newGlobalFilterString
    },
    getFilterString: (layerName = "") => {
      const newFilterString = buildFilterString(newCrossFilter.chartId, {
        includeGlobal: false,
        includeCharts: true,
        tables: newCrossFilter.getTables(),
        dataSource: newCrossFilter.getDataSource(),
        layerName
      })

      // To ensure that BE rendered charts always have bounding boxes.
      // when we no longer need it, just uncomment the return statement and toss the
      // boundingBoxEnabledFilterString(newFilterString) one.
      // return newFilterString
      return boundingBoxEnabledFilterString({
        newFilterString,
        chartId: newCrossFilter.chartId,
        newCrossFilter,
        layerName
      })
    },
    // this is for when you need to grab a chart's filters minus provided exclusions
    getFilterStringWithExclusions: (excludeChartFilters, layerName = "") => {
      const newFilterString = buildFilterString(newCrossFilter.chartId, {
        includeGlobal: false,
        includeCharts: true,
        tables: newCrossFilter.getTables(),
        dataSource: newCrossFilter.getDataSource(),
        layerName,
        excludeChartFilters
      })

      return newFilterString
    },
    setGlobalFilter: () => {},
    getTableDescriptors: () => sharedCrossFilter.tableDescriptors,
    getColumns: () => sharedCrossFilter.columnTypeMap,
    // this is our shim that's shoved into the places that called CrossFilter.crossfilter().then()
    getFieldsAsync: async (forceUpdate = false) => {
      if (forceUpdate || !Object.keys(sharedCrossFilter.columnTypeMap).length) {
        sharedCrossFilter.resetFields()
        await getFields({
          connector,
          tables,
          compoundColumnMap: sharedCrossFilter.compoundColumnMap,
          columnTypeMap: sharedCrossFilter.columnTypeMap,
          columnNameCountMap: sharedCrossFilter.columnNameCountMap,
          tableDescriptors: sharedCrossFilter.tableDescriptors
        })
        return sharedCrossFilter.columnTypeMap
      } else {
        return Promise.resolve(sharedCrossFilter.columnTypeMap)
      }
    },
    size: () => newCrossFilter.sizeAsync(),
    sizeAsync: async () => {
      const query = `SELECT COUNT(*) AS val FROM ${process(dataSource)}`

      const options = {
        eliminateNullRows: false,
        renderSpec: null
      }

      return sharedCrossFilter.connector
        .queryAsync(process(query, { trackUsage: false }), options, "sizeAsync")
        .then((res) => res[0].val)
    },
    groupAll: () => {
      return getGroupAll({ newCrossFilter })
    },
    addCountChartGroupAll: (chartDataSource, groupAll) => {
      sharedCrossFilter.countChartLookup[chartDataSource] = groupAll
      return groupAll
    },
    getCountChartGroupAll: (chartDataSource) => {
      return sharedCrossFilter.countChartLookup[chartDataSource]
    }
  }
  return newCrossFilter
}

export default FakeCrossFilter

export { resetCrossFilter }
