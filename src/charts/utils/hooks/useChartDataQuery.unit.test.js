// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useChartDataQuery } from "./useChartDataQuery"
import { renderHookWithStore } from "jest/renderScaffolding"
import { importableStore as store } from "store/importableStore"

const mockState = {
  charts: {
    "1": {
      id: "1",
      dataSource: "table-1",
      dimensions: [
        { table: "t1", type: "STR", value: "dimCol", label: "dimLabel" }
      ],
      measures: [
        {
          table: "t1",
          type: "STR",
          value: "measureCol",
          aggType: "AVG",
          label: "measureLabel"
        }
      ]
    }
  },
  omnifilters: [
    {
      name: "test-filter-0",
      chartId: "1",
      appliesTo: "CROSSFILTER",
      enabled: true,
      dataSources: ["table-1"],
      filter: {
        dataSource: "table-1",
        table: "table-1",
        dataExpression: "x",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v1"
      }
    },
    {
      name: "test-filter-1",
      chartId: "1",
      appliesTo: "CROSSFILTER",
      enabled: true,
      dataSources: ["table-1"],
      filter: {
        dataSource: "table-1",
        table: "table-1",
        dataExpression: "x",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v1"
      }
    },
    {
      name: "test-filter-2",
      chartId: "2",
      appliesTo: "CROSSFILTER",
      enabled: true,
      dataSources: ["table-1"],
      filter: {
        dataSource: "table-1",
        table: "table-1",
        dataExpression: "x",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v1"
      },
      layerId: "layer-1"
    },
    {
      name: "test-filter-3",
      chartId: "2",
      appliesTo: "CROSSFILTER",
      enabled: true,
      dataSources: ["table-1"],
      filter: {
        dataSource: "table-1",
        table: "table-1",
        dataExpression: "x",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v1"
      },
      layerId: "layer-2"
    },
    {
      name: "test-filter-4",
      chartId: "1",
      appliesTo: "CROSSFILTER",
      enabled: true,
      dataSources: ["table-2"],
      filter: {
        dataSource: "table-2",
        table: "table-2",
        dataExpression: "y",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v2"
      }
    },
    {
      name: "test-filter-5",
      chartId: "2",
      appliesTo: "CROSSFILTER",
      enabled: true,
      dataSources: ["table-2"],
      filter: {
        dataSource: "table-2",
        table: "table-2",
        dataExpression: "y",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v2"
      }
    },
    {
      name: "test-filter-6",
      chartId: "1",
      appliesTo: "CHART",
      enabled: true,
      dataSources: ["table-1"],
      filter: {
        dataSource: "table-1",
        table: "table-1",
        dataExpression: "x",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v1"
      }
    },
    {
      name: "test-filter-7",
      appliesTo: "GLOBAL",
      dataSources: ["table-1"],
      filter: {
        dataSource: "table-1",
        table: "table-1",
        dataExpression: "x",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v1"
      },
      enabled: true
    },
    {
      name: "test-filter-8",
      appliesTo: "GLOBAL",
      dataSources: ["table-1"],
      filter: {
        dataSource: "table-1",
        table: "table-1",
        dataExpression: "x",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v1"
      },
      enabled: true
    },
    {
      name: "test-filter-9",
      appliesTo: "GLOBAL",
      dataSources: ["table-2"],
      filter: {
        dataSource: "table-2",
        table: "table-2",
        dataExpression: "y",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v2"
      },
      enabled: true
    },
    {
      name: "test-filter-10",
      chartId: "1",
      appliesTo: "CROSSFILTER",
      enabled: false,
      dataSources: ["table-1"],
      filter: {
        dataSource: "table-1",
        table: "table-1",
        dataExpression: "x",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v1"
      }
    },
    {
      name: "test-filter-11",
      appliesTo: "GLOBAL",
      dataSources: ["table-2"],
      filter: {
        dataSource: "table-2",
        table: "table-2",
        dataExpression: "y",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v2"
      },
      enabled: false
    }
  ]
}

