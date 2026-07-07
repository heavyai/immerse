// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getPopulatedMockStore, mockVariables } from "../parameter-mock-store"

import {
  NOTE_PARAMETER_USAGE,
  CLEAR_PARAMETER_USAGE,
  REMOVE_CHART_FROM_PARAMETER_USAGE
} from "../constants"

import {
  noteParameterUsage,
  clearParameterUsage,
  removeChartFromParameterUsage,
  didUsageChangeForChartId
} from "./parameter-usage-action-creators"

const { selectedTabId } = mockVariables

describe("parameter usage action creators suite", () => {
  it("can noteParameterUsage w/tabId", async () => {
    const testUsage = {
      token: "test-token",
      chartId: 3,
      parameters: ["a", "b", "c"],
      tabId: "some-tab-id"
    }

    const store = getPopulatedMockStore()
    await store.dispatch(noteParameterUsage(testUsage))
    const actions = store.getActions()

    expect(actions.length).toEqual(1)

    expect(actions[0]).toEqual({
      type: NOTE_PARAMETER_USAGE,
      payload: testUsage
    })
  })

  it("can noteParameterUsage w/o tabId", async () => {
    const testUsage = {
      token: "test-token",
      chartId: 3,
      parameters: ["a", "b", "c"]
    }

    const store = getPopulatedMockStore()
    await store.dispatch(noteParameterUsage(testUsage))
    const actions = store.getActions()

    expect(actions.length).toEqual(1)

    expect(actions[0]).toEqual({
      type: NOTE_PARAMETER_USAGE,
      payload: { ...testUsage, tabId: selectedTabId }
    })
  })

  it("can clearParameterUsage", () => {
    expect(clearParameterUsage()).toEqual({ type: CLEAR_PARAMETER_USAGE })
  })

  it("can removeChartFromParameterUsage", async () => {
    const chartId = 3

    const store = getPopulatedMockStore()
    await store.dispatch(removeChartFromParameterUsage(chartId))
    const actions = store.getActions()

    expect(actions.length).toEqual(1)

    expect(actions[0]).toEqual({
      type: REMOVE_CHART_FROM_PARAMETER_USAGE,
      payload: { chartId, tabId: selectedTabId }
    })
  })

  it("can determine didUsageChangeForChartId when adding", () => {
    const token = "test-token"
    expect(
      didUsageChangeForChartId({
        chartId: "1",
        parameters: ["test1"],
        token,
        currentTabUsage: { test1: { [token]: ["2", "3"] } }
      })
    ).toEqual(true)
  })
  it("can determine didUsageChangeForChartId when existing", () => {
    const token = "test-token"
    expect(
      didUsageChangeForChartId({
        chartId: "1",
        parameters: ["test1"],
        token,
        currentTabUsage: { test1: { [token]: ["2", "3", "1"] } }
      })
    ).toEqual(false)
  })
  it("can determine didUsageChangeForChartId when removing", () => {
    const token = "test-token"
    expect(
      didUsageChangeForChartId({
        chartId: "1",
        parameters: ["test1"],
        token,
        currentTabUsage: { test2: { [token]: ["2", "3", "1"] } }
      })
    ).toEqual(true)
  })
  it("can determine didUsageChangeForChartId with new param", () => {
    const token = "test-token"
    expect(
      didUsageChangeForChartId({
        chartId: "1",
        parameters: ["test3"],
        token,
        currentTabUsage: { test1: { [token]: ["2", "3", "1"] } }
      })
    ).toEqual(true)
  })
})
