// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { filterState } from "./ImmerseCrossFilter/test-utils"
import {
  populateImportableStore as setStore,
  saveStore,
  resetStore
} from "store/importableStore"

const middlewares = [thunk]

const mockStore = configureStore(middlewares)

import createGroupAll from "./groupall"

describe("createGroupAll", () => {
  const connector = {
    queryAsync: jest.fn(() => Promise.resolve([{ val: 1000 }]))
  }

  const crossfilter = {
    getId: () => 1,
    getFilterString: () => "amount = 100",
    getGlobalFilterString: () => "party = 'D'",
    getTables: () => ["contribs"],
    sharedCrossFilter: {
      cache: connector
    },
    queryAsync: connector.queryAsync,
    getDataSource: () => "contribs"
  }

  const groupAll = createGroupAll(connector, crossfilter)

  it("should have a valueAsync that queries total num records", async () => {
    const store = mockStore(filterState)
    saveStore()
    setStore(store)
    await groupAll.valueAsync()
    expect(connector.queryAsync).toHaveBeenCalledWith(
      "SELECT COUNT(*) AS val FROM contribs WHERE amount = 100 AND party = 'D'",
      {
        columnarResults: true,
        eliminateNullRows: false,
        queryId: null,
        renderSpec: null,
        logValues: {
          chartId: "contribs",
          dashboardId: "1"
        }
      },
      "count"
    )
    resetStore()
  })
})
