// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { boundingBoxEnabledFilterString } from "./ImmerseCrossFilterBoundingBox"

import { getTestCrossFilter, filterState } from "./test-utils"
import { populateImportableStore as setStore } from "store/importableStore"

const middlewares = [thunk]

const mockStore = configureStore(middlewares)

const dataSource = "test_table"
const tables = [dataSource]

/* export function boundingBoxEnabledFilterString({
  newFilterString,
  chartId,
  newCrossFilter,
  layerName
}) {*/

function resetStore() {
  setStore(null)
}

describe("ImmerseCrossFilterBoundingBox test suite", () => {
  it("creates a bounding box enabled filter string on a non-layered chart", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const crossfilter = await getTestCrossFilter(dataSource, tables, "1")

    const boundingBoxString = boundingBoxEnabledFilterString({
      newFilterString: "",
      chartId: "1",
      newCrossFilter: crossfilter
    })

    expect(boundingBoxString).toEqual("")

    resetStore()
  })

  it("returns a created filter string on a non-layered chart", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const crossfilter = await getTestCrossFilter(dataSource, tables, "1")

    const boundingBoxString = boundingBoxEnabledFilterString({
      newFilterString: "colA = '1'",
      chartId: "1",
      newCrossFilter: crossfilter
    })

    expect(boundingBoxString).toEqual("colA = '1'")

    resetStore()
  })

  it("returns a created filter string on a layered chart", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const crossfilter = await getTestCrossFilter(dataSource, tables, "3")

    const boundingBoxString = boundingBoxEnabledFilterString({
      newFilterString: "colA = '1'",
      chartId: "3",
      newCrossFilter: crossfilter,
      layerName: "pointmapLayer0"
    })

    expect(boundingBoxString).toEqual("colA = '1'")

    resetStore()
  })

  it("returns a bbox string for an empty filter on a layered chart", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const crossfilter = await getTestCrossFilter(
      "test_pointmap_table_1",
      "test_pointmap_table_1",
      "3"
    )

    const boundingBoxString = boundingBoxEnabledFilterString({
      newFilterString: "",
      chartId: "3",
      newCrossFilter: crossfilter,
      layerName: "pointmapLayer0"
    })

    expect(boundingBoxString).toEqual(`(lonA is not null
          AND latA is not null
          AND lonA >= -75 AND lonA <= 75 AND latA >= -31 AND latA <= 70)`)

    resetStore()
  })

  it("returns a bbox string for an empty filter on a layered chart", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const crossfilter = await getTestCrossFilter(
      "test_pointmap_table_2",
      "test_pointmap_table_2",
      "3"
    )

    const boundingBoxString = boundingBoxEnabledFilterString({
      newFilterString: "",
      chartId: "3",
      newCrossFilter: crossfilter,
      layerName: "pointmapLayer1"
    })

    expect(boundingBoxString).toEqual(`(lonB is not null
          AND latB is not null
          AND lonB >= -75 AND lonB <= 75 AND latB >= -31 AND latB <= 70)`)

    resetStore()
  })

  it("returns an empty string for an empty filter on a layered chart w/o layerName", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const crossfilter = await getTestCrossFilter(
      "test_pointmap_table_2",
      "test_pointmap_table_2",
      "3"
    )

    const boundingBoxString = boundingBoxEnabledFilterString({
      newFilterString: "",
      chartId: "3",
      newCrossFilter: crossfilter
    })

    expect(boundingBoxString).toEqual("")

    resetStore()
  })

  it("returns a pre-existing string for a non-empty filter on a scatter chart", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const crossfilter = await getTestCrossFilter(
      "test_scatter_table",
      "test_scatter_table",
      "5"
    )

    const boundingBoxString = boundingBoxEnabledFilterString({
      newFilterString: "x = 7",
      chartId: "5",
      newCrossFilter: crossfilter
    })

    expect(boundingBoxString).toEqual("x = 7")

    resetStore()
  })

  it("returns a between bounding box for an empty filter on a scatter chart", async () => {
    const store = mockStore(filterState)
    setStore(store)
    const crossfilter = await getTestCrossFilter(
      "test_scatter_table",
      "test_scatter_table",
      "5"
    )

    const boundingBoxString = boundingBoxEnabledFilterString({
      newFilterString: "",
      chartId: "5",
      newCrossFilter: crossfilter
    })

    expect(boundingBoxString).toEqual(
      "(x BETWEEN 0 AND 5 AND y BETWEEN 3 AND 7)"
    )

    resetStore()
  })
})