const joinParameter = "-NbpVtrY5NOsJRzc6vW5"
const joinDataSource = `\${${joinParameter}}`
const table1 = "t1"
const table2 = "t2"
const mockJoin = `"${table1}" INNER JOIN "${table2}" ON ("${table1}"."ljk" = "${table2}"."rjk")`
const joinMockState = {
  dashboard: {
    selectedTabId: "-NbpVH2fynMtIUW-pasY"
  },
  chartEditor: {
    editing: false
  },
  charts: {
    "1": {
      id: "1",
      dataSource: joinDataSource,
      dimensions: [
        {
          dataSource: joinDataSource,
          table: table1,
          type: "STR",
          value: "dimCol",
          label: "dimLabel"
        },
        {
          dataSource: joinDataSource,
          table: table2,
          type: "STR",
          value: "dimCol2",
          label: "dimLabel2"
        }
      ],
      measures: [
        {
          dataSource: joinDataSource,
          table: table1,
          type: "STR",
          value: "measureCol",
          aggType: "AVG",
          label: "measureLabel"
        }
      ]
    },
    "2": {
      id: "2",
      dataSource: joinDataSource,
      dimensions: [
        {
          dataSource: joinDataSource,
          table: table1,
          type: "STR",
          value: "dimCol",
          label: "dimLabel"
        },
        {
          dataSource: joinDataSource,
          table: table2,
          type: "STR",
          value: "dimCol2",
          label: "dimLabel2"
        }
      ],
      measures: [
        {
          dataSource: joinDataSource,
          table: table1,
          type: "STR",
          value: "measureCol",
          aggType: "AVG",
          label: "measureLabel"
        }
      ]
    }
  },
  omnifilters: [
    // Chart 1 crossfilter from join datasource
    {
      name: "test-filter-0",
      chartId: "1",
      appliesTo: "CROSSFILTER",
      enabled: true,
      dataSources: [joinDataSource],
      filter: {
        dataSource: joinDataSource,
        table: table1,
        dataExpression: `${table1}.x`,
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "join-ds-v1"
      }
    },
    // Chart 1 filter from join datasource
    {
      name: "test-filter-1",
      chartId: "1",
      appliesTo: "CROSSFILTER",
      enabled: true,
      dataSources: [joinDataSource],
      filter: {
        dataSource: joinDataSource,
        table: table2,
        dataExpression: `${table2}.x`,
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "join-ds-v1"
      }
    },
    // Chart 2 filter on a single table, should still apply to chart using join data source
    {
      name: "test-filter-2",
      chartId: "2",
      appliesTo: "CROSSFILTER",
      enabled: true,
      dataSources: [table1],
      filter: {
        dataSource: table1,
        table: table1,
        dataExpression: `${table1}.x`,
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "table1-layer1-v1"
      },
      layerId: "layer-1"
    },
    // chart 2 filter on a single table from second layer
    {
      name: "test-filter-3",
      chartId: "2",
      appliesTo: "CROSSFILTER",
      enabled: true,
      dataSources: [table2],
      filter: {
        dataSource: table2,
        table: table2,
        dataExpression: `${table2}.x`,
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "table2-layer2-v1"
      },
      layerId: "layer-2"
    },
    // disabled chart1 filter on single table
    {
      name: "test-filter-10",
      chartId: "1",
      appliesTo: "CROSSFILTER",
      enabled: false,
      dataSources: [table1],
      filter: {
        dataSource: table1,
        table: table1,
        dataExpression: `${table1}.x`,
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "table1-disabled-v1"
      }
    }
  ],
  joinDataSources: [
    {
      joins: [
        {
          leftJoinKey: "ljk",
          rightJoinKey: "rjk",
          rightTable: table2,
          leftTable: table1,
          leftDatabase: "ldb",
          rightDatabase: "rdb"
        }
      ],
      name: "a-fake-join",
      parameter: joinParameter
    }
  ],
  parameters: {
    definitions: {
      [joinParameter]: {
        name: joinParameter,
        displayName: "a-fake-join",
        type: "JOIN",
        defaultValue: mockJoin
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
      [joinParameter]: {
        "-NbpVH30IY1-IJl284NE": {
          value: null,
          defaultValue: null,
          parameterSetId: "-NbpVH30IY1-IJl284NE",
          name: joinParameter
        },
        "-NbpVH3-4LXi8kDqE_Gc": {
          value: mockJoin,
          parameterSetId: "-NbpVH3-4LXi8kDqE_Gc",
          name: joinParameter
        }
      }
    }
  }
}
describe("useChartDataQuery", () => {
  it("can generate simple chart query", () => {
    const { result } = renderHookWithStore(() => useChartDataQuery("1"), {
      initialState: mockState
    })

    expect(result.current).toBe(
      "SELECT dimCol AS key0, AVG(measureCol) AS measure0 FROM table-1 WHERE x = 'v1' AND x = 'v1' AND x = 'v1' AND x = 'v1' AND x = 'v1' GROUP BY key0"
    )
  })

  it("can useChartDataQuery with limit and order by options", () => {
    const { result } = renderHookWithStore(
      () => useChartDataQuery("1", { limit: 5, orderBy: "dimCol" }),
      {
        initialState: mockState
      }
    )

    expect(result.current).toBe(
      "SELECT dimCol AS key0, AVG(measureCol) AS measure0 FROM table-1 WHERE x = 'v1' AND x = 'v1' AND x = 'v1' AND x = 'v1' AND x = 'v1' GROUP BY key0 ORDER BY dimCol LIMIT 5"
    )
  })

  it("can useChartDataQuery with single table filters", () => {
    jest.spyOn(store, "getState").mockReturnValue(joinMockState)
    const { result } = renderHookWithStore(() => useChartDataQuery("1"), {
      initialState: joinMockState
    })

    expect(result.current).toBe(
      `SELECT dimCol AS key0,dimCol2 AS key1, AVG(measureCol) AS measure0 FROM $\{${joinParameter}} WHERE t1.x = 'table1-layer1-v1' AND t2.x = 'table2-layer2-v1' GROUP BY key0,key1`
    )
  })

  it("can useChartDataQuery with join data source", () => {
    jest.spyOn(store, "getState").mockReturnValue(joinMockState)
    const { result } = renderHookWithStore(() => useChartDataQuery("2"), {
      initialState: joinMockState
    })

    expect(result.current).toBe(
      `SELECT dimCol AS key0,dimCol2 AS key1, AVG(measureCol) AS measure0 FROM $\{${joinParameter}} WHERE t1.x = 'join-ds-v1' AND t2.x = 'join-ds-v1' GROUP BY key0,key1`
    )
  })
})
