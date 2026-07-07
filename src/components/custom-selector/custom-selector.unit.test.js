// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, fireEvent } from "@testing-library/react"

import CustomSelector from "./custom-selector"

describe("Custom Selector Component", () => {
  const options = [{ value: "test" }, { value: "example" }]

  const props = {
    className: "test",
    options,
    currentValue: "test"
  }

  describe("showOptions state", () => {
    it("should be initialized to false (options hidden)", () => {
      const { container } = render(
        <CustomSelector {...props} onChange={jest.fn()} />
      )
      // Options should not be visible initially
      expect(container.querySelectorAll(".custom-selector-item")).toHaveLength(
        0
      )
    })

    it("should show options on custom selector display click", () => {
      const { container } = render(
        <CustomSelector {...props} onChange={jest.fn()} />
      )
      const display = container.querySelector(".custom-selector-display")

      fireEvent.click(display)

      // Options should now be visible
      expect(
        container.querySelectorAll(".custom-selector-item").length
      ).toBeGreaterThan(0)
    })

    it("should hide options on option click", () => {
      const onChange = jest.fn()
      const { container } = render(
        <CustomSelector {...props} onChange={onChange} />
      )
      const display = container.querySelector(".custom-selector-display")

      // Open the selector
      fireEvent.click(display)
      expect(
        container.querySelectorAll(".custom-selector-item").length
      ).toBeGreaterThan(0)

      // Click an option
      const firstOption = container.querySelector(".custom-selector-item")
      fireEvent.click(firstOption)

      // Options should be hidden again
      expect(container.querySelectorAll(".custom-selector-item")).toHaveLength(
        0
      )
      expect(onChange).toHaveBeenCalled()
    })
  })

  describe("render", () => {
    it("should hide custom selector items if showOptions is false", () => {
      const { container } = render(
        <CustomSelector {...props} onChange={jest.fn()} />
      )
      expect(container.querySelectorAll(".custom-selector-item")).toHaveLength(
        0
      )
    })
  })
})
