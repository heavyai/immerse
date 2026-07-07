// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { renderHook } from "@testing-library/react-hooks"

import { useSetChartFilter } from "./useSetChartFilter"

import { Provider } from "react-redux"
import mockAppState from "utils/test-helpers/mock-app-state"

const services = new Map()
services.set("dc", {
  redrawAllAsync: () => Promise.resolve(),
  resetRedrawStack: () => {},
  getChart: () => ({})
})

const middlewares = [thunk.withExtraArgument(services)]
const mockStore = configureStore(middlewares)

const TEST_FIELD = "testField"

const mockState = {
  ...mockAppState,
  filterZones: { z1: { id: "z1", selected: true } },
  charts: { 1: { [TEST_FIELD]: true } },
  crossLinks: [],
  dashboard: {
    ...mockAppState.dashboard,
    selectedTabId: "tab1"
  }
}

/* eslint-disable react/display-name */

describe("useSetChartFilter test suite", () => {
  it("can useSetChartFilter", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () =>
        useSetChartFilter({
          chartId: "1",
          columns: [
            { table: "t1", dataSource: "t1", type: "STR", value: "col" }
          ]
        }),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    result.current("a")

    const actions = store.getActions()

    expect(actions[0]).toEqual({
      type: "UPDATE_DASHBOARD_SAVE_STATE",
      warnUnsaved: false
    })
    expect(actions[1]).toEqual({
      type: "OMNIFILTERS/SET_CHART",
      chartId: "1",
      enable: true,
      globalCustom: false,
      sharedCustom: false,
      layerId: undefined,
      name: "1/chartfilter/z1",
      filter: {
        filterType: "SIMPLE",
        dataExpression: "col",
        dataSource: "t1",
        table: "t1",
        dataType: "STR",
        caseSensitive: undefined,
        dataTypeIsArray: false,
        extract: undefined,
        operator: "=",
        value: "a"
      }
    })
  })

  it("can useSetChartFilter w/name", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () =>
        useSetChartFilter({
          chartId: "1",
          columns: [
            { table: "t1", dataSource: "t1", type: "STR", value: "col" }
          ],
          name: "new-crossfilter-name"
        }),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    result.current("b")

    const actions = store.getActions()

    expect(actions[0]).toEqual({
      type: "UPDATE_DASHBOARD_SAVE_STATE",
      warnUnsaved: false
    })
    expect(actions[1]).toEqual({
      type: "OMNIFILTERS/SET_CHART",
      chartId: "1",
      enable: true,
      globalCustom: false,
      sharedCustom: false,
      layerId: undefined,
      name: "1/new-crossfilter-name/z1",
      filter: {
        filterType: "SIMPLE",
        dataExpression: "col",
        dataSource: "t1",
        dataType: "STR",
        table: "t1",
        caseSensitive: undefined,
        dataTypeIsArray: false,
        extract: undefined,
        operator: "=",
        value: "b"
      }
    })
  })

  it("can useSetChartFilter w/multicolumn", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () =>
        useSetChartFilter({
          chartId: "1",
          columns: [
            { table: "t1", dataSource: "t1", type: "STR", value: "col" },
            { table: "t1", dataSource: "t1", type: "STR", value: "col2" }
          ]
        }),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    result.current("a", "b")

    const actions = store.getActions()

    expect(actions[0]).toEqual({
      type: "UPDATE_DASHBOARD_SAVE_STATE",
      warnUnsaved: false
    })
    expect(actions[1]).toEqual({
      type: "OMNIFILTERS/SET_CHART",
      chartId: "1",
      enable: true,
      globalCustom: false,
      sharedCustom: false,
      layerId: undefined,
      name: "1/chartfilter/z1",
      filter: {
        filterType: "AND",
        filters: [
          {
            filterType: "SIMPLE",
            dataExpression: "col",
            dataSource: "t1",
            table: "t1",
            dataType: "STR",
            caseSensitive: undefined,
            dataTypeIsArray: false,
            extract: undefined,
            operator: "=",
            value: "a"
          },
          {
            filterType: "SIMPLE",
            dataExpression: "col2",
            dataSource: "t1",
            table: "t1",
            dataType: "STR",
            caseSensitive: undefined,
            dataTypeIsArray: false,
            extract: undefined,
            operator: "=",
            value: "b"
          }
        ]
      }
    })
  })
})
