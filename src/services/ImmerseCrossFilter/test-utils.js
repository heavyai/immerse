// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import ImmerseCrossFilter from "./index"
import { fieldsMap, queryMap } from "./test-connector-maps"

import {
  FILTER_TYPE_SIMPLE,
  FILTER_TYPE_BOUNDING_BOX,
  FILTER_TYPE_MULTISOURCE
} from "vega/constants/filter-type-constants"

export function getConnector(givenQueryAsync) {
  return {
    query: jest.fn((query, options, callback) => {
      if (queryMap[query]) {
        return queryMap[query]
      }
      throw new Error(
        `cannot call query on ${query}, ${options}, ${callback} : undefined result`
      )
    }),
    queryAsync:
      givenQueryAsync ||
      jest.fn((query, options, callback) => {
        if (queryMap[query]) {
          return Promise.resolve(queryMap[query])
        }
        throw new Error(
          `cannot call query on ${query}, ${options}, ${callback} : undefined result`
        )
      }),
    getFieldsAsync: jest.fn((table) => {
      if (fieldsMap[table] === undefined) {
        throw new Error(`Could not get fields for ${table}`)
      } else {
        return Promise.resolve(fieldsMap[table])
      }
    })
  }
}

export async function getTestCrossFilter(
  dataSource,
  tables = ["test_table"],
  chartId
) {
  const connector = getConnector()
  const crossfilter = ImmerseCrossFilter.crossfilter(
    connector,
    tables,
    dataSource
  )
  await crossfilter.getFieldsAsync()
  if (chartId) {
    return crossfilter.cloneWithChartId(chartId)
  }

  return crossfilter
}

export async function getTestDimension(
  expression,
  isGlobal = false,
  { table = "test_table", chartId = "1" } = {}
) {
  const crossfilter = await getTestCrossFilter(table, [table], chartId)
  return crossfilter.dimension(expression, isGlobal)
}

export async function getTestGroup(
  expression,
  isGlobal = false,
  { table = "test_table", chartId = "1" } = {}
) {
  const crossfilter = await getTestCrossFilter(table, [table], chartId)
  const dim = crossfilter.dimension(expression, isGlobal)
  return dim.group()
}
export async function getTestGroupAll(table = "test_table", chartId) {
  const crossfilter = await getTestCrossFilter(table, [table], chartId)
  return crossfilter.groupAll()
}

export const filterState = {
  parameters: {
    sets: {
      "sample-set": {
        id: "sample-set",
        tabId: "sample-tab"
      }
    },
    definitions: {},
    values: {}
  },
  dashboard: {
    id: "1",
    selectedTabId: "sample-tab"
  },
  dc: { initialRender: { done: true } },
  charts: {
    "1": {
      dataSource: "${-NbpVtrY5NOsJRzc6vW5}"
    },
    "2": {
      dataSource: "${-NbpVtrY5NOsJRzc6vW5}"
    },
    "3": {
      dataSource: "${-NbpVtrY5NOsJRzc6vW5}",
      measures: [],
      dimensions: [],
      mapZoomCenter: {
        zoom: 1.1150437,
        center: {
          lng: 0,
          lat: 29.9999999
        },
        bounds: {
          lonMin: -75,
          lonMax: 75,
          latMin: -31,
          latMax: 70
        }
      },
      type: "pointmap",
      layers: [
        {
          type: "pointmap",
          dataSource: "test_pointmap_table_1",
          measures: [
            { name: "x", value: "lonA", table: "test_pointmap_table_1" },
            { name: "y", value: "latA", table: "test_pointmap_table_1" }
          ]
        },
        {
          type: "pointmap",
          dataSource: "test_pointmap_table_2",
          measures: [
            { name: "x", value: "lonB", table: "test_pointmap_table_2" },
            { name: "y", value: "latB", table: "test_pointmap_table_2" }
          ]
        }
      ]
    },
    "5": {
      dataSource: "test_scatter_table",
      measures: [
        { name: "x", value: "x", minMax: [0, 5], table: "test_scatter_table" },
        { name: "y", value: "y", minMax: [3, 7], table: "test_scatter_table" }
      ],
      dimensions: [],
      type: "backendScatter"
    }
  },
  omnifilters: [
    {
      chartId: "1",
      appliesTo: "CHART",
      name: "-test-chart-filter",
      enabled: true,
      dataSources: ["test_table"],
      filter: {
        filterType: FILTER_TYPE_SIMPLE,
        dataSource: "test_table",
        dataExpression: "colA",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "A-val-1",
        extract: false,
        table: "test_table"
      },
      chartFilters: ["A-val-1"],
      chartRangeFilter: [],
      isRangeFilter: false,
      isOldFilter: true,
      areFiltersInverse: false
    },
    {
      chartId: "2",
      appliesTo: "CROSSFILTER",
      name: "-test-cross-filter",
      enabled: true,
      dataSources: ["test_table"],
      filter: {
        filterType: FILTER_TYPE_SIMPLE,
        dataSource: "test_table",
        dataExpression: "colB",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "B-val-1",
        extract: false,
        table: "test_table"
      },
      chartFilters: ["A-val-1"],
      chartRangeFilter: [],
      isRangeFilter: false,
      isOldFilter: true,
      areFiltersInverse: false
    },
    {
      appliesTo: "GLOBAL",
      name: "-test-global-filter",
      enabled: true,
      simpleModeEnabled: false,
      dataSources: ["test_table"],
      filter: {
        filterType: FILTER_TYPE_SIMPLE,
        dataExpression: "colC",
        dataSource: "test_table",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        table: "test_table",
        value: "C-global-val-1"
      }
    },
    {
      chartId: "3",
      appliesTo: "CROSSFILTER",
      name: "-test-bbox-filter",
      enabled: true,
      dataSources: ["test_pointmap_table_1", "test_pointmap_table_2"],
      filter: {
        filterType: FILTER_TYPE_MULTISOURCE,
        filtersByDataSource: {
          test_pointmap_table_1: {
            filterType: FILTER_TYPE_BOUNDING_BOX,
            dataSource: "test_pointmap_table_1",
            table: "test_pointmap_table_1",
            lonExpression: "lonA",
            lonDataType: "FLOAT",
            latExpression: "latA",
            latDataType: "FLOAT",
            isGeoJoin: false,
            lonMin: -75,
            lonMax: 75,
            latMin: -31,
            latMax: 70,
            layerId: 1
          },
          test_pointmap_table_2: {
            filterType: FILTER_TYPE_BOUNDING_BOX,
            dataSource: "test_pointmap_table_2",
            table: "test_pointmap_table_2",
            lonExpression: "lonB",
            lonDataType: "FLOAT",
            latExpression: "latB",
            latDataType: "FLOAT",
            isGeoJoin: false,
            lonMin: -75,
            lonMax: 75,
            latMin: -31,
            latMax: 70,
            layerId: 0
          }
        }
      },
      chartFilters: [],
      chartRangeFilter: [],
      mapZoomCenter: {
        zoom: 1.1150437,
        center: {
          lng: 0,
          lat: 29.9999999
        },
        bounds: {
          lonMin: -75,
          lonMax: 75,
          latMin: -31,
          latMax: 70
        }
      },
      isRangeFilter: false,
      isOldFilter: true,
      areFiltersInverse: false
    }
  ],
  crossLinks: []
}

