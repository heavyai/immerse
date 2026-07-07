// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"

import RootComponent from "./dashboard-top-panel-title"
import { Provider } from "react-redux"
import store from "store/store"
import {
  DASHBOARD_TITLE_INPUT_ID,
  DASHBOARD_TITLE_PLACEHOLDER_ID
} from "constants/dashboards"

describe("DashboardTopPanelTitle", () => {
  const props = {
    dashboardTitle: "TEST",
    setDashboardTitleValid: jest.fn(),
    updateDashboardNameIfValid: () => {},
    confirmError: () => {},
    updateInput: () => {},
    valid: true,
    validate: () => {},
    value: "",
    onChange: () => {},
    handleUpdateDashboardName: () => {}
  }
  beforeEach(() => {
    render(
      <Provider store={store}>
        <RootComponent {...props} />
      </Provider>
    )
  })
  describe("when valid", () => {
    it("it isn't focused ", () => {
      expect(
        screen.getByTestId(DASHBOARD_TITLE_PLACEHOLDER_ID)
      ).toBeInTheDocument()
    })
    it("must show input ", () => {
      fireEvent.click(screen.getByTestId(DASHBOARD_TITLE_PLACEHOLDER_ID))
      expect(screen.getByTestId(DASHBOARD_TITLE_INPUT_ID)).toBeInTheDocument()
    })
    it("change input ", () => {
      const value = "123"
      fireEvent.click(screen.getByTestId(DASHBOARD_TITLE_PLACEHOLDER_ID))
      fireEvent.change(screen.getByTestId(DASHBOARD_TITLE_INPUT_ID), {
        target: { value }
      })
      expect(screen.getByTestId(DASHBOARD_TITLE_INPUT_ID)).toHaveValue(value)
      expect(props.setDashboardTitleValid).toHaveBeenCalled()
    })
  })
})
