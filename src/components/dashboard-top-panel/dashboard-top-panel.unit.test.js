// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { fireEvent } from "@testing-library/react"
import { renderWithRedux } from "utils/test-helpers/render-with-redux"

import { RightWrapper } from "./dashboard-top-panel"

import { mapNumFilters, mapNumFilterValues } from "./dashboard-top-panel-parent"
import { FILTER_TYPE_SIMPLE } from "vega/constants/filter-type-constants"

// Mock child components to isolate RightWrapper (similar to shallow rendering)
jest.mock("components/account-panel/account-panel-parent", () => ({
  __esModule: true,
  default: () => <div data-testid="account-panel" />
}))

jest.mock("components/dashboard-top-panel/dashboard-kebab", () => ({
  __esModule: true,
  default: () => <div data-testid="dashboard-kebab" />
}))

jest.mock("components/share-link/share-link-parent", () => ({
  __esModule: true,
  default: () => <div data-testid="share-link" />
}))

jest.mock("hooks/useChartsCount", () => ({
  __esModule: true,
  default: jest.fn(() => 0)
}))

// Mock feature flags to control which components render
jest.mock("components/control-panel/featureflags", () => ({
  getFeatureFlag: jest.fn(() => false),
  available_feature_flags: {
    ENABLE_ANNOTATIONS: "ENABLE_ANNOTATIONS",
    ENABLE_AUTO_DASHBOARD_REFRESH: "ENABLE_AUTO_DASHBOARD_REFRESH",
    GLOBAL_SIDE_NAV: "GLOBAL_SIDE_NAV",
    LIMIT_CHARTS_PER_DASHBOARD: "LIMIT_CHARTS_PER_DASHBOARD",
    ENABLE_DASHBOARD_IMAGE_EXPORT: "ENABLE_DASHBOARD_IMAGE_EXPORT",
    KIOSK_MODE: "KIOSK_MODE"
  }
}))

// Mock ImmerseUIProvider to render children without restrictions
jest.mock("services/immerse-ui-provider", () => ({
  ImmerseUIRequired: ({ children }) => <>{children}</>,
  IMMERSE_UI_HEADERBAR: "IMMERSE_UI_HEADERBAR",
  IMMERSE_UI_FILTER_SETS: "IMMERSE_UI_FILTER_SETS",
  IMMERSE_UI_ANNOTATION: "IMMERSE_UI_ANNOTATION",
  IMMERSE_UI_SAVE: "IMMERSE_UI_SAVE",
  IMMERSE_UI_REFRESH: "IMMERSE_UI_REFRESH",
  IMMERSE_UI_ADD_CHART: "IMMERSE_UI_ADD_CHART",
  REMOVE_BY_NO_DISPLAY: "REMOVE_BY_NO_DISPLAY",
  IMMERSE_UI_USER_DROPDOWN: "IMMERSE_UI_USER_DROPDOWN"
}))

// Mock user utility
jest.mock("utils/user", () => ({
  isUserExportDisabled: jest.fn(() => false)
}))

describe("DashboardTopPanel ", () => {
  const saveState = {
    request: false,
    error: false,
    isSaved: false,
    lastState: null
  }

  const omnifilters = [
    {
      appliesTo: "GLOBAL",
      name: "_filter_name",
      enabled: true,
      dataSources: ["table"],
      filter: {
        filterType: FILTER_TYPE_SIMPLE,
        dataExpression: "column",
        dataSource: "table",
        dataType: "STR",
        operator: "=",
        value: "VALUE"
      }
    }
  ]

  const props = {
    dataSources: [],
    omnifilters,
    numFilters: 1,
    dashboardTitle: "Test Title",
    privileges: {
      deleteDashboard: true,
      viewDashboard: true,
      editDashboard: true
    },
    saveState,
    isFilterPanelShown: false,
    clearAllFilters: () => {},
    clearAllInputFilters: () => {},
    clearChartFilters: () => {},
    hideClearFiltersDropDown: () => {},
    numChartFilters: 0,
    numInputFilters: 0,

    // RightWrapper props
    addNewChart: () => {},
    copyDashboard: () => {},
    isDemo: false,
    isOwner: false,
    streamingInterval: 0,
    setStreamingInterval: () => {}
  }

  describe("save dashboard button", () => {
    it("should invoke saveDashboard when clicked", () => {
      const saveDashboard = jest.fn()
      const setDashboardTitleValid = jest.fn()
      const { container } = renderWithRedux(
        <RightWrapper
          {...props}
          saveDashboard={saveDashboard}
          setDashboardTitleValid={setDashboardTitleValid}
        />
      )

      const saveButton = container.querySelector(".save")
      fireEvent.click(saveButton)
      expect(saveDashboard).toHaveBeenCalled()
    })
  })

  describe("add chart button", () => {
    it("should invoke addChart when clicked", () => {
      const addNewChart = jest.fn()
      const saveDashboard = jest.fn()
      const { container } = renderWithRedux(
        <RightWrapper
          {...props}
          addNewChart={addNewChart}
          saveDashboard={saveDashboard}
        />
      )

      const addChartButton = container.querySelector(".add-chart")
      fireEvent.click(addChartButton)
      expect(addNewChart).toHaveBeenCalled()
    })
  })

  // Pure utility function tests don't need component rendering
  describe("mapNumFilterValues", () => {
    it("should ignore filters with errors", () => {
      const filters = [
        {
          value: "amount",
          operator: ">",
          operand: "0",
          type: "INT",
          is_dict: false
        },
        {
          value: "amount",
          operator: "<",
          operand: "3000",
          type: "INT",
          is_dict: false
        },
        {
          loading: false,
          error: true,
          value: "BAD",
          operator: null,
          operand: null,
          type: "INT",
          is_dict: false
        }
      ]
      expect(mapNumFilterValues(filters)).toEqual(2)
    })

    it("should ignore filters with missing values", () => {
      const filters = [
        {
          value: "amount",
          operator: ">",
          operand: "0",
          type: "INT",
          is_dict: false
        },
        {
          value: "amount",
          operator: "<",
          operand: "3000",
          type: "INT",
          is_dict: false
        },
        {
          loading: false,
          error: false,
          value: "amount",
          operator: "=",
          operand: null,
          type: "INT",
          is_dict: false
        }
      ]
      expect(mapNumFilterValues(filters)).toEqual(2)
    })
  })

  describe("mapNumFilters function", () => {
    it("should return the total number of filters for all charts", () => {
      const charts = {
        1: {
          filters: [1, 3]
        },
        2: {
          filters: [1, 3, 5]
        }
      }

      expect(mapNumFilters(charts)).toEqual(5)
    })

    it("should count arrays as one filter", () => {
      const charts = {
        1: {
          filters: [
            [1, 3],
            [2, 5]
          ]
        },
        2: {
          filters: [1, 3, 5]
        }
      }

      expect(mapNumFilters(charts)).toEqual(5)
    })
  })
})
