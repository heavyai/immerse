// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import {
  getTestGroup,
  getTestDimension,
  getTestCrossFilter,
  filterState
} from "./test-utils"
import { populateImportableStore as setStore } from "store/importableStore"

const middlewares = [thunk]

const mockStore = configureStore(middlewares)

const table = "test_table"
const col = "colA"

function resetStore() {
  setStore(null)
}

describe("ImmerseCrossFilterGroup test suite", () => {
  it("creates a group", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const group = await getTestGroup(col)
    expect(group).toBeDefined()
  })
  it("checks the group dimension", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const dim = await getTestDimension(col)
    const group = dim.group()
    expect(group.dimension()).toEqual(dim)
  })
  it("checks the group order", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const group = await getTestGroup(col)
    expect(group.getOrderExpression()).toEqual(null)
    expect(group.order()).toEqual(group)
    expect(group.getOrderExpression()).toEqual(undefined)
    expect(group.order("foo")).toEqual(group)
    expect(group.getOrderExpression()).toEqual("foo")
    expect(group.order()).toEqual(group)
    expect(group.getOrderExpression()).toEqual(undefined)
  })

  it("checks the group binParams", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const group = await getTestGroup(col)
    expect(group.binParams()).toEqual([])
    expect(group.binParams([5, 7])).toEqual(group)
    expect(group.binParams()).toEqual([5, 7])
  })
  it("checks the group buildDimContainsArray", async () => {
    const store = mockStore(filterState)
    setStore(store)
    // this needs a better test. This is -only- testing for a non-array column. It needs
    // to test for an array column.
    const crossfilter = await getTestCrossFilter(table, "1")
    const dim = crossfilter.dimension(col)
    const group = dim.group()
    expect(group.buildDimContainsArray(dim.value())).toEqual([undefined])
  })
  it("checks the group topAsync", async () => {
    const store = mockStore(filterState)
    setStore(store)
    /* topAsync: (
      k,
      offset,
      renderSpec,
      ignoreFilters,
      sortOrder = "DESC",
      callback,
      orderByClause
    ) */

    const group = await getTestGroup(col)

    const resA = await group.topAsync(50, 0, false)
    expect(resA).toEqual([
      { key0: "A5", val: 50 },
      { key0: "A4", val: 40 },
      { key0: "A3", val: 30 },
      { key0: "A2", val: 20 },
      { key0: "A1", val: 10 }
    ])

    const resB = await group.topAsync(50, 0, false, false, "ASC")
    expect(resB).toEqual([
      { key0: "A1", val: 10 },
      { key0: "A2", val: 20 },
      { key0: "A3", val: 30 },
      { key0: "A4", val: 40 },
      { key0: "A5", val: 50 }
    ])

    const resC = await group.topAsync(
      50,
      0,
      false,
      false,
      "ASC",
      undefined,
      "ORDER BY key0 ASC"
    )
    expect(resC).toEqual([
      { key0: "A1", val: 10 },
      { key0: "A2", val: 20 },
      { key0: "A3", val: 30 },
      { key0: "A4", val: 40 },
      { key0: "A5", val: 50 }
    ])

    resetStore()
  })
  it("checks the group allAsync", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const group = await getTestGroup(col)

    const resA = await group.allAsync()
    expect(resA).toEqual([
      { key0: "A1", val: 10 },
      { key0: "A2", val: 20 },
      { key0: "A3", val: 30 },
      { key0: "A4", val: 40 },
      { key0: "A5", val: 50 }
    ])

    resetStore()
  })
  it("checks the group all", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const group = await getTestGroup(col)

    const resA = await group.all()
    expect(resA).toEqual([
      { key0: "A1", val: 10 },
      { key0: "A2", val: 20 },
      { key0: "A3", val: 30 },
      { key0: "A4", val: 40 },
      { key0: "A5", val: 50 }
    ])

    resetStore()
  })
  it("checks the group top", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const group = await getTestGroup(col)

    const resA = await group.top(50, 0, false)
    expect(resA).toEqual([
      { key0: "A5", val: 50 },
      { key0: "A4", val: 40 },
      { key0: "A3", val: 30 },
      { key0: "A2", val: 20 },
      { key0: "A1", val: 10 }
    ])

    const resB = await group.top(50, 0, true)
    expect(resB).toEqual([
      { key0: "A5", val: 50 },
      { key0: "A4", val: 40 },
      { key0: "A3", val: 30 },
      { key0: "A2", val: 20 },
      { key0: "A1", val: 10 }
    ])

    resetStore()
  })
  it("checks the group bottomAsync", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const group = await getTestGroup(col)

    const resA = await group.bottomAsync(50, 0, false)
    expect(resA).toEqual([
      { key0: "A1", val: 10 },
      { key0: "A2", val: 20 },
      { key0: "A3", val: 30 },
      { key0: "A4", val: 40 },
      { key0: "A5", val: 50 }
    ])

    const resB = await group.bottomAsync(50, 0, true)
    expect(resB).toEqual([
      { key0: "A1", val: 10 },
      { key0: "A2", val: 20 },
      { key0: "A3", val: 30 },
      { key0: "A4", val: 40 },
      { key0: "A5", val: 50 }
    ])

    resetStore()
  })
  it("checks the group getCrossfilter", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const crossfilter = await getTestCrossFilter(table, "1")
    const dim = crossfilter.dimension(col)
    const group = dim.group()
    expect(group.dimension()).toEqual(dim)
    expect(group.getCrossfilter()).toEqual(crossfilter)
  })
  it("checks the group reduce", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const group = await getTestGroup(col)
    expect(group.reduce()).toEqual([
      { agg_mode: "count", expression: undefined, name: "val" }
    ])

    const newReduction = [
      {
        expression: "bar",
        agg_mode: "avg",
        name: "foo"
      }
    ]

    expect(group.reduce(newReduction)).toEqual(group)

    expect(group.reduce()).toEqual(newReduction)
  })
  it("checks the group reduceCount", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const group = await getTestGroup(col)
    expect(group.reduceCount("foo", "bar")).toEqual(group)
    expect(group.reduce()).toEqual([
      { agg_mode: "count", expression: "foo", name: "bar" }
    ])
  })
  it("checks the group writeFilter", async () => {
    const store = mockStore(filterState)
    setStore(store)

    const group = await getTestGroup(col)

    const filter = group.writeFilter()
    expect(filter).toEqual(
      "colA = 'A-val-1' AND colB = 'B-val-1' AND colC = 'C-global-val-1'"
    )

    resetStore()
  })
  it("checks the group getMinMaxWithFilters", async () => {
    const store = mockStore(filterState)
    setStore(store)

    const group = await getTestGroup(col)

    const res = await group.getMinMaxWithFilters()
    expect(res).toEqual({ max_val: 7, min_val: 3 })

    resetStore()
  })
})
