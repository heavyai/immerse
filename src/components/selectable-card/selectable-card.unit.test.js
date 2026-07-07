// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { SelectableCard } from "./selectable-card"

describe("<SelectableCard />", () => {
  let defaultProps
  beforeEach(() => {
    defaultProps = {
      title: "Test Title",
      description: "This is a test card",
      icon: <div data-testid="fake-icon">FakeIcon</div>,
      selected: false,
      onSelect: jest.fn()
    }
  })

  it("should display title, description and icon", () => {
    render(<SelectableCard {...defaultProps} />)
    expect(screen.getByTestId("fake-icon")).toBeInTheDocument()
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
    expect(screen.getByText(defaultProps.description)).toBeInTheDocument()
  })

  it("should not show icon if none passed in", () => {
    defaultProps.icon = null
    render(<SelectableCard {...defaultProps} />)
    expect(screen.queryByTestId("selectable-card-icon")).not.toBeInTheDocument()
  })

  it("should call onSelect callback and be selected when clicked", () => {
    render(<SelectableCard {...defaultProps} />)
    fireEvent.click(screen.getByTestId("selectable-card"))
    expect(defaultProps.onSelect).toHaveBeenCalledTimes(1)
  })

  it("should have selected class when selected is true", () => {
    defaultProps.selected = true
    render(<SelectableCard {...defaultProps} />)
    expect(screen.getByTestId("selectable-card")).toHaveClass("selected")
  })

  it("should not call onSelect if card is disabled and clicked", () => {
    defaultProps.disabled = true
    render(<SelectableCard {...defaultProps} />)
    fireEvent.click(screen.getByTestId("selectable-card"))
    expect(defaultProps.onSelect).toHaveBeenCalledTimes(0)
  })

  it("should have disabled class when disabled prop is true", () => {
    defaultProps.disabled = true
    render(<SelectableCard {...defaultProps} />)
    expect(screen.getByTestId("selectable-card")).toHaveClass("disabled")
  })
})
