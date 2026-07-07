// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import ColorSwatch from "./color-swatch"
import { fireEvent, render, screen } from "@testing-library/react"

describe("ColorSwatch Component", () => {
  let props = null

  beforeEach(() => {
    props = {
      color: { val: ["#22A7F0", "#3ad6cd", "#d4e666"], type: "quantitative" },
      selected: true,
      onClick: jest.fn()
    }
  })

  const renderComponent = () => render(<ColorSwatch {...props} />)

  it("should show if color type is quantitative", () => {
    renderComponent()
    expect(screen.getByTestId("color-item-mapD")).toBeInTheDocument()
  })

  it("should show if color type is no quantitative", () => {
    props.color = { val: ["#22A7F0", "#3ad6cd", "#d4e666"], type: "ordinal" }

    renderComponent()

    expect(screen.getAllByTestId("color-item-mapD")).toHaveLength(
      props.color.val.length
    )
  })

  it("should render the proper selected class", () => {
    renderComponent()
    expect(screen.getByTestId("color-swatch")).toHaveClass("selected")
    expect(screen.getByTestId("color-swatch")).toHaveAttribute("title", "mapD")
  })

  it("should handle clicks", () => {
    renderComponent()
    fireEvent.click(screen.getByTestId("color-swatch"))
    expect(props.onClick).toHaveBeenCalled()
  })
})
