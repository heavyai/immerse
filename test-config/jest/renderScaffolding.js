// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render } from "@testing-library/react"
import { Provider } from "react-redux"
import { ConnectedRouter, routerMiddleware } from "connected-react-router"
import { createBrowserHistory } from "history"
import { applyMiddleware, createStore, combineReducers } from "redux"
import thunk from "redux-thunk"
import reducers from "./jest-reducers"
import { renderHook } from "@testing-library/react-hooks"

const history = createBrowserHistory()

export function renderWithRedux(ui, store, initialState = {}) {
  const middlewares = [thunk, routerMiddleware(history)]
  const simpleStore =
    store ||
    createStore(
      combineReducers(reducers),
      initialState,
      applyMiddleware(...middlewares)
    )
  return {
    ...render(<Provider store={simpleStore}>{ui}</Provider>),
    // adding `store` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    store: simpleStore
  }
}

export function renderHookWithStore(hook, { store, initialState = {} }) {
  const middlewares = [thunk, routerMiddleware(history)]
  const simpleStore =
    store ||
    createStore(
      combineReducers(reducers),
      initialState,
      applyMiddleware(...middlewares)
    )
  const hookResult = renderHook(hook, {
    // eslint-disable-next-line react/display-name
    wrapper: ({ children }) => (
      <Provider store={simpleStore}>{children}</Provider>
    )
  })
  return {
    ...hookResult,
    store: simpleStore
  }
}

export function renderWithRouter(ui, routerHistory = history) {
  return {
    ...render(<ConnectedRouter history={routerHistory}>{ui}</ConnectedRouter>),
    // adding `history` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    routerHistory
  }
}
