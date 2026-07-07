// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render } from "@testing-library/react"

import DimensionBinSettings from "./dimension-bin-settings"

describe("DimensionBinSettings Component", () => {
  const baseProps = {
    dimension: {
      isBinned: true,
      currentLowValue: 0,
      currentHighValue: 100,
      numOfBins: 12,
      min_val: 0,
      max_val: 100
    },
    updateBinRangeSlider: () => {},
    updateBinSlider: () => {},
    updateIsBinned: () => {},
    chartType: "text"
  }

  const renderComponent = (overrideProps = {}) => {
    const props = { ...baseProps, ...overrideProps }
    return render(<DimensionBinSettings {...props} />)
  }

  it("Display Binning Enabled when isBinned is True", () => {
    const { container } = renderComponent()
    const label = container.querySelector(".bin-settings-toggle-label")
    expect(label.textContent).toBe("Binning ON")
  })

  it("Display Binning Disabled when isBinned is False", () => {
    const { container } = renderComponent({
      dimension: { ...baseProps.dimension, isBinned: false }
    })
    const label = container.querySelector(".bin-settings-toggle-label")
    expect(label.textContent).toBe("Binning OFF")
  })
})
