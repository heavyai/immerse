// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import action from "utils/redux/action"
import {
  CLEAR_ALL_INPUT_FILTERS,
  REMOVE_DASHBOARD_FILTER_ERROR,
  REMOVE_DASHBOARD_FILTER_REQUEST,
  REMOVE_DASHBOARD_FILTER_SUCCESS,
  REMOVE_INPUT_FILTER,
  SET_FILTER
} from "actions/dashboard-filters-action-creators"

import FiltersReducer, {
  setRequestState,
  setErrorState,
  setSuccessState
} from "./filters-reducer"

function testRequestAction(state, actionType) {
  const nextState = FiltersReducer(state, actionType)
  expect(nextState).toEqual(setRequestState(state, actionType))
}

function testErrorAction(state, actionType) {
  const nextState = FiltersReducer(state, actionType)
  expect(nextState).toEqual(setErrorState(state, actionType))
}

function testSuccessAction(state, actionType) {
  const nextState = FiltersReducer(state, actionType)
  expect(nextState).toEqual(setSuccessState(state, actionType))
}

describe("Filters Reducer", () => {
  describe("All Request Action Types", () => {
    it("should set filter at index to be loading", () => {
      ;[REMOVE_DASHBOARD_FILTER_REQUEST].forEach((type) => {
        testRequestAction([{ expression: "test" }], action(type, { index: 0 }))
      })
    })
    it("should handle cases where filter hasnt been created yet", () => {
      ;[REMOVE_DASHBOARD_FILTER_REQUEST].forEach((type) => {
        testRequestAction([], action(type, { index: 0 }))
      })
    })
  })

  describe("All Error Action Types", () => {
    it("should set filter at index to be loading", () => {
      ;[REMOVE_DASHBOARD_FILTER_ERROR].forEach((type) => {
        testErrorAction(
          [
            {
              expression: "test",
              loading: true,
              error: false
            }
          ],
          action(type, { index: 0, error: "bad" })
        )
      })
    })
  })

  describe("All Success Action Types", () => {
    it("should set filter at index to loading and error false", () => {
      ;[REMOVE_DASHBOARD_FILTER_SUCCESS].forEach((type) => {
        testSuccessAction(
          [
            {
              expression: "test",
              loading: true,
              error: false
            }
          ],
          action(type, { index: 0 })
        )
      })
    })
  })

  describe("REMOVE_INPUT_FILTER reducer", () => {
    const state = [
      { expression: "test" },
      { expression: "example" },
      { expression: "test" }
    ]

    const nextState = FiltersReducer(state, {
      type: REMOVE_INPUT_FILTER,
      index: 1
    })

    it("should remove the filter at the selected index", () => {
      expect(nextState).toEqual([
        { expression: "test" },
        { expression: "test" }
      ])
    })
  })

  describe("CLEAR_ALL_INPUT_FILTERS reducer", () => {
    const state = [
      { expression: "test" },
      { expression: "example" },
      { expression: "test" }
    ]

    const nextState = FiltersReducer(state, {
      type: CLEAR_ALL_INPUT_FILTERS
    })

    it("should remove all filters", () => {
      expect(nextState).toEqual([])
    })
  })

  describe("SET_FILTER reducer", () => {
    const state = []

    const nextState = FiltersReducer(state, {
      type: SET_FILTER,
      index: 0,
      attributes: {
        expression: "test"
      }
    })

    it("should set new atttributes", () => {
      expect(nextState).toEqual([{ expression: "test" }])
    })

    it("should set update atttributes", () => {
      const nextNextState = FiltersReducer(state, {
        type: SET_FILTER,
        index: 0,
        attributes: {
          expression: "example"
        }
      })
      expect(nextNextState).toEqual([{ expression: "example" }])
    })
  })
})
