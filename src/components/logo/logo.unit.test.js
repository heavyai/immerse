// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render } from "@testing-library/react"
import { Provider } from "react-redux"

import Logo from "./logo"
import { DARK_THEME } from "utils/theme/types"

describe("Logo", () => {
  const state = {
    connection: {
      user: {
        customStyles: {}
      },
      serversJsonPending: true
    },
    userConfigurableUI: {
      uiTheme: undefined
    }
  }

  const store = {
    getState: () => state,
    subscribe: () => {},
    dispatch: () => {}
  }

  it("should display loading text by default", () => {
    const { container, queryByRole } = render(
      <Provider store={store}>
        <Logo />
      </Provider>
    )

    // Check that the loading div exists
    expect(container.querySelector("div.app-logo")).toBeInTheDocument()
    // Check that no image is rendered
    expect(queryByRole("img")).not.toBeInTheDocument()
  })

  it("should mount logo after config loaded", () => {
    state.connection.serversJsonPending = false
    const { getByText, queryByRole } = render(
      <Provider store={store}>
        <Logo />
      </Provider>
    )

    // Check that the text logo exists
    expect(getByText("HeavyAI")).toBeInTheDocument()
    // Check that no image is rendered
    expect(queryByRole("img")).not.toBeInTheDocument()
  })

  it("should mount an image if a logoURL is provided", () => {
    state.connection.serversJsonPending = false
    state.connection.user.customStyles.logoURL = "fooo"
    const { container, getByRole } = render(
      <Provider store={store}>
        <Logo />
      </Provider>
    )
    // Check that an image is rendered
    expect(getByRole("img")).toBeInTheDocument()
    // Check that no SVG logo is rendered
    expect(container.querySelector("svg.app-logo")).not.toBeInTheDocument()
  })

  it("should mount an image for dark theme if a darkThemeLogoURL is provided", () => {
    state.connection.serversJsonPending = false
    delete state.connection.user.customStyles.logoURL
    state.connection.user.customStyles.darkThemeLogoURL = "baaar"
    state.userConfigurableUI.uiTheme = DARK_THEME
    const { container, getByRole } = render(
      <Provider store={store}>
        <Logo />
      </Provider>
    )
    // Check that an image is rendered
    expect(getByRole("img")).toBeInTheDocument()
    // Check that no SVG logo is rendered
    expect(container.querySelector("svg.app-logo")).not.toBeInTheDocument()
  })
})
