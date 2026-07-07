// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render } from "@testing-library/react"
import { Provider } from "react-redux"

jest.mock("components/selector-dropdown/selector-dropdown", () => {
  return function MockSelectorDropdown() {
    return <div className="selector-dropdown" />
  }
})

jest.mock(
  "components/dimension-bin-settings/dimension-bin-settings-parent",
  () =>
    function MockDimensionBinSettingsParent() {
      return <div className="dimension-bin-settings-mock" />
    }
)

jest.mock(
  "components/dimension-time-bin-settings/dimension-time-bin-settings",
  () =>
    function MockDimensionTimeBinSettings() {
      return <div className="dimension-time-bin-settings-mock" />
    }
)

// eslint-disable-next-line @typescript-eslint/no-var-requires
const DimensionSelectorsPopover = require("./dimension-selectors-popover")
  .default

describe("DimensionSelectorsPopover Component", () => {
  const baseProps = {
    dimension: {
      label: "test"
    },
    onValueChange: () => true,
    showDropDown: true,
    options: [{ label: "test" }],
    addCustomDimension: () => {},
    chartId: "0",
    chartType: "text",
    closeCustomSelector: () => {},
    index: 0,
    isDropdownOpen: false,
    onOpenChange: () => {},
    showBinSettings: false,
    showCustomInput: false,
    showCustomSQLSelector: () => {},
    showTimeBinSettings: false,
    submitCustomDimension: () => {},
    updateBinInterval: () => {},
    updateExtractInterval: () => {},
    stopEditingSelector: () => {}
  }

  const createStore = () => ({
    getState: () => ({
      connection: {
        isSuperuser: false
      },
      charts: {
        "0": {
          dimensions: []
        }
      }
    }),
    dispatch: jest.fn(),
    subscribe: jest.fn()
  })

  const renderPopover = (overrideProps = {}) => {
    const store = createStore()
    return render(
      <Provider store={store}>
        <DimensionSelectorsPopover {...baseProps} {...overrideProps} />
      </Provider>
    )
  }

  it("should render SelectorDropdown markup when showDropDown is true", () => {
    const { container } = renderPopover()
    const popoverWrapper = container.querySelector(".react-popover")
    expect(popoverWrapper).not.toBeNull()
  })

  it("should render dimensions settings if showBinSettings", () => {
    const { container } = renderPopover({ showBinSettings: true })
    expect(container.querySelector(".measure-settings")).not.toBeNull()
  })

  it("should show loading box", () => {
    const { container } = renderPopover({ loading: true })
    expect(container.querySelector(".selector-loading")).not.toBeNull()
  })
})
