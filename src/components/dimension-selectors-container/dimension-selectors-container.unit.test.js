// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

jest.mock("react-dnd", () => {
  const identity = (Component) => Component
  return {
    __esModule: true,
    DragSource: () => identity,
    DropTarget: () => identity
  }
})

import DimensionSelectorsContainer from "./dimension-selectors-container"
import renderWithRedux from "utils/test-helpers/render-with-redux"
import mockAppState from "utils/test-helpers/mock-app-state"

jest.mock("components/selector-pill/selector-pill-parent", () => {
  const MockSelectorPillParent = (props) => (
    <div
      className="selector-pill-parent-mock"
      data-selector={JSON.stringify(props.selector)}
    />
  )
  return {
    __esModule: true,
    default: MockSelectorPillParent
  }
})

describe("DimensionSelectorsContainer", () => {
  const dimensions = [{}, {}, {}]

  const baseProps = {
    dimensions,
    chartId: "1",
    isSelectorError: () => false,
    isSelectorRequired: () => false,
    addCustomDimension: () => {},
    addSelector: () => {},
    clearSelector: () => {},
    removeSelector: () => {},
    editParameterizedCustomSql: () => {},
    chartType: "text"
  }

  const renderContainer = (overrideProps = {}) => {
    const props = { ...baseProps, ...overrideProps }
    const state = {
      ...mockAppState,
      charts: {
        ...(mockAppState.charts || {}),
        [props.chartId]: {
          measures: [],
          dimensions: props.dimensions
        }
      }
    }

    return renderWithRedux(<DimensionSelectorsContainer {...props} />, state)
  }

  it("should map over the dimensions", () => {
    const { container } = renderContainer()
    const slots = container.querySelectorAll(".add-btn-wrap")

    expect(slots).toHaveLength(3)
  })

  it("should show all rows as a dimension if a number chart is instantiated", () => {
    const { container } = renderContainer({
      dimensions: [],
      chartType: "number"
    })

    expect(
      container.querySelectorAll(".available-without-select")
    ).toHaveLength(1)
  })
})
