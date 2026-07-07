// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"

import SelectorDropdown, { shouldDropDown } from "./selector-dropdown"

describe("SelectorDropdown Component", () => {
  const state = {
    connection: {
      isSuperuser: false
    }
  }
  const store = {
    getState: () => state,
    subscribe: () => {},
    dispatch: () => {}
  }

  const props = {
    options: [{ label: "test", value: "test-value" }],
    matchingOptions: [{ label: "test", value: "test-value" }],
    selector: {
      value: "test"
    },
    dimension: { custom: true },
    isDropdownOpen: false,
    renderOption: jest.fn(),
    onOpenChange: () => {},
    onValueChange: () => {}
  }

  render(
    <Provider store={store}>
      <SelectorDropdown {...props} />
    </Provider>
  )

  it("should have the correct default value", () => {
    expect(screen.getByText("test").textContent).toEqual(props.selector.value)
  })

  describe("shouldDropDown prop", () => {
    it("should be true if hasSettings is false or isDropdownOpen is true", () => {
      expect(shouldDropDown({ hasSettings: false })).toEqual(true)
      expect(shouldDropDown({ isDropdownOpen: true })).toEqual(true)
    })

    it("should be false if dimension has numerical type", () => {
      expect(
        shouldDropDown({ hasSettings: true, dimension: { type: "INT" } })
      ).toEqual(false)
      expect(
        shouldDropDown({ hasSettings: true, dimension: { type: "STR" } })
      ).toEqual(true)
    })

    it("should be false if measure has aggtype and aggtype is not count", () => {
      expect(
        shouldDropDown({ hasSettings: true, measure: { aggType: "AVG" } })
      ).toEqual(false)
      expect(
        shouldDropDown({ hasSettings: true, measure: { aggType: "Count" } })
      ).toEqual(true)
    })
  })
})
