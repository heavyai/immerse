// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { populateImportableStore as setStore } from "store/importableStore"
import crossfilterExtractor from "./crossfilter-extractor"
import {
  buildDashboardFilterMetadata,
  buildCrossFilterMetadata
} from "vega/constants/filter-metadata-types"
import { simpleFilter } from "vega/constants/filter-types"

const CHART = {
  id: "1",
  type: "pie"
}

const DASHBOARD_FILTER = buildDashboardFilterMetadata(
  "dashboard",
  simpleFilter("table", "table", "field", "INT", "=", 42),
  true
)

const CROSSFILTER = buildCrossFilterMetadata(
  "crossfilter",
  simpleFilter("table", "table", "field", "INT", "=", 21),
  true,
  "2"
)

const opts = {
  tableName: "table",
  chartId: "1",
  LayerId: "layerid",
  layerName: "layername"
}

const copyOpts = {
  ...opts,
  copyToTable: "copyToTable",
  copyFields: { field: "copiedField" }
}

function updateStore(...omnifilters) {
  const state = {
    charts: {
      "1": CHART
    },
    omnifilters
  }
  setStore({
    getState: () => state
  })
}

describe("crossfilterExtractor", () => {
  test("fallback to NULL", () => {
    updateStore()

    const result = crossfilterExtractor({ ...opts })

    expect(result).toBe("NULL")
  })

  test("specified fallback", () => {
    updateStore()

    const result = crossfilterExtractor({ ...opts, fallback: "42" })

    expect(result).toBe("42")
  })

  test("dashboard filter", () => {
    updateStore(DASHBOARD_FILTER)
    const result = crossfilterExtractor({ ...opts })

    expect(result).toBe("(field = 42)")
  })

  test("crossfilter", () => {
    updateStore(CROSSFILTER)

    const result = crossfilterExtractor({ ...opts })

    expect(result).toBe("(field = 21)")
  })

  test("dashboard and crossfilter", () => {
    updateStore(DASHBOARD_FILTER, CROSSFILTER)

    const result = crossfilterExtractor({ ...opts })

    expect(result).toBe("(field = 21 AND field = 42)")
  })

  test("field", () => {
    updateStore(DASHBOARD_FILTER)

    const result = crossfilterExtractor({ ...copyOpts })

    expect(result).toBe("(copiedField = 42)")
  })
})
