// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { applyMiddleware, createStore } from "redux"
import promiseActions from "./promise-action-middleware"
function setup() {
  const actions = []
  const store = createStore((state = {}, action) => {
    actions.push(action)
    return state
  }, applyMiddleware(promiseActions()))
  actions.length = 0
  return { store, actions }
}
it("publishes optimistic pending data then a fulfilled action and preserves the dispatch result", async () => {
  const { store, actions } = setup()
  const result = await store.dispatch({
    type: "SHARE",
    payload: { promise: Promise.resolve(42), data: "pending" },
    meta: { id: 1 }
  })
  expect(actions).toEqual([
    { type: "SHARE_PENDING", payload: "pending", meta: { id: 1 } },
    { type: "SHARE_FULFILLED", payload: 42, meta: { id: 1 } }
  ])
  expect(result).toEqual({ value: 42, action: actions[1] })
})
it("propagates rejection and handles plain function payloads without creating fake async actions", async () => {
  const { store, actions } = setup()
  const reason = new Error("backend failure")
  await expect(
    store.dispatch({ type: "SAVE", payload: Promise.reject(reason) })
  ).rejects.toBe(reason)
  expect(actions).toEqual([
    { type: "SAVE_PENDING" },
    { type: "SAVE_REJECTED", error: true, payload: reason }
  ])
  expect(store.dispatch({ type: "VALUE", payload: () => 7 })).toEqual({
    type: "VALUE",
    payload: 7
  })
})
it("supports lazy async payloads and omits null success payloads", async () => {
  const { store, actions } = setup()
  await expect(
    store.dispatch({ type: "LOAD", payload: async () => undefined })
  ).resolves.toEqual({ value: null, action: { type: "LOAD_FULFILLED" } })
  expect(actions).toEqual([
    { type: "LOAD_PENDING" },
    { type: "LOAD_FULFILLED" }
  ])
})
