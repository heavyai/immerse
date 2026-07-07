// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import ColorPicker from "./color-picker"
import { fireEvent, render, screen } from "@testing-library/react"

describe("ColorPicker Component", () => {
  const color = { type: "solid", key: "red", val: ["#ea5545"] }

  let props
  beforeEach(() => {
    props = {
      id: "1",
      color,
      chart: {},
      isColorMeasureSelected: false,
      updateChartColor: jest.fn(),
      updateShowColorPopup: jest.fn(),
      markTypes: [],
      savedColors: {},
      buttonLabel: "test-button-label",
      canRemoveCustomColors: false,
      chartId: "1",
      chartType: "test-chart-type",
      customColorsOn: false,
      isCustomColors: false,
      isMultiSource: false,
      keysColumns: {},
      numActiveDimensions: 0,
      showColorPopup: false,
      updateChart: () => {},
      updateChartColors: () => {},
      updateColorByDimension: () => {}
    }
  })

  const renderComponent = () => {
    return render(<ColorPicker {...props} />)
  }

  it("should render a ColorSwatch based on its color prop", () => {
    const { getByTestId } = renderComponent()
    expect(getByTestId("color-swatch")).toBeInTheDocument()
  })

  it("should open the ColorsPopup on click", () => {
    const { getByTestId } = renderComponent()
    expect(getByTestId("color-swatch")).toBeInTheDocument()
    fireEvent.click(getByTestId("color-swatch"))
    expect(props.updateShowColorPopup).toHaveBeenCalledWith(true)
  })

  it("should determine if a color is selected based on the color prop and state", async () => {
    renderComponent()
    expect(screen.getByTestId("color-item-red")).toBeInTheDocument()
    expect(screen.queryByTestId("color-item-blah")).not.toBeInTheDocument()
  })
})
