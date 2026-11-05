// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { cloneDeep } from "lodash"
import { buildFilterSql } from "vega/constants/filter-types"
import * as dcActions from "actions/dc-action-creators"
import {
  getFeatureFlag,
  setFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { doRedrawAll } from "services/legacy-dc-filter-adapter"
import { getFilters } from "services/external-messenger-api/api/getFilters"
import {
  registerForFilterNotifications,
  unregisterForFilterNotifications,
  postFilterNotification,
  disableFilterNotifications,
  enableFilterNotifications
} from "services/external-messenger-api/api/registerForFilterNotifications"
import {
  createExternalListeners,
  exposedAPISchema
} from "services/external-messenger-api/ExternalMessenger"
import { populateImportableStore, importableStore } from "store/importableStore"
import mixed from "../../../test-config/modernization/fixtures/mixed-engines.json"

it("preserves filter SQL for numeric comparisons, nulls, and boolean composition", () => {
  const numeric = mixed.omnifilters[0].filter
  expect(buildFilterSql([numeric])).toEqual(["amount > 10"])
  expect(
    buildFilterSql([
      {
        filterType: "OR",
        filters: [
          numeric,
          {
            filterType: "ISNULL",
            dataExpression: "amount",
            dataSource: "fixture_sales",
            dataType: "FLOAT"
          }
        ]
      }
    ])
  ).toEqual(["(amount > 10 OR amount IS NULL)"])
})

it("keeps embed filter responses and notification ordering, suppression and unsubscribe", async () => {
  const previous = importableStore
  const responseHandler = jest.fn()
  const events = []
  const data = { responseKey: "fixture-client" }
  const state = cloneDeep(mixed)
  state.omnifilters.push({
    ...cloneDeep(state.omnifilters[0]),
    appliesTo: "CHART",
    name: "local-only"
  })
  populateImportableStore({ getState: () => state })
  try {
    const initial = registerForFilterNotifications(data, (message) => {
      responseHandler(message)
      events.push(message)
    })
    expect(initial).toEqual({
      type: "filters",
      payload: [mixed.omnifilters[0].filter]
    })
    expect(getFilters()).toEqual(initial)
    await postFilterNotification()
    state.omnifilters = []
    await postFilterNotification()
    expect(events).toEqual([initial, { type: "filters", payload: [] }])
    disableFilterNotifications()
    await postFilterNotification()
    expect(responseHandler).toHaveBeenCalledTimes(2)
    enableFilterNotifications()
    // Unsubscription keys by responseKey for this client.
    expect(unregisterForFilterNotifications(data, responseHandler)).toEqual({
      type: "unregisterForFilterNotificationsResponse"
    })
    await postFilterNotification()
    expect(responseHandler).toHaveBeenCalledTimes(2)
    expect(exposedAPISchema.getFilters).toMatchSnapshot(
      "getFilters published schema"
    )
  } finally {
    unregisterForFilterNotifications(data, responseHandler)
    enableFilterNotifications()
    populateImportableStore(previous)
  }
})

it("redraws only after initial rendering completes and follows enabled source links", async () => {
  const redraw = jest
    .spyOn(dcActions, "redrawAll")
    .mockImplementation((groups) => ({ type: "fixture-redraw", groups }))
  try {
    const dispatch = jest.fn().mockResolvedValue(undefined)
    const state = {
      ...cloneDeep(mixed),
      dc: { initialRender: { done: false } }
    }
    await doRedrawAll(dispatch, () => state, new Set(["fixture_sales"]))
    expect(dispatch).not.toHaveBeenCalled()
    state.dc.initialRender.done = true
    await doRedrawAll(dispatch, () => state, new Set(["fixture_sales"]))
    expect(dispatch).toHaveBeenCalledTimes(1)
    expect(redraw).toHaveBeenCalledWith([
      "fixture_sales",
      "fixture_regions",
      undefined
    ])
    expect(dispatch).toHaveBeenCalledWith({
      type: "fixture-redraw",
      groups: ["fixture_sales", "fixture_regions", undefined]
    })
  } finally {
    redraw.mockRestore()
  }
})

it("embed messages retain responseKey and only reply to an allowed sender origin", async () => {
  const previous = importableStore
  const { EMBEDDED_API_SECURITY } = available_feature_flags
  const security = getFeatureFlag(EMBEDDED_API_SECURITY)
  const listen = jest
    .spyOn(window, "addEventListener")
    .mockImplementation(() => {})
  const postMessage = jest.fn()
  try {
    setFeatureFlag(EMBEDDED_API_SECURITY, true)
    populateImportableStore({ getState: () => cloneDeep(mixed) })
    createExternalListeners(["https://embed.example.invalid"])
    const handler = listen.mock.calls.find(([type]) => type === "message")[1]
    const event = {
      data: { type: "getFilters", responseKey: "fixture-client" },
      source: { postMessage }
    }
    handler({ ...event, origin: "https://unapproved.example.invalid" })
    await Promise.resolve()
    expect(postMessage).not.toHaveBeenCalled()
    handler({ ...event, origin: "https://embed.example.invalid" })
    await Promise.resolve()
    expect(postMessage).toHaveBeenCalledWith(
      {
        type: "filters",
        responseKey: "fixture-client",
        payload: [mixed.omnifilters[0].filter]
      },
      "https://embed.example.invalid"
    )
  } finally {
    listen.mockRestore()
    setFeatureFlag(EMBEDDED_API_SECURITY, security)
    populateImportableStore(previous)
  }
})
