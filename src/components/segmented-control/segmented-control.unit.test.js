// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import SegmentedControl from "./segmented-control"

const defaultProps = {
  options: [{ default: true, value: "yes", label: "testLabel" }],
  setValue: () => {},
  name: "test-segmented-control"
}

describe("SegmentedControl Component", () => {
  test("should create the component with default values", () => {
    render(<SegmentedControl {...defaultProps} />)
    expect(screen.getAllByRole("button")).toHaveLength(1)
  })

  test("should handle a list of values", () => {
    const setValue = jest.fn()
    const props = {
      options: [
        { default: true, value: "yes", testid: "button-1" },
        { default: false, value: "no", testid: "button-2" }
      ],
      setValue,
      name: "test-segmented-control"
    }
    render(<SegmentedControl {...props} />)
    fireEvent.click(screen.getByTestId("button-2"))
    expect(setValue).toHaveBeenCalledWith("no")
  })
})
