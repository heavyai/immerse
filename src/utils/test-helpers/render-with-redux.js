// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render } from "@testing-library/react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import mockAppState from "./mock-app-state"

const mockStore = configureStore([])

/**
 * Render a component with Redux Provider for Testing Library tests
 *
 * @param {React.ReactElement} component - Component to render
 * @param {Object} initialState - Initial Redux state (defaults to mockAppState)
 * @param {Array} middlewares - Optional Redux middlewares
 * @returns {Object} - Testing Library render result plus store
 *
 * @example
 * const { getByText, store } = renderWithRedux(<MyComponent />, { charts: {} })
 */
export function renderWithRedux(
  component,
  initialState = mockAppState,
  middlewares = []
) {
  const store =
    middlewares.length > 0
      ? configureStore(middlewares)(initialState)
      : mockStore(initialState)

  const renderResult = render(<Provider store={store}>{component}</Provider>)

  return {
    ...renderResult,
    store
  }
}

export default renderWithRedux
