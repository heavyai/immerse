// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import SearchInput from "./search-input"

const props = {
  placeholder: "SEARCH",
  searchVal: "test",
  clearSearch: jest.fn(),
  onSearch: jest.fn()
}

test("SearchInput onSearch should update parent with input event", () => {
  render(<SearchInput {...props} />)
  const input = screen.getByTestId("dashboard-search-bar-field")
  expect(input.value).toBe("test")
  fireEvent.change(input, {
    target: { value: "My new value" }
  })
  expect(props.onSearch).toHaveBeenCalled()
})

test("SearchInput onClear should just return the name wrapped in a span", () => {
  render(<SearchInput {...props} />)
  fireEvent.click(screen.getByRole("button"))
  expect(props.clearSearch).toHaveBeenCalled()
})
