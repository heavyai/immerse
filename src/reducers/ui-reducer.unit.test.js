// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import UIReducer, { initialState } from "reducers/ui-reducer"

import {
  hideModal,
  showModal,
  setSelectorPosition
} from "actions/ui-action-creators"

describe("UI Reducer", () => {
  it("should return the correct initial state", () => {
    const state = UIReducer(undefined, {})
    expect(state).toEqual(initialState)
  })

  it("should handle the HIDE_MODAL action action type", () => {
    const action = hideModal()
    const state = UIReducer(
      Object.assign({}, initialState, {
        modal: {
          open: true,
          content: "Hey",
          heading: "Yo",
          primaryAction: () => {}
        }
      }),
      action
    )

    expect(state.modal).toEqual(initialState.modal)
  })

  it("should handle the SHOW_MODAL action action type", () => {
    const heading = "TEST"
    const content = "EXAMPLE"
    const primaryAction = (dispatch) => dispatch("TEST")
    const action = showModal({
      heading,
      content,
      primaryAction
    })
    const { modal } = UIReducer(initialState, action)

    expect(modal.open).toEqual(true)
    expect(modal.content).toEqual(content)
    expect(modal.heading).toEqual(heading)
    expect(modal.primaryAction).toEqual(primaryAction)
  })

  describe("SET_SELECTOR_POSITION handler", () => {
    const state = {
      selectorPositions: {
        measures: [50, 100],
        dimensions: [30]
      }
    }
    describe("when action selectorType is measures", () => {
      it("should update measures position", () => {
        const nextState = UIReducer(
          state,
          setSelectorPosition("measures", 1, 50)
        )
        expect(nextState.selectorPositions.measures[1]).toEqual(50)
      })
    })
    describe("when action selectorType is dimensions", () => {
      it("should update dimensions position", () => {
        const nextState = UIReducer(
          state,
          setSelectorPosition("dimensions", 1, 75)
        )
        expect(nextState.selectorPositions.dimensions[1]).toEqual(75)
      })
    })
  })
})
