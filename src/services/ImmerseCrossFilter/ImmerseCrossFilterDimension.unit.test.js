// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { getTestDimension, filterState } from "./test-utils"
import { populateImportableStore as setStore } from "store/importableStore"

const middlewares = [thunk]

const mockStore = configureStore(middlewares)

const col = "colA"

function resetStore() {
  setStore(null)
}

describe("ImmerseCrossFilterDimension test suite", () => {
  it("creates a dimension", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const dim = await getTestDimension(col)
    expect(dim).toBeDefined()
    expect(dim.type).toEqual("dimension")
  })
  it("checks the dimension value", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const dim = await getTestDimension(col)
    expect(dim.value()).toEqual(["test_table.colA"])
  })
  it("checks the dimension set", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const dim = await getTestDimension(col)
    expect(dim.value()).toEqual(["test_table.colA"])
    dim.set((a) => a.map((c) => `MAPPED-${c}`))
    expect(dim.value()).toEqual(["MAPPED-test_table.colA"])
  })
  it("checks the dimension order", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const dim = await getTestDimension(col)
    expect(dim.order()).toEqual(dim)
    expect(dim.order("foo")).toEqual(dim)
    expect(dim.order()).toEqual(dim)
  })
  it("checks the dimension multiDim", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const dim = await getTestDimension(col)
    expect(dim.multiDim()).toEqual(false)
    expect(dim.multiDim(true)).toEqual(dim)
    expect(dim.multiDim()).toEqual(true)
  })
  it("checks the dimension filter/getFilter", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const dim = await getTestDimension(col)
    dim.filter([5, 10])
    expect(dim.getFilter()).toEqual([[5, 10]])
    dim.filter([[5, 10]])
    expect(dim.getFilter()).toEqual([[5, 10]])
  })
  it("checks the dimension selfFilter", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const dim = await getTestDimension(col)
    expect(dim.selfFilter()).toEqual("")
    expect(dim.selfFilter("foo")).toEqual(dim)
    expect(dim.selfFilter()).toEqual("foo")
  })
  it("checks the dimension nullsOrder", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const dim = await getTestDimension(col)
    expect(dim.nullsOrder()).toEqual("")
    expect(dim.nullsOrder("foo")).toEqual("foo")
    expect(dim.nullsOrder()).toEqual("foo")
  })
  it("checks the dimension writeQuery", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const dim = await getTestDimension(col)
    dim.projectOn([col])
    expect(dim.getProjectOn()).toEqual([col])

    const queryA = dim.getQuery(50, 0, undefined, "ASC")
    expect(queryA).toEqual(
      "SELECT colA FROM test_table WHERE colA = 'A-val-1' AND colB = 'B-val-1' AND colC = 'C-global-val-1' ORDER BY test_table.colA ASC  LIMIT 50 OFFSET 0"
    )

    const queryB = dim.getQuery(50, 0, undefined, "ASC")
    expect(queryB).toEqual(
      "SELECT colA FROM test_table WHERE colA = 'A-val-1' AND colB = 'B-val-1' AND colC = 'C-global-val-1' ORDER BY test_table.colA ASC  LIMIT 50 OFFSET 0"
    )

    const queryC = dim.getQuery(75, 25, undefined, "ASC")
    expect(queryC).toEqual(
      "SELECT colA FROM test_table WHERE colA = 'A-val-1' AND colB = 'B-val-1' AND colC = 'C-global-val-1' ORDER BY test_table.colA ASC  LIMIT 75 OFFSET 25"
    )

    const queryD = dim.getQuery(50, 0, undefined, "DESC")
    expect(queryD).toEqual(
      "SELECT colA FROM test_table WHERE colA = 'A-val-1' AND colB = 'B-val-1' AND colC = 'C-global-val-1' ORDER BY test_table.colA DESC  LIMIT 50 OFFSET 0"
    )

    dim.samplingRatio(0.5)
    const queryE = dim.getQuery(50, 0, undefined, "DESC")
    expect(queryE).toEqual(
      "SELECT colA FROM test_table WHERE colA = 'A-val-1' AND colB = 'B-val-1' AND colC = 'C-global-val-1' AND SAMPLE_RATIO(0.5) ORDER BY test_table.colA DESC  LIMIT 50 OFFSET 0"
    )

    const dim2 = await getTestDimension("colB", false, { chartId: "2" })
    dim2.projectOn(["colB"])

    const queryF = dim2.getQuery(10, 3, undefined, "ASC")
    expect(queryF).toEqual(
      "SELECT colB FROM test_table WHERE colC = 'C-global-val-1' ORDER BY test_table.colB ASC  LIMIT 10 OFFSET 3"
    )

    resetStore()
  })
  it("checks the dimension topAsync", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const dim = await getTestDimension(col)
    dim.projectOn([col])
    expect(dim.getProjectOn()).toEqual([col])

    const res = await dim.topAsync(50, 0, false, "DESC")

    expect(res).toEqual([
      { colA: "A5" },
      { colA: "A4" },
      { colA: "A3" },
      { colA: "A2" },
      { colA: "A1" }
    ])

    resetStore()
  })
  it("checks the dimension bottomAsync", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const dim = await getTestDimension(col)
    dim.projectOn([col])
    expect(dim.getProjectOn()).toEqual([col])

    const res = await dim.bottomAsync(50, 0, false)

    expect(res).toEqual([
      { colA: "A1" },
      { colA: "A2" },
      { colA: "A3" },
      { colA: "A4" },
      { colA: "A5" }
    ])

    resetStore()
  })
  it("checks the dimension groupAll", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const dim = await getTestDimension(col)
    const groupAll = dim.groupAll()
    expect(groupAll).toBeDefined()
    expect(groupAll.crossfilter).toEqual(dim.crossfilter)
  })
  it("checks the dimension group", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const dim = await getTestDimension(col)
    const group = dim.group()
    expect(group).toBeDefined()
    expect(group.dimension()).toEqual(dim)
  })
  it("checks the dimension samplingRatio", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const dim = await getTestDimension(col)
    expect(dim.samplingRatio()).toEqual(dim)
    expect(dim.samplingRatio("foo")).toEqual(dim)
    expect(dim.samplingRatio()).toEqual(dim)
  })
  it("checks the dimension setEliminateNull/getEliminateNull/eliminateNull", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const dim = await getTestDimension(col)
    expect(dim.getEliminateNull()).toEqual(true)
    expect(dim.eliminateNull()).toEqual(true)
    expect(dim.setEliminateNull(false)).toEqual(dim)
    expect(dim.getEliminateNull()).toEqual(false)
    expect(dim.eliminateNull()).toEqual(false)
  })
  it("checks the dimension getDimensionIndex", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const dim = await getTestDimension(col)
    expect(dim.getDimensionIndex()).not.toBeNaN()
  })
  it("checks the dimension getDimensionName", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const dim = await getTestDimension(col)
    expect(dim.getDimensionName()).toEqual([col])
  })
  it("checks the dimension projectOn/getProjectOn", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const dim = await getTestDimension(col)
    dim.projectOn([col])
    expect(dim.getProjectOn()).toEqual([col])
    dim.projectOn(["able"])
    expect(dim.getProjectOn()).toEqual(["able"])
  })
})
