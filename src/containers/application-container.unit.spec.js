// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"

import AppContainer from "./application-container"

// Mock the store since AppContainer imports it directly
jest.mock("store/importableStore", () => ({
  importableStore: {
    dispatch: jest.fn(),
    getState: jest.fn(() => ({
      connection: {},
      router: {}
    }))
  }
}))

// Mock child components to avoid rendering complex dependencies
jest.mock("components/app-overlay/app-overlay", () => () => null)
jest.mock("components/navigation-bar/navigation-bar-container", () => () => null)
jest.mock("components/global-side-nav/GlobalSideNav", () => ({
  __esModule: true,
  default: () => null,
  PIN_GLOBAL_SIDE_NAV_CACHE_KEY: "PIN_GLOBAL_SIDE_NAV"
}))
jest.mock("components/mock-connector", () => () => null)
jest.mock("@rmwc/snackbar", () => ({
  SnackbarQueue: () => null
}))
jest.mock("services/snackbar", () => ({
  snackbarMessages: []
}))

describe("Application Container", () => {
  describe("constructor", () => {
    it("should construct application container", () => {
      // Render with Router wrapper since AppContainer uses withRouter
      const { container } = render(
        <BrowserRouter>
          <AppContainer>
            <div>required child</div>
          </AppContainer>
        </BrowserRouter>
      )

      // Check that the component rendered
      // Note: Initially it renders empty until initialized state is true
      expect(container).toBeInTheDocument()
    })
  })
})
