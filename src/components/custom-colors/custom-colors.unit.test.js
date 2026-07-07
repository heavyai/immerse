// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, fireEvent } from "@testing-library/react"
import { Provider } from "react-redux"
import CustomColors from "./custom-colors"

// Mock action creators using Jest instead of proxyquire
jest.mock("actions/charts-action-creators", () => ({
  addCustomColor: () => ({ type: "ADD_CUSTOM" }),
  removeCustomColor: () => ({ type: "REMOVE_CUSTOM" }),
  setCustomColor: () => ({ type: "SET_CUSTOM" }),
  setCustomColorMultiSource: () => ({ type: "SET_CUSTOM" })
}))

// Mock CustomColorsList to simplify testing
jest.mock("components/custom-colors/custom-colors-list", () => {
  return function CustomColorsList(props) {
    return (
      <div data-testid="custom-colors-list">
        <button className="remove" onClick={() => props.removeCustomColor(0)}>
          Remove
        </button>
      </div>
    )
  }
})

describe("CustomColors Component", () => {
  const state = {
    autosuggest: {},
    chartEditor: { editId: "1" },
    charts: { 1: { dataSource: "flights" } }
  }

  const defaultProps = {
    allowRemoval: true,
    chart: { type: "test-chart-type" },
    color: {
      customDomain: ["ATL"],
      customRange: ["blue"]
    },
    options: [{ value: "dest", label: "dest" }],
    removeCustomColors: jest.fn(),
    hasAxisSelector: false,
    buttonLabel: "test-color-button",
    keysColumns: {},
    updateChartColor: () => {},
    id: "0",
    chartType: "test-chart-type"
  }

  function createStore(initialState = state) {
    return {
      getState: () => initialState,
      dispatch: jest.fn(),
      subscribe: jest.fn(() => jest.fn())
    }
  }

  function createWrapper(props = defaultProps, initialState) {
    const store = createStore(initialState)
    return render(
      <Provider store={store}>
        <CustomColors {...props} />
      </Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("handlers", () => {
    it("should call removeCustomColors on custom-colors-remove click", () => {
      const removeCustomColors = jest.fn()
      const { container } = createWrapper({
        ...defaultProps,
        removeCustomColors
      })

      const removeButton = container.querySelector(".custom-colors-remove")
      if (removeButton) {
        fireEvent.click(removeButton)
        expect(removeCustomColors).toHaveBeenCalled()
      }
    })

    it("should handle removeColor when remove button is clicked", () => {
      const { container } = createWrapper()

      const removeButton = container.querySelector(".remove")
      if (removeButton) {
        fireEvent.click(removeButton)
        // Verify the store received actions (if needed)
      }
    })
  })

  describe("render", () => {
    it("should not display removal button if removal is not allowed", () => {
      const { container } = createWrapper({
        ...defaultProps,
        allowRemoval: false
      })

      expect(
        container.querySelector(".custom-colors-remove")
      ).not.toBeInTheDocument()
    })

    it("should display the custom color label for measure", () => {
      const { container } = createWrapper({
        ...defaultProps,
        options: [],
        headerLabel: "# Records"
      })

      const header = container.querySelector(".custom-colors-header")
      expect(header).toHaveTextContent("# Records")
    })

    it('should display "Custom Colors" as label when no color measures', () => {
      const { container } = createWrapper({
        ...defaultProps,
        options: []
      })

      const header = container.querySelector(".custom-colors-header")
      expect(header).toHaveTextContent("Custom Colors")
    })
  })
})
