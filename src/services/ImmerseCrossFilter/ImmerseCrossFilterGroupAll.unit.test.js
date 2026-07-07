// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { getTestGroupAll, filterState } from "./test-utils"
import { populateImportableStore as setStore } from "store/importableStore"

const middlewares = [thunk]

const mockStore = configureStore(middlewares)

const table = "test_table"

function resetStore() {
  setStore(null)
}

describe("ImmerseCrossFilterGroupAll test suite", () => {
  it("creates a groupAll", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const groupAll = await getTestGroupAll(table)
    expect(groupAll).toBeDefined()
  })
  it("checks the groupAll reduce", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const groupAll = await getTestGroupAll(table)
    const res = groupAll.reduce([
      { expression: "colA", agg_mode: "min", name: "COL A" }
    ])
    expect(res).toEqual(groupAll)
  })
  it("checks the groupAll value", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const groupAll = await getTestGroupAll(table)

    const resA = await groupAll.value(false, false, false)
    expect(resA).toEqual(5)

    const resB = await groupAll.value(false, true, false)
    expect(resB).toEqual(5)

    const resC = await groupAll.value(false, false, true)
    expect(resC).toEqual(5)

    const resD = await groupAll.value(true, true, false)
    expect(resD).toEqual(5)

    const resE = await groupAll.value(true, false, true)
    expect(resE).toEqual(5)

    const resF = await groupAll.value(false, true, true)
    expect(resF).toEqual(5)

    const resG = await groupAll.value(true, true, true)
    expect(resG).toEqual(5)

    resetStore()
  })
  it("checks the groupAll valueAsync", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const groupAll = await getTestGroupAll(table)

    const resA = await groupAll.valueAsync(false, false, false)
    expect(resA).toEqual(5)

    const resB = await groupAll.valueAsync(false, true, false)
    expect(resB).toEqual(5)

    const resC = await groupAll.valueAsync(false, false, true)
    expect(resC).toEqual(5)

    const resD = await groupAll.valueAsync(true, true, false)
    expect(resD).toEqual(5)

    const resE = await groupAll.valueAsync(true, false, true)
    expect(resE).toEqual(5)

    const resF = await groupAll.valueAsync(false, true, true)
    expect(resF).toEqual(5)

    const resG = await groupAll.valueAsync(true, true, true)
    expect(resG).toEqual(5)

    resetStore()
  })
  it("checks the groupAll valuesAsync", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const groupAll = await getTestGroupAll(table)

    groupAll.reduce([{ expression: "colA", agg_mode: "min", name: "COLA" }])

    const resA = await groupAll.valuesAsync(false, false)
    expect(resA).toEqual({ COLA: 1 })

    const resB = await groupAll.valuesAsync(false, true)
    expect(resB).toEqual({ COLA: 1 })

    const resC = await groupAll.valuesAsync(true, false)
    expect(resC).toEqual({ COLA: 0 })

    const resD = await groupAll.valuesAsync(true, true)
    expect(resD).toEqual({ COLA: 0 })

    resetStore()
  })
})
