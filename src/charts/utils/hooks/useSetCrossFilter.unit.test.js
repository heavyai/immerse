// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { renderHook } from "@testing-library/react-hooks"

import { useSetCrossFilter } from "./useSetCrossFilter"

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

describe("useSetCrossFilter test suite", () => {
  it("can useSetCrossFilter", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () =>
        useSetCrossFilter({
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
      type: "OMNIFILTERS/SET_CROSSFILTER",
      chartId: "1",
      layerId: undefined,
      name: "1/crossfilter/z1",
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

  it("can useSetCrossFilter w/name", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () =>
        useSetCrossFilter({
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
      type: "OMNIFILTERS/SET_CROSSFILTER",
      chartId: "1",
      layerId: undefined,
      name: "1/new-crossfilter-name/z1",
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
        value: "b"
      }
    })
  })

  it("can useSetCrossFilter w/name and useGeneratedInternalId=false", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () =>
        useSetCrossFilter({
          chartId: "1",
          columns: [
            { table: "t1", dataSource: "t1", type: "STR", value: "col" }
          ],
          name: "another-crossfilter-name",
          useGeneratedInternalId: false
        }),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    result.current("c")

    const actions = store.getActions()

    expect(actions[0]).toEqual({
      type: "UPDATE_DASHBOARD_SAVE_STATE",
      warnUnsaved: false
    })
    expect(actions[1]).toEqual({
      type: "OMNIFILTERS/SET_CROSSFILTER",
      chartId: "1",
      layerId: undefined,
      name: "another-crossfilter-name",
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
        value: "c"
      }
    })
  })

  it("can useSetCrossFilter w/multicolumn", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () =>
        useSetCrossFilter({
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
      type: "OMNIFILTERS/SET_CROSSFILTER",
      chartId: "1",
      layerId: undefined,
      name: "1/crossfilter/z1",
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
