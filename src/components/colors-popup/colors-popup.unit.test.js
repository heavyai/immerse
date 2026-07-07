// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import ColorsPopup, { buildSwatch } from "components/colors-popup/colors-popup"
import { LINE_STYLES } from "constants/charts"
import { render, screen, within } from "@testing-library/react"

describe("ColorsPopup Component", () => {
  const selectedColor = { type: "ordinal", key: "test", val: [] }

  const props = {
    top: 50,
    left: 50,
    isSelected: () => false,
    selectedColor,
    chooseColor: jest.fn(),
    chartType: "pie",
    numActiveDimensions: 0
  }

  const getComponent = (overrideProps = {}) => {
    return <ColorsPopup {...{ ...props, ...overrideProps }} />
  }
  const renderComponent = (overrideProps = {}) => {
    return render(getComponent(overrideProps))
  }

  // Loops through the swatches returned, makes sure the group and
  // colors within that group exist in the popup
  const checkSwatchExists = (swatchType = "ordinal") => {
    const swatches = buildSwatch(swatchType)
    swatches.forEach((swatch) => {
      const group = screen.getByTestId(`swatch-group-${swatch.type}`)
      Object.keys(swatch.colors).forEach((colorName) => {
        // Each swatch has > 1 color, make sure at least one is there
        expect(
          within(group).getAllByTestId(`color-item-${colorName}`).length
        ).toBeGreaterThan(0)
      })
    })
  }

  it("should get the correct swatches based on the chart type", () => {
    const { rerender } = renderComponent() // Default is pie
    checkSwatchExists("ordinal")

    rerender(getComponent({ chartType: "number" }))
    checkSwatchExists("solid")

    rerender(getComponent({ chartType: "heat" }))
    checkSwatchExists("quantitative")

    rerender(getComponent({ chartType: "table" }))
    checkSwatchExists("solid")

    rerender(getComponent({ chartType: "pointmap" }))
    checkSwatchExists("solid")

    expect(() => rerender(getComponent({ chartType: "not_a_chart" }))).toThrow(
      "can't get swatch for invalid chart type: not_a_chart"
    )
  })

  it("should get set swatches to quantitative for density accumulator", () => {
    renderComponent({
      chartType: "pointmap",
      showDensityAccumulatorColors: true
    })
    checkSwatchExists("quantitative")
  })

  it("should render ColorSwatches based on the color swatches", () => {
    renderComponent()
    const swatches = buildSwatch("ordinal")
    const expectedNumColors = swatches
      .map((swatch) => Object.keys(swatch.colors).length)
      .reduce((sum, num) => sum + num)
    expect(screen.getAllByTestId("color-swatch")).toHaveLength(
      expectedNumColors
    )
  })

  it("should render lineStyle buttons if applicable", () => {
    const { rerender } = renderComponent()
    expect(screen.queryByTestId("line-styles")).not.toBeInTheDocument()
    rerender(getComponent({ hasLineStyle: true, chartType: "line" }))
    expect(screen.getByTestId("line-styles")).toBeInTheDocument()
  })

  it("should highlight current lineStyle", () => {
    renderComponent({ hasLineStyle: true, chartType: "line" })
    expect(screen.getByTestId(`line-${LINE_STYLES[0]}`)).toBeInTheDocument()
  })
})
