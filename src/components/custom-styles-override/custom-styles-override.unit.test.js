// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render } from "@testing-library/react"
import { Provider } from "react-redux"

import CustomStylesOverride from "./custom-styles-override"

describe("CustomStylesOverride", () => {
  const state = {
    connection: {
      user: {
        customStyles: {}
      }
    },
    userConfigurableUI: {
      serversJSONColors: {},
      savedDatabaseStyles: {},
      previewStyles: {},
      themeTint: { hsl: { h: 200, s: 0 } }
    }
  }

  const createStore = () => ({
    getState: () => state,
    subscribe: () => {},
    dispatch: () => {}
  })

  it("should mount css var definitions when custom styles are provided", () => {
    state.connection.user.customStyles = {
      buttonPrimaryColor: "red"
    }

    const store = createStore()
    const { container } = render(
      <Provider store={store}>
        <CustomStylesOverride />
      </Provider>
    )

    const styleEl = container.querySelector("#servers-json-styles")
    expect(styleEl.textContent).toContain(
      state.connection.user.customStyles.buttonPrimaryColor
    )
  })
})
