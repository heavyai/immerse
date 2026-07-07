// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, fireEvent } from "@testing-library/react"
import { Y_AXIS_ORIENTATIONS } from "constants/charts"
import MeasureYAxisToggle from "./measure-yaxis-toggle"

describe("MeasureYAxisToggle Component", () => {
  const renderToggle = (overrideProps = {}) => {
    const toggleYAxisOrientation = jest.fn()
    const props = {
      measure: {
        yAxisOrientation: Y_AXIS_ORIENTATIONS.LEFT
      },
      toggleYAxisOrientation,
      ...overrideProps
    }

    const utils = render(<MeasureYAxisToggle {...props} />)
    return { ...utils, toggleYAxisOrientation }
  }

  it("should have a left axis toggle button", () => {
    const { container } = renderToggle()
    expect(container.querySelectorAll(".y-axis-toggle-left")).toHaveLength(1)
  })

  it("should have a right axis toggle button", () => {
    const { container } = renderToggle()
    expect(container.querySelectorAll(".y-axis-toggle-right")).toHaveLength(1)
  })

  it("should call toggleYAxisOrientation with LEFT when left button is clicked", () => {
    const { container, toggleYAxisOrientation } = renderToggle()
    const leftToggle = container.querySelector(".y-axis-toggle-left")

    fireEvent.click(leftToggle)

    expect(toggleYAxisOrientation).toHaveBeenCalledWith(
      Y_AXIS_ORIENTATIONS.LEFT
    )
  })

  it("should call toggleYAxisOrientation with RIGHT when right button is clicked", () => {
    const { container, toggleYAxisOrientation } = renderToggle({
      measure: { yAxisOrientation: Y_AXIS_ORIENTATIONS.RIGHT }
    })
    const rightToggle = container.querySelector(".y-axis-toggle-right")

    fireEvent.click(rightToggle)

    expect(toggleYAxisOrientation).toHaveBeenCalledWith(
      Y_AXIS_ORIENTATIONS.RIGHT
    )
  })
})
