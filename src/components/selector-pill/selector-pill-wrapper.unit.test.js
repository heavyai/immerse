// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import withStoreContext from "utils/test-helpers/with-store-context"
import { render, screen, fireEvent } from "@testing-library/react"

import Root, { SelectorPillWrapper } from "./selector-pill-wrapper"
import * as UIActions from "actions/ui-action-creators"

const state = {
  charts: {
    1: {
      type: "pie",
      dimensions: [{}, {}, {}],
      measures: []
    }
  },
  ui: {
    selectorPositions: {
      dimensions: [10, 10, 30]
    }
  }
}

const wrapDispatch = (dispatch) => (action) => {
  if (typeof action === "function") {
    action(dispatch, () => state)
  } else {
    dispatch(action)
  }
}

describe("Selector Pill Wrapper Component", () => {
  const props = {
    chartId: "1",
    chartType: "pie",
    index: 2,
    numSelectors: 4,
    selector: {},
    selectorType: "dimensions",
    selectorPillNotHover: () => {},
    setSelectorPillHover: () => {},
    editMode: false
  }

  const dispatch = jest.fn()
  const wrappedDispatch = wrapDispatch(dispatch)
  const setup = () => {
    return render(
      withStoreContext(
        <Root {...props}>required child</Root>,
        state,
        wrappedDispatch
      )
    )
  }

  describe("detect hover state and send to reducer", () => {
    test("should dispatch hover action on mouse over", async () => {
      setup()
      fireEvent.mouseOver(screen.queryByTestId("selector-pill-wrapper"))
      expect(dispatch).toHaveBeenCalledWith(
        UIActions.selectorPillHover(
          { chartType: "pie", index: 2, selectorType: "dimensions" },
          30
        )
      )
    })
    test("should dispatch hover action on mouse over", () => {
      setup()
      fireEvent.mouseLeave(screen.queryByTestId("selector-pill-wrapper"))
      expect(dispatch).toHaveBeenCalledWith(UIActions.selectorPillNotHover())
    })
  })

  describe("componentDidMount", () => {
    test("should setSelectorPosition with ref position", () => {
      global.window.pageYOffset = 500
      setup()
      // This is the correct value for side nav set to default; if the default is flipped back to
      // top nav, we need UIActions.setSelectorPosition(props.selectorType, props.index, 500 - 48)
      expect(dispatch).toHaveBeenCalledWith(
        UIActions.setSelectorPosition(props.selectorType, props.index, 500)
      )
    })
  })

  describe("UNSAFE_componentWillReceiveProps", () => {
    test("should update selector position if numSelectors has changed", () => {
      const setSelectorPosition = jest.fn()
      const { rerender } = render(
        <SelectorPillWrapper
          {...props}
          numSelectors={4}
          setSelectorPosition={setSelectorPosition}
        >
          required child
        </SelectorPillWrapper>
      )
      rerender(
        <SelectorPillWrapper
          {...props}
          numSelectors={5}
          setSelectorPosition={setSelectorPosition}
        >
          required child
        </SelectorPillWrapper>
      )
      expect(setSelectorPosition).toHaveBeenCalledTimes(2)
    })
  })
})
