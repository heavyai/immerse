// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, fireEvent, screen } from "@testing-library/react"

import BarLineToggle from "./bar-line-toggle"

describe("BarLineToggle", () => {
  const setMarkType = jest.fn()

  const props = {
    handleLeftClick: () => setMarkType("line"),
    handleRightClick: () => setMarkType("bar"),
    markType: "line",
    setMarkType
  }

  it("should have the class name bar-line-toggle", () => {
    const { container } = render(<BarLineToggle {...props} />)
    expect(container.firstChild.classList.contains("bar-line-toggle")).toBe(
      true
    )
  })

  it("should have a line toggle button", () => {
    render(<BarLineToggle {...props} />)
    expect(screen.getByTestId("line-toggle-button")).toHaveClass("line")
  })

  it("should have a bar toggle button", () => {
    render(<BarLineToggle {...props} />)
    expect(screen.getByTestId("bar-toggle-button")).toHaveClass("bar")
  })

  it("should correctly invoke setMarkType action creator on handleLeftClick", () => {
    const { getByTestId } = render(<BarLineToggle {...props} />)
    fireEvent.click(getByTestId("line-toggle-button"))
    expect(setMarkType).toHaveBeenCalledWith("line")
  })

  it("should correctly invoke setMarkType action creator on handleRightClick", () => {
    const { getByTestId } = render(<BarLineToggle {...props} />)
    fireEvent.click(getByTestId("bar-toggle-button"))
    expect(setMarkType).toHaveBeenCalledWith("bar")
  })
})
