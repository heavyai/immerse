// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, fireEvent } from "@testing-library/react"
import NavDropDown from "./nav-dropdown"

describe("Text Nav Dropdown", () => {
  const baseProps = {
    closeDropdown: jest.fn(),
    isOpen: true,
    displayText: "Test Text",
    dropDownLinks: [{}, {}, {}],
    togglePopover: jest.fn(),
    type: "test",
    testid: "nav-dropdown"
  }

  const renderDropdown = (overrideProps = {}) => {
    const props = { ...baseProps, ...overrideProps }
    const utils = render(<NavDropDown {...props} />)
    return { ...utils, props }
  }

  it("toggles dropdown when clicked", () => {
    const togglePopover = jest.fn()
    const { getByTestId } = renderDropdown({ togglePopover })

    fireEvent.click(getByTestId("nav-dropdown"))

    expect(togglePopover).toHaveBeenCalled()
  })

  it("renders display text when present", () => {
    const { container } = renderDropdown()
    const displayText = container.querySelector(".dropdown-display-text")

    expect(displayText).not.toBeNull()
    expect(displayText.textContent).toContain("Test Text")
  })

  it("renders a single icon when no icon provided in props", () => {
    const { container } = renderDropdown()
    const icons = container.querySelectorAll(".dropdown-display-icon")
    expect(icons).toHaveLength(1)
  })

  it("renders three dropdown items", () => {
    const { container } = renderDropdown()
    expect(container.querySelectorAll("li")).toHaveLength(3)
  })
})

describe("Conditional Dropdown Items", () => {
  it("does not render dropdown link when condition is false", () => {
    const props = {
      closeDropdown: jest.fn(),
      isOpen: true,
      displayText: "Test Text",
      dropDownLinks: [{ condition: false }],
      togglePopover: jest.fn(),
      type: "test",
      testid: "nav-dropdown-conditional"
    }

    const { container } = render(<NavDropDown {...props} />)

    expect(container.querySelectorAll("li")).toHaveLength(0)
  })
})

describe("Icon Nav Dropdown", () => {
  it("toggles dropdown when clicked", () => {
    const togglePopover = jest.fn()
    const props = {
      closeDropdown: jest.fn(),
      isOpen: true,
      icon: { className: "user-icon", name: "default-user" },
      dropDownLinks: [{}, {}, {}],
      togglePopover,
      type: "test",
      testid: "nav-dropdown-icon"
    }

    const { getByTestId } = render(<NavDropDown {...props} />)

    fireEvent.click(getByTestId("nav-dropdown-icon"))

    expect(togglePopover).toHaveBeenCalled()
  })
})
