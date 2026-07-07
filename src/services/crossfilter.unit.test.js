// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import CrossFilter from "services/ImmerseCrossFilter"
import { createCrossfilterService } from "./crossfilter"

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

describe("Crossfilter Service", () => {
  const manager = createCrossfilterService()

  const mockConnector = {
    getFieldsAsync: jest.fn(() => Promise.resolve({ columns: [] })),
    query: jest.fn((stmt, opt, callback) => {
      callback(null, [{}])
    }),
    queryAsync: jest.fn(() => Promise.resolve([{}]))
  }

  beforeEach(() => {
    const store = mockStore(filterState)
    saveStore()
    setStore(store)
  })

  afterEach(() => {
    resetStore()
  })

  it("should be able to add instance and get quantitative domain", () => {
    const cf = CrossFilter.crossfilter(mockConnector, "table")

    return cf.getFieldsAsync().then(() => {
      manager.setCrossfilter("table", cf)
      return manager
        .getCrossfilter("table")
        .getDomain({ type: "INT", value: "column" })
        .then((a) => {
          expect(Array.isArray(a)).toEqual(true)
        })
    })
  })

  it("should be able to add instance and get ordinal domain", () => {
    return manager
      .getCrossfilter("table")
      .getDomain({ type: "STR", value: "column" })
      .then((a) => {
        expect(Array.isArray(a)).toEqual(true)
      })
  })

  it("should be able to remove instances", () => {
    manager.removeCrossfilter("table")
    expect(manager.getCrossfilter("table")).toEqual(null)
  })
})
