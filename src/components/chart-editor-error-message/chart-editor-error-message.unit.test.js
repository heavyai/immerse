// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import ChartEditorErrorMessage from "./chart-editor-error-message"
import * as UIActions from "actions/ui-action-creators"
import "charts/chart-definitions"
import { renderWithRedux } from "jest/renderScaffolding"
import { fireEvent, waitFor } from "@testing-library/react"
import * as reactRedux from "react-redux"
import { noop } from "lodash"

const state = {
  charts: {
    1: {
      type: "pie",
      dimensions: [{}, {}, {}],
      areFiltersInverse: false
    }
  },
  ui: {
    selectorPositions: {
      dimensions: [10, 10, 30]
    },
    selectorPillHover: "This is a message?"
  }
}

const defaultProps = {
  chart: {
    type: "pie",
    measures: [
      {
        isError: false,
        isRequired: true,
        inactive: false,
        name: "val"
      },
      {
        inactive: false,
        name: "color",
        isError: false,
        isRequired: false
      }
    ],
    dimensions: [
      {
        inactive: false,
        name: null,
        isError: false,
        isRequired: true
      }
    ],
    hasError: true,
    areFiltersInverse: false,
    autoSize: false
  },
  id: "1",
  isMultiSourceEnabled: false,
  cap: 0
}

describe("ChartEditorErrorMessage Component", () => {
  function renderComponent(props = defaultProps) {
    return renderWithRedux(<ChartEditorErrorMessage {...props} />, null, state)
  }

  describe("Missing Requirements", () => {
    it("should display the correct prompt", () => {
      const { getAllByRole } = renderComponent()
      const missingItems = getAllByRole("listitem")
      missingItems.forEach((item) => {
        expect(item).toHaveClass("missing")
      })
      expect(missingItems[0].textContent).toMatch(/.*dimension.*/)
      expect(missingItems[1].textContent).toMatch(/.*size measure.*/)
    })
  })

  describe("Selector Error", () => {
    const chartWithError = {
      type: "pie",
      measures: [
        {
          name: "val",
          isError: true,
          isRequired: false,
          value: "l",
          custom: true,
          label: "Custom Measure",
          type: "CUSTOM",
          aggType: "Custom",
          originIndex: 0
        },
        {
          isError: false,
          isRequired: false,
          inactive: false,
          name: "color"
        }
      ],
      dimensions: [
        {
          inactive: false,
          name: null,
          isError: false,
          isRequired: false,
          table: "flights",
          type: "TIMESTAMP",
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "arr_timestamp",
          value: "arr_timestamp",
          min_val: "2008-01-01T00:57:00.000Z",
          max_val: "2009-01-01T18:27:00.000Z",
          currentLowValue: "2008-01-01T00:57:00.000Z",
          currentHighValue: "2009-01-01T18:27:00.000Z",
          isBinned: true,
          isBinnable: true,
          autobin: true,
          maxBinSize: 250,
          numOfBins: 400
        },
        {
          isError: false,
          isRequired: false
        }
      ],
      hasError: true,
      areFiltersInverse: false,
      autoSize: false
    }
    it("should display the error prompt", () => {
      const props = Object.assign({}, defaultProps, {
        chart: chartWithError
      })
      const { getAllByTestId } = renderComponent(props)
      const errors = getAllByTestId("prompt-status-error")
      expect(errors[0].textContent).toEqual("Invalid size measure")
    })
  })

  describe("Hover Behavior", () => {
    let dispatchSpy
    beforeEach(() => {
      dispatchSpy = jest.fn().mockImplementation((action) => {
        if (typeof action === "function") {
          // This is a thunk
          action(dispatchSpy, () => state)
        } else {
          noop()
        }
      })
      jest
        .spyOn(reactRedux, "useDispatch")
        .mockImplementation(() => dispatchSpy)
    })
    it("should setSelectorPillHoverFromIndex on mouse enter", async () => {
      const { getAllByRole } = renderComponent()
      const missing = getAllByRole("listitem")
      fireEvent.mouseOver(missing[0])
      await waitFor(() => {
        expect(dispatchSpy).toHaveBeenCalledTimes(2)
      })
      expect(dispatchSpy).toHaveBeenCalledWith({
        type: "SELECTOR_PILL_HOVER",
        selector: { chartType: "pie", index: 0, selectorType: "dimensions" },
        top: 10
      })
    })
    it("should selectorPillNotHover on mouse leave", () => {
      const { getAllByRole } = renderComponent()
      const missing = getAllByRole("listitem")
      fireEvent.mouseLeave(missing[0])
      expect(dispatchSpy).toHaveBeenCalledWith(UIActions.selectorPillNotHover())
    })
  })
})
