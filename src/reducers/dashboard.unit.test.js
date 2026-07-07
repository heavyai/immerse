// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import dashboardReducer, { initialState } from "reducers/dashboard"
import * as actions from "actions/dashboard-action-creators"
import { DELETE_CHART } from "constants/action-types"

describe("dashboard reducer", () => {
  it("should return initial state", () => {
    expect(dashboardReducer(undefined, "")).toEqual(initialState)
  })

  describe("action type SET_CURRENT_DATASOURCE", () => {
    it("should set correct current datasource", () => {
      expect(
        dashboardReducer(initialState, actions.setCurrentDataSource("flights"))
          .currentDataSource
      ).toEqual("flights")
    })
  })

  describe("action type SET_DATASOURCES", () => {
    it("should currentDataSource and datasource", () => {
      const state = {
        currentDataSource: "tweets",
        dataSources: {
          tweets: {}
        }
      }

      expect(
        dashboardReducer(
          state,
          actions.setDataSources({
            currentDataSource: "flights",
            dataSources: {
              flights: {}
            }
          })
        )
      ).toEqual({
        currentDataSource: "flights",
        dataSources: {
          flights: {}
        }
      })
    })
  })

  describe("action type DELETE_DATASOURCE", () => {
    it("should remove currentDataSource if its deleted data source", () => {
      const state = {
        currentDataSource: "tweets",
        dataSources: {
          flights: {},
          tweets: {}
        },
        table: "tweets"
      }

      expect(
        dashboardReducer(state, actions.deleteDataSource("tweets"))
      ).toEqual({
        currentDataSource: "flights",
        dataSources: {
          flights: {}
        },
        table: "flights"
      })
    })

    it("should remove data source", () => {
      const state = {
        currentDataSource: "tweets",
        dataSources: {
          flights: {},
          tweets: {}
        },
        table: "tweets"
      }

      expect(
        dashboardReducer(state, actions.deleteDataSource("flights"))
      ).toEqual({
        currentDataSource: "tweets",
        dataSources: {
          tweets: {}
        },
        table: "tweets"
      })
    })
  })

  describe("SET_CURRENT_DATASOURCE", () => {
    it("should set currentDataSource", () => {
      const state = {
        currentDataSource: "tweets",
        dataSources: {
          flights: {},
          tweets: {}
        }
      }

      expect(
        dashboardReducer(state, actions.setCurrentDataSource("flights"))
      ).toEqual({
        currentDataSource: "flights",
        dataSources: {
          flights: {},
          tweets: {}
        }
      })
    })
  })

  describe("action type DELETE_CHART", () => {
    it("should remove the specified chart from the chartContainers array", () => {
      const state = {
        title: null,
        chartContainers: [{ id: "1" }, { id: "2" }],
        columnMetadata: null,
        table: "flights",
        filtersId: []
      }

      const nextState = dashboardReducer(state, {
        type: DELETE_CHART,
        chartId: "2"
      })
      expect(nextState.chartContainers).toEqual([{ id: "1" }])
    })
  })

  describe("action type INITIALIZE_DASHBOARD", () => {
    const state = {
      table: null,
      columnMetadata: null,
      dataSources: {}
    }

    const table = "flights"

    const columns = {
      test: {
        column: "test",
        type: "STR",
        is_dict: true
      },
      example: {
        column: "example",
        type: "FLOAT",
        is_dict: false
      }
    }

    const action = actions.setColumnMetadata(table, columns)
    const nextState = dashboardReducer(state, action)

    it("should update the table property with the given name", () => {
      expect(nextState.table).toEqual(table)
    })
    it("should add value and label props to each column and maks columns to an array", () => {
      expect(nextState.columnMetadata).toEqual([
        { value: "test", label: "test", type: "STR", is_dict: true },
        { value: "example", label: "example", type: "FLOAT", is_dict: false }
      ])
    })
  })
})
