// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { StrictMode } from "react"
import { createMemoryHistory } from "history"
import { Provider } from "react-redux"
import { createStore, applyMiddleware } from "redux"
import { render, act } from "@testing-library/react"
import {
  NavigationSync,
  createNavigationReducer,
  navigationMiddleware,
  push,
  replace
} from "./navigation"

it("synchronizes pushes, replacement and browser history without leaking a listener across strict replay", () => {
  const history = createMemoryHistory({ initialEntries: ["/dashboard"] })
  const store = createStore(
    createNavigationReducer(history),
    applyMiddleware(navigationMiddleware(history))
  )
  const { unmount } = render(
    <StrictMode>
      <Provider store={store}>
        <NavigationSync history={history}>
          <div />
        </NavigationSync>
      </Provider>
    </StrictMode>
  )
  act(() => {
    store.dispatch(push("/dashboard/1?tab=two"))
  })
  expect(store.getState().location.pathname).toBe("/dashboard/1")
  expect(store.getState().location.search).toBe("?tab=two")
  act(() => {
    store.dispatch(replace("/dashboard/2"))
  })
  expect(history.entries).toHaveLength(2)
  act(() => {
    history.goBack()
  })
  expect(store.getState().location.pathname).toBe("/dashboard")
  unmount()
  history.push("/after-unmount")
  expect(store.getState().location.pathname).toBe("/dashboard")
})
