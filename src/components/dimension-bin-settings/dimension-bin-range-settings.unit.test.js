// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render } from "@testing-library/react"

import DimensionBinRangeSettings from "./dimension-bin-range-settings"

describe("DimensionBinRangeSettings Component", () => {
  const baseProps = {
    dimension: {
      isBinned: true,
      currentLowValue: 0,
      currentHighValue: 100,
      numOfBins: 12
    },
    updateBinRangeSlider: () => {},
    updateBinSlider: () => {},
    onBlur: () => {},
    onFocus: () => {}
  }

  it("should display and calculate the right bin size", () => {
    const { container } = render(<DimensionBinRangeSettings {...baseProps} />)
    const label = container.querySelectorAll(".chart-editor-label")[0]
    expect(label.textContent).toBe("# of Bins (Size: 8.33)")
  })
})
