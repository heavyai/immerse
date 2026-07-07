// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import {
  getTestCrossFilter,
  filterState,
  joinStateWithParams
} from "./test-utils"
import { populateImportableStore as setStore } from "store/importableStore"
import { fieldsMap } from "./test-connector-maps"
import { toParameterSyntax } from "utils/parameters"
import { FILTER_TYPE_SIMPLE } from "vega/constants/filter-type-constants"
import { cloneDeep } from "lodash"

const middlewares = [thunk]

const mockStore = configureStore(middlewares)

const dataSource = "test_table"
const tables = [dataSource]

function resetStore() {
  setStore(null)
}

describe("ImmerseCrossFilter", () => {
  it("creates ImmerseCrossFilter", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const crossfilter = await getTestCrossFilter(dataSource, tables)
    expect(crossfilter).toBeDefined()

    expect(crossfilter.sharedCrossFilter.compoundColumnMap).toEqual({
      colA: "test_table.colA",
      colB: "test_table.colB",
      colC: "test_table.colC",
      colD: "test_table.colD"
    })
    expect(crossfilter.sharedCrossFilter.columnNameCountMap).toEqual({
      colA: 1,
      colB: 1,
      colC: 1,
      colD: 1
    })
    expect(crossfilter.sharedCrossFilter.columnTypeMap).toEqual({
      "test_table.colA": expect.objectContaining({
        table: dataSource,
        column: "colA",
        type: "STR",
        precision: 0,
        is_array: false,
        is_dict: false,
        name_is_ambiguous: false,
        is_join: false
      }),
      "test_table.colB": expect.objectContaining({
        table: dataSource,
        column: "colB",
        type: "STR",
        precision: 0,
        is_array: false,
        is_dict: true,
        name_is_ambiguous: false,
        is_join: false
      }),
      "test_table.colC": expect.objectContaining({
        table: dataSource,
        column: "colC",
        type: "STR",
        precision: 0,
        is_array: false,
        is_dict: true,
        name_is_ambiguous: false,
        is_join: false
      }),
      "test_table.colD": expect.objectContaining({
        table: dataSource,
        column: "colD",
        type: "FLOAT",
        precision: 0,
        is_array: false,
        is_dict: false,
        name_is_ambiguous: false,
        is_join: false
      })
    })
    resetStore()
  })

  it("creates ImmerseCrossFilter w/chartId", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const crossfilter = await getTestCrossFilter(dataSource, tables, "1")
    expect(crossfilter).toBeDefined()
    const crossfilterWithChartId = crossfilter.cloneWithChartId("1")
    expect(crossfilterWithChartId).toBeDefined()
    expect(crossfilterWithChartId.chartId).toEqual("1")
    resetStore()
  })

  it("ImmerseCrossFilter has a table", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const crossfilter = await getTestCrossFilter(dataSource, tables, "1")
    expect(crossfilter.getTables()).toEqual(tables)
    resetStore()
  })

  it("ImmerseCrossFilter has a valid table", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const crossfilter = await getTestCrossFilter(dataSource, tables, "1")
    expect(crossfilter.isValidTable()).toEqual(true)
    resetStore()
  })

  it("ImmerseCrossFilter has an id", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const crossfilter = await getTestCrossFilter(dataSource, tables, "1")
    expect(crossfilter.getId()).not.toBeNaN()
    resetStore()
  })

  it("ImmerseCrossFilter tests dimension", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const crossfilter = await getTestCrossFilter(dataSource, tables, "1")
    const dimension = crossfilter.dimension("colA")
    expect(dimension).toBeDefined()
    expect(dimension.type).toEqual("dimension")
    resetStore()
  })

  it("ImmerseCrossFilter tests getFilter", async () => {
    const store = mockStore(filterState)
    setStore(store)

    const crossfilter = await getTestCrossFilter(dataSource, tables, "1")

    const filter = crossfilter.getFilter()
    expect(filter).toEqual([
      "colA = 'A-val-1' AND colB = 'B-val-1' AND colC = 'C-global-val-1'"
    ])
    resetStore()
  })

  it("ImmerseCrossFilter tests getGlobalFilterString", async () => {
    const store = mockStore(filterState)
    setStore(store)

    const crossfilter = await getTestCrossFilter(dataSource, tables, "1")

    const filter = crossfilter.getGlobalFilterString()
    expect(filter).toEqual("colC = 'C-global-val-1'")
    resetStore()
  })

  it("ImmerseCrossFilter tests getFilterString", async () => {
    const store = mockStore(filterState)
    setStore(store)

    const crossfilter = await getTestCrossFilter(dataSource, tables, "1")

    const filter = crossfilter.getFilterString()
    expect(filter).toEqual("colA = 'A-val-1' AND colB = 'B-val-1'")
    resetStore()
  })

  it("ImmerseCrossFilter tests getTableDescriptor", async () => {
    const store = mockStore(filterState)
    setStore(store)

    const crossfilter = await getTestCrossFilter(dataSource, tables, "1")
    expect(crossfilter.getTableDescriptors()[0]).toEqual(fieldsMap.test_table)
  })

  it("ImmerseCrossFilter tests getColumns", async () => {
    const store = mockStore(filterState)
    setStore(store)

    const crossfilter = await getTestCrossFilter(dataSource, tables, "1")

    expect(crossfilter.getColumns()).toEqual({
      "test_table.colA": expect.objectContaining({
        table: dataSource,
        column: "colA",
        type: "STR",
        precision: 0,
        is_array: false,
        is_dict: false,
        name_is_ambiguous: false
      }),
      "test_table.colB": expect.objectContaining({
        table: dataSource,
        column: "colB",
        type: "STR",
        precision: 0,
        is_array: false,
        is_dict: true,
        name_is_ambiguous: false
      }),
      "test_table.colC": expect.objectContaining({
        table: dataSource,
        column: "colC",
        type: "STR",
        precision: 0,
        is_array: false,
        is_dict: true,
        name_is_ambiguous: false
      }),
      "test_table.colD": expect.objectContaining({
        table: dataSource,
        column: "colD",
        type: "FLOAT",
        precision: 0,
        is_array: false,
        is_dict: false,
        name_is_ambiguous: false
      })
    })
  })

  it("ImmerseCrossFilter tests size", async () => {
    const store = mockStore(filterState)
    setStore(store)

    const crossfilter = await getTestCrossFilter(dataSource, tables, "1")

    const res = await crossfilter.size()
    expect(res).toEqual(5)
  })

  it("ImmerseCrossFilter tests sizeAsync", async () => {
    const store = mockStore(filterState)
    setStore(store)

    const crossfilter = await getTestCrossFilter(dataSource, tables, "1")

    const res = await crossfilter.sizeAsync()
    expect(res).toEqual(5)
  })

  it("ImmerseCrossFilter tests groupAll", async () => {
    const store = mockStore(filterState)
    setStore(store)

    const crossfilter = await getTestCrossFilter(dataSource, tables, "1")
    const groupAll = crossfilter.groupAll()
    expect(groupAll).toBeDefined()
    expect(groupAll.crossfilter).toEqual(crossfilter)
  })

  it("ImmerseCrossFilter tests addCountChartGroupAll/getCountChartGroupAll", async () => {
    const store = mockStore(filterState)
    setStore(store)

    const crossfilter = await getTestCrossFilter(dataSource, tables, "1")
    const fakeCountChart = { a: 1 }
    const addedChart = crossfilter.addCountChartGroupAll(
      dataSource,
      fakeCountChart
    )
    expect(addedChart).toEqual(fakeCountChart)
    expect(crossfilter.getCountChartGroupAll(dataSource)).toEqual(
      fakeCountChart
    )
  })

  describe("Join data source", () => {
    const joinDataSourceParam = "-NbpVtrY5NOsJRzc6vW5"
    const joinDataSource = toParameterSyntax(joinDataSourceParam)
    let joinState
    beforeEach(() => {
      joinState = cloneDeep({
        ...filterState,
        ...joinStateWithParams
      })
    })

    const createCrossfilter = ({
      chartId: crossfilterChartId = "1",
      dataSource: crossfilterDataSource = joinDataSource,
      tables: crossfilterTables = ["test_table", "test_pointmap_table_1"]
    } = {}) => {
      const store = mockStore(joinState)
      setStore(store)

      return getTestCrossFilter(
        crossfilterDataSource,
        crossfilterTables,
        crossfilterChartId
      )
    }

    it("should get columns from both tables with is_join set to true", async () => {
      const crossfilter = await createCrossfilter()
      expect(crossfilter.getColumns()).toEqual(
        expect.objectContaining({
          "test_table.colA": expect.objectContaining({
            table: "test_table",
            column: "colA",
            is_join: true
          }),
          "test_pointmap_table_1.lonA": expect.objectContaining({
            column: "lonA",
            is_join: true,
            table: "test_pointmap_table_1"
          })
        })
      )
    })

    it("should get fields for both tables when >1 table", async () => {
      const crossfilter = await createCrossfilter()
      const getFieldsSpy =
        crossfilter.sharedCrossFilter.connector.getFieldsAsync
      expect(getFieldsSpy).toHaveBeenCalledTimes(2)
      expect(getFieldsSpy).toHaveBeenNthCalledWith(1, "test_table")
      expect(getFieldsSpy).toHaveBeenNthCalledWith(2, "test_pointmap_table_1")
    })

    it("should get tables, descriptors, and datasource for join data source", async () => {
      const crossfilter = await createCrossfilter()
      expect(crossfilter.getTables()).toEqual(
        expect.arrayContaining(["test_table", "test_pointmap_table_1"])
      )
      const tableDescriptors = crossfilter.getTableDescriptors()
      expect(tableDescriptors.length).toBe(2)

      expect(crossfilter.getDataSource()).toBe(joinDataSource)
    })

    it("should get correct filters with more than one table", async () => {
      // Crossfilter has both tables, it should include filters for both in the filter string
      joinState.charts["1"].dataSource = "${-NgPdGhpBQ_SQb9vLQ5p}"
      const crossfilter = await createCrossfilter({
        dataSource: "${-NgPdGhpBQ_SQb9vLQ5p}",
        tables: ["test_pointmap_table_1", "test_pointmap_table_2"]
      })

      expect(crossfilter.getFilterString().trim())
        .toEqual(`((test_pointmap_table_1.lonA is not null
          AND test_pointmap_table_1.latA is not null
          AND test_pointmap_table_1.lonA >= -75 AND test_pointmap_table_1.lonA <= 75 AND test_pointmap_table_1.latA >= -31 AND test_pointmap_table_1.latA <= 70) AND (test_pointmap_table_2.lonB is not null
          AND test_pointmap_table_2.latB is not null
          AND test_pointmap_table_2.lonB >= -75 AND test_pointmap_table_2.lonB <= 75 AND test_pointmap_table_2.latB >= -31 AND test_pointmap_table_2.latB <= 70))`)
    })

    it("should not include multi-source filters if chart doesnt have all tables", async () => {
      // Crossfilter has test_pointmap_table_1 and test_table, but not test_pointmap_table_2, so it only grabs filters for test_table + test_pointmap_table_1
      const crossfilter = await createCrossfilter()
      expect(crossfilter.getFilterString()).toEqual(
        `test_table.colA = 'A-val-1' AND test_table.colB = 'B-val-1' AND ((test_pointmap_table_1.lonA is not null
          AND test_pointmap_table_1.latA is not null
          AND test_pointmap_table_1.lonA >= -75 AND test_pointmap_table_1.lonA <= 75 AND test_pointmap_table_1.latA >= -31 AND test_pointmap_table_1.latA <= 70))`
      )
    })

    it("should get correct global filters with more than one table", async () => {
      // Add a filter for our second table (test_pointmap_table_1), to make sure it gets picked up
      joinState.omnifilters.push({
        appliesTo: "GLOBAL",
        name: "-test-global-filter-2",
        enabled: true,
        simpleModeEnabled: false,
        dataSources: ["${-NbpVtrY5NOsJRzc6vW5}"],
        filter: {
          filterType: FILTER_TYPE_SIMPLE,
          dataExpression: "test_pointmap_table_1.colA",
          dataSource: "${-NbpVtrY5NOsJRzc6vW5}",
          dataType: "STR",
          dataTypeIsArray: false,
          operator: "=",
          table: "test_pointmap_table_1",
          value: "C-global-val-2"
        }
      })
      const crossfilter = await createCrossfilter()
      expect(crossfilter.getGlobalFilterString()).toEqual(
        "test_table.colC = 'C-global-val-1' AND test_pointmap_table_1.colA = 'C-global-val-2'"
      )
    })
    it("should use datasource for sizeAsync and parse param -> join syntax", async () => {
      joinState.dashboard.selectedTabId = "-NbpVH2fynMtIUW-pasY"
      const crossfilter = await createCrossfilter()
      const querySpy = crossfilter.sharedCrossFilter.connector.queryAsync
      await crossfilter.sizeAsync()
      expect(querySpy).toHaveBeenCalledWith(
        // Immerse escapes the quotes in these strings, so we need to keep them in this string to test equality
        // eslint-disable-next-line no-useless-escape
        `SELECT COUNT(*) AS val FROM \"test_pointmap_table_1\" INNER JOIN \"test_table\" ON (\"test_pointmap_table_1\".\"ljk\" = \"test_table\".\"rjk\")`,
        { eliminateNullRows: false, renderSpec: null },
        "sizeAsync"
      )
    })
  })
})
