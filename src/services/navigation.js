// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useContext, useLayoutEffect } from "react"
import { ReactReduxContext } from "react-redux"
import { Router } from "react-router-dom"

const REQUESTED = "navigation/REQUESTED"
const CHANGED = "navigation/CHANGED"
const request = (method, args) => ({
  type: REQUESTED,
  payload: { method, args }
})
export const push = (...args) => request("push", args)
export const replace = (...args) => request("replace", args)

export function createNavigationReducer(history) {
  const initialState = { location: history.location, action: history.action }
  return (state = initialState, action) =>
    action.type === CHANGED ? action.payload : state
}
export function navigationMiddleware(history) {
  return () => (next) => (action) => {
    if (action.type === REQUESTED) {
      const { method, args } = action.payload
      return history[method](...args)
    }
    return next(action)
  }
}
export function NavigationSync({ history, children }) {
  const store = useContext(ReactReduxContext)?.store
  useLayoutEffect(() => {
    if (!store) {
      return undefined
    }
    const update = (location, action) =>
      store.dispatch({ type: CHANGED, payload: { location, action } })
    update(history.location, history.action)
    return history.listen(update)
  }, [history, store])
  return <Router history={history}>{children}</Router>
}