export const joinStateWithParams = {
  ...filterState,
  charts: {
    ...filterState.charts,
    // Set this up to point at a join datasource
    "3": {
      measures: [],
      dimensions: [],
      mapZoomCenter: {
        zoom: 1.1150437,
        center: {
          lng: 0,
          lat: 29.9999999
        },
        bounds: {
          lonMin: -75,
          lonMax: 75,
          latMin: -31,
          latMax: 70
        }
      },
      type: "pointmap",
      layers: [
        {
          type: "pointmap",
          dataSource: "${-NgPdGhpBQ_SQb9vLQ5p}",
          measures: [
            { name: "x", value: "lonA", table: "test_pointmap_table_1" },
            { name: "y", value: "latA", table: "test_pointmap_table_1" }
          ]
        },
        {
          type: "pointmap",
          dataSource: "${-NgPdGhpBQ_SQb9vLQ5p}",
          measures: [
            { name: "x", value: "lonB", table: "test_pointmap_table_2" },
            { name: "y", value: "latB", table: "test_pointmap_table_2" }
          ]
        }
      ]
    }
  },
  chartEditor: {
    editing: false
  },
  omnifilters: [
    {
      chartId: "1",
      appliesTo: "CHART",
      name: "-test-chart-filter",
      enabled: true,
      dataSources: ["${-NbpVtrY5NOsJRzc6vW5}"],
      filter: {
        filterType: FILTER_TYPE_SIMPLE,
        dataSource: "${-NbpVtrY5NOsJRzc6vW5}",
        dataExpression: "test_table.colA",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "A-val-1",
        extract: false,
        table: "test_table"
      },
      chartFilters: ["A-val-1"],
      chartRangeFilter: [],
      isRangeFilter: false,
      isOldFilter: true,
      areFiltersInverse: false
    },
    {
      chartId: "2",
      appliesTo: "CROSSFILTER",
      name: "-test-cross-filter",
      enabled: true,
      dataSources: ["${-NbpVtrY5NOsJRzc6vW5}"],
      filter: {
        filterType: FILTER_TYPE_SIMPLE,
        dataSource: "${-NbpVtrY5NOsJRzc6vW5}",
        dataExpression: "test_table.colB",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "B-val-1",
        extract: false,
        table: "test_table"
      },
      chartFilters: ["A-val-1"],
      chartRangeFilter: [],
      isRangeFilter: false,
      isOldFilter: true,
      areFiltersInverse: false
    },
    {
      appliesTo: "GLOBAL",
      name: "-test-global-filter",
      enabled: true,
      simpleModeEnabled: false,
      dataSources: ["${-NbpVtrY5NOsJRzc6vW5}"],
      filter: {
        filterType: FILTER_TYPE_SIMPLE,
        dataExpression: "test_table.colC",
        dataSource: "${-NbpVtrY5NOsJRzc6vW5}",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        table: "test_table",
        value: "C-global-val-1"
      }
    },
    {
      chartId: "3",
      appliesTo: "CROSSFILTER",
      name: "-test-bbox-filter",
      enabled: true,
      dataSources: ["${-NgPdGhpBQ_SQb9vLQ5p}"],
      filter: {
        filterType: FILTER_TYPE_MULTISOURCE,
        filtersByDataSource: {
          test_pointmap_table_1: {
            filterType: FILTER_TYPE_BOUNDING_BOX,
            dataSource: "${-NgPdGhpBQ_SQb9vLQ5p}",
            table: "test_pointmap_table_1",
            lonExpression: "test_pointmap_table_1.lonA",
            lonDataType: "FLOAT",
            latExpression: "test_pointmap_table_1.latA",
            latDataType: "FLOAT",
            isGeoJoin: false,
            lonMin: -75,
            lonMax: 75,
            latMin: -31,
            latMax: 70,
            layerId: 0
          },
          test_pointmap_table_2: {
            filterType: FILTER_TYPE_BOUNDING_BOX,
            dataSource: "${-NgPdGhpBQ_SQb9vLQ5p}",
            table: "test_pointmap_table_2",
            lonExpression: "test_pointmap_table_2.lonB",
            lonDataType: "FLOAT",
            latExpression: "test_pointmap_table_2.latB",
            latDataType: "FLOAT",
            isGeoJoin: false,
            lonMin: -75,
            lonMax: 75,
            latMin: -31,
            latMax: 70,
            layerId: 1
          }
        }
      }
    }
  ],
  joinDataSources: [
    {
      joins: [
        {
          leftJoinKey: "ljk",
          rightJoinKey: "rjk",
          rightTable: "test_table",
          leftTable: "test_pointmap_table_1",
          leftDatabase: "ldb",
          rightDatabase: "rdb"
        }
      ],
      name: "a-fake-join",
      parameter: "-NbpVtrY5NOsJRzc6vW5"
    },
    {
      joins: [
        {
          leftJoinKey: "ljk",
          rightJoinKey: "rjk",
          rightTable: "test_pointmap_table_2",
          leftTable: "test_pointmap_table_1",
          leftDatabase: "ldb",
          rightDatabase: "rdb"
        }
      ],
      name: "a-fake-pointmap-join",
      parameter: "-NgPdGhpBQ_SQb9vLQ5p"
    }
  ],
  parameters: {
    definitions: {
      "-NbpVtrY5NOsJRzc6vW5": {
        name: "-NbpVtrY5NOsJRzc6vW5",
        displayName: "a-fake-join",
        type: "JOIN",
        defaultValue:
          '"test_pointmap_table_1" INNER JOIN "test_table" ON ("test_pointmap_table_1"."ljk" = "test_table"."rjk")'
      },
      "-NgPdGhpBQ_SQb9vLQ5p": {
        name: "-NgPdGhpBQ_SQb9vLQ5p",
        displayName: "a-fake-pointmap-join",
        type: "JOIN",
        defaultValue:
          '"test_pointmap_table_1" INNER JOIN "test_pointmap_table_2" ON ("test_pointmap_table_1"."ljk" = "test_pointmap_table_2"."rjk")'
      }
    },
    sets: {
      "-NbpVH3-4LXi8kDqE_Gc": {
        name: "Shared Parameter Set",
        id: "-NbpVH3-4LXi8kDqE_Gc",
        showHidden: true
      },
      "-NbpVH30IY1-IJl284NE": {
        name: "Parameter Set",
        id: "-NbpVH30IY1-IJl284NE",
        parent: "-NbpVH3-4LXi8kDqE_Gc",
        tabId: "-NbpVH2fynMtIUW-pasY",
        showHidden: true
      }
    },
    values: {
      "-NbpVtrY5NOsJRzc6vW5": {
        "-NbpVH30IY1-IJl284NE": {
          value: null,
          defaultValue: null,
          parameterSetId: "-NbpVH30IY1-IJl284NE",
          name: "-NbpVtrY5NOsJRzc6vW5"
        },
        "-NbpVH3-4LXi8kDqE_Gc": {
          value:
            '"test_pointmap_table_1" INNER JOIN "test_table" ON ("test_pointmap_table_1"."ljk" = "test_table"."rjk")',
          parameterSetId: "-NbpVH3-4LXi8kDqE_Gc",
          name: "-NbpVtrY5NOsJRzc6vW5"
        }
      },
      "-NgPdGhpBQ_SQb9vLQ5p": {
        "-NbpVH30IY1-IJl284NE": {
          value: null,
          defaultValue: null,
          parameterSetId: "-NbpVH30IY1-IJl284NE",
          name: "-NgPdGhpBQ_SQb9vLQ5p"
        },
        "-NbpVH3-4LXi8kDqE_Gc": {
          value:
            '"test_pointmap_table_1" INNER JOIN "test_table" ON ("test_pointmap_table_1"."ljk" = "test_table"."rjk")',
          parameterSetId: "-NbpVH3-4LXi8kDqE_Gc",
          name: "-NbpVtrY5NOsJRzc6vW5"
        }
      }
    }
  }
}
