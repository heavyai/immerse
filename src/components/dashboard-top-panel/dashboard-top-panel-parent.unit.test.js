// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, fireEvent } from "@testing-library/react"
import { Provider } from "react-redux"
import { Router } from "react-router-dom"
import { createMemoryHistory } from "history"

jest.mock("components/multi-count/multi-count", () => {
  return function MultiCountMock() {
    return null
  }
})

jest.mock("components/database-switcher/database-switcher", () => {
  return function DatabaseSwitcherMock() {
    return null
  }
})

jest.mock("components/account-panel/account-panel-parent", () => {
  return function AccountPanelParentMock() {
    return null
  }
})

import DashboardTopPanelParent from "./dashboard-top-panel-parent"
import { updateDashboardSaveState } from "actions/dashboard-save-state-action-creators"
import mockState from "utils/test-helpers/mock-app-state"
import { DASHBOARD_TITLE_PLACEHOLDER_ID } from "constants/dashboards"

const MOCK_SAVE_DASHBOARD_ACTION_TYPE = "SAVE"

jest.mock("actions/dashboard-action-creators", () => ({
  ...jest.requireActual("actions/dashboard-action-creators"),
  saveDashboard: () => MOCK_SAVE_DASHBOARD_ACTION_TYPE
}))

function createStore(state = mockState, dispatchImpl) {
  const dispatch = dispatchImpl || jest.fn()
  return {
    getState: () => state,
    dispatch,
    subscribe: jest.fn(() => jest.fn())
  }
}

function renderWithProviders(ui, { state = mockState, dispatch } = {}) {
  const store = createStore(state, dispatch)
  const history = createMemoryHistory({ initialEntries: ["/dashboard/1"] })

  const renderResult = render(
    <Provider store={store}>
      <Router history={history}>{ui}</Router>
    </Provider>
  )

  return {
    ...renderResult,
    store,
    history
  }
}

function setup(state = mockState, dispatch) {
  return renderWithProviders(
    <DashboardTopPanelParent
      id="top-panel"
      prevPath={"/"}
      location={{
        pathname: "/dashboard/1"
      }}
      showAdvancedFilterControls
      saveState={{ request: false, error: true, isSaved: false }}
    />,
    { state, dispatch }
  )
}

describe("DashboardTopPanelParent", () => {
  describe("Dashboard Title", () => {
    it("should be updated on input change", () => {
      const value = "TEST"
      const { getByTestId, container } = setup()

      const placeholder = getByTestId(DASHBOARD_TITLE_PLACEHOLDER_ID)
      fireEvent.click(placeholder)

      const input = container.querySelector("input")
      fireEvent.change(input, { target: { value } })

      expect(input && input.value).toBe(value)
    })

    it("should call onBlur if form is submitted", () => {
      const { getByTestId, container } = setup()

      const placeholder = getByTestId(DASHBOARD_TITLE_PLACEHOLDER_ID)
      fireEvent.click(placeholder)

      const input = container.querySelector("input")
      // guard for type
      if (!input) {
        throw new Error("Input not found")
      }
      input.blur = jest.fn()

      const form = container.querySelector("form")
      fireEvent.submit(form)

      expect(input.blur).toHaveBeenCalled()
    })

    it("should not dispatch title update if invalid", () => {
      const value = ""
      const { getByTestId, container } = setup()

      const placeholder = getByTestId(DASHBOARD_TITLE_PLACEHOLDER_ID)
      fireEvent.click(placeholder)

      const input = container.querySelector("input")
      fireEvent.change(input, { target: { value } })

      const form = container.querySelector("form")
      fireEvent.submit(form)

      const errorWrapper = container.querySelector(
        ".input-with-placeholder.error"
      )
      expect(errorWrapper).not.toBeNull()
    })

    it("should not dispatch dashboard save state update if title has not changed", () => {
      const value = "Political Donations"
      const dispatch = jest.fn()
      const { getByTestId, container } = setup(mockState, dispatch)

      const placeholder = getByTestId(DASHBOARD_TITLE_PLACEHOLDER_ID)
      fireEvent.click(placeholder)

      const input = container.querySelector("input")
      fireEvent.change(input, { target: { value } })

      const form = container.querySelector("form")
      fireEvent.submit(form)

      expect(dispatch).not.toHaveBeenCalledWith(updateDashboardSaveState())
    })
  })

  describe("Saving Dashboard", () => {
    it("should trigger save dashboard when save button is clicked (even if title is empty)", () => {
      const dispatch = jest.fn()
      const { getByTestId, container } = setup(mockState, dispatch)

      dispatch.mockClear()

      const placeholder = getByTestId(DASHBOARD_TITLE_PLACEHOLDER_ID)
      fireEvent.click(placeholder)

      const input = container.querySelector("input")
      fireEvent.change(input, { target: { value: "" } })

      const saveButton = container.querySelector(".save")
      fireEvent.click(saveButton)

      expect(dispatch).toHaveBeenCalledWith(MOCK_SAVE_DASHBOARD_ACTION_TYPE)
    })
  })
})
