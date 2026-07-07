// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
const { render, screen, fireEvent } = require("@testing-library/react")
const {
  JoinConditionSelector,
  JOIN_CONDITIONS
} = require("./join-condition-selector")

describe("<JoinConditionSelector/>", () => {
  let defaultProps
  beforeEach(() => {
    defaultProps = {
      onSelect: jest.fn(),
      leftType: "POINT",
      rightType: "POLYGON"
    }
  })
  it("should render join condition options", () => {
    render(<JoinConditionSelector {...defaultProps} />)
    expect(screen.getByTestId("join-condition-selector")).toBeInTheDocument()
    const cards = screen.getAllByTestId("selectable-card")
    expect(cards.length).toBe(JOIN_CONDITIONS.length)
    cards.forEach((card) => {
      expect(card).not.toHaveClass("selected")
    })
  })
  it("should call onSelect prop when non disabled option is clicked", () => {
    render(<JoinConditionSelector {...defaultProps} />)
    fireEvent.click(screen.getByText(JOIN_CONDITIONS[0].title))
    expect(defaultProps.onSelect).toHaveBeenCalledTimes(1)
    expect(defaultProps.onSelect).toHaveBeenCalledWith(JOIN_CONDITIONS[0].value)
  })
  it("should disable option if not compatible with left/right types", () => {
    defaultProps.leftType = "NONEXISTENT"
    defaultProps.rightType = "MULTIPOLYGON"
    render(<JoinConditionSelector {...defaultProps} />)
    const cards = screen.getAllByTestId("selectable-card")
    expect(cards[0]).toHaveClass("disabled")
  })
  it("should not call onSelect if disabled option is clicked", () => {
    defaultProps.leftType = "NONEXISTENT"
    defaultProps.rightType = "MULTIPOLYGON"
    render(<JoinConditionSelector {...defaultProps} />)
    const cards = screen.getAllByTestId("selectable-card")
    fireEvent.click(cards[0])
    expect(defaultProps.onSelect).toHaveBeenCalledTimes(0)
  })
  it("should show tooltip on disabled option", () => {
    defaultProps.leftType = "NONEXISTENT"
    defaultProps.rightType = "MULTIPOLYGON"
    render(<JoinConditionSelector {...defaultProps} />)
    const cards = screen.getAllByTestId("selectable-card")
    fireEvent.mouseOver(cards[0])
    expect(
      screen.getByText(
        "Geometry types are not compatible with this join condition"
      )
    ).toBeInTheDocument()
  })
})
