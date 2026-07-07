// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import MeasureSelectorsPopover from "./measure-selectors-popover"
import renderWithRedux from "utils/test-helpers/render-with-redux"

describe("MeasureSelectorsPopover Component", () => {
  const props = {
    measure: {
      label: "test"
    },
    onValueChange: () => true,
    onOpenChange: () => true,
    addCustomMeasure: () => {},
    addCustomPostFilter: () => {},
    chartId: "0",
    closeCustomSelector: () => {},
    index: 0,
    isDropdownOpen: false,
    options: [{ label: "test-label", value: "test-value" }],
    shouldShowAggTypeSelector: false,
    stopEditingSelector: () => {}
  }

  const renderPopover = (overrideProps = {}) =>
    renderWithRedux(<MeasureSelectorsPopover {...props} {...overrideProps} />)

  it("should render SelectorDropdown with the correct props", () => {
    const { container } = renderPopover()
    const autocomplete = container.querySelector(
      '[data-testid="selector-dropdown-autocomplete"]'
    )

    expect(autocomplete).not.toBeNull()
  })

  it("should show loading box", () => {
    const { container } = renderPopover({ loading: true })
    expect(container.querySelectorAll(".selector-loading")).toHaveLength(1)
  })
})
