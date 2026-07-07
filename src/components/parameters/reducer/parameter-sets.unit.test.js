// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import reducer, { INITIAL } from "./parameter-sets"
import { paramState } from "../parameter-mock-store"

import {
  REMOVE_ALL_PARAMETER_SETS,
  ADD_PARAMETER_SET,
  RENAME_PARAMETER_SET,
  REMOVE_PARAMETER_SETS,
  DUPLICATE_PARAMETER_SET
} from "../constants"

const initialState = paramState.parameters.sets

describe("parameter-sets reducer test suite", () => {
  it("can REMOVE_ALL_PARAMETER_SETS", () => {
    const newState = reducer(initialState, { type: REMOVE_ALL_PARAMETER_SETS })
    expect(newState).toEqual(INITIAL)
  })
  it("can ADD_PARAMETER_SET", () => {
    const testSet = {
      name: "a",
      id: "set-id",
      parent: "set-parent",
      showHidden: true,
      tabId: "set-tab"
    }
    const newState = reducer(initialState, {
      type: ADD_PARAMETER_SET,
      payload: testSet
    })

    expect(newState).toEqual({
      ...initialState,
      [testSet.id]: testSet
    })
  })
  it("can RENAME_PARAMETER_SET", () => {
    const testSet = {
      name: "a",
      id: "set-id",
      parent: "set-parent",
      showHidden: true,
      tabId: "set-tab"
    }
    const newState = reducer(initialState, {
      type: ADD_PARAMETER_SET,
      payload: testSet
    })

    expect(newState).toEqual({
      ...initialState,
      [testSet.id]: testSet
    })

    const newName = "New Name"

    const updatedState = reducer(newState, {
      type: RENAME_PARAMETER_SET,
      payload: { name: newName, id: testSet.id }
    })

    expect(updatedState).toEqual({
      ...initialState,
      [testSet.id]: {
        ...testSet,
        name: newName
      }
    })
  })
  it("can REMOVE_PARAMETER_SETS", () => {
    const testSet = {
      name: "a",
      id: "set-id",
      parent: "set-parent",
      showHidden: true,
      tabId: "set-tab"
    }
    const newState = reducer(initialState, {
      type: ADD_PARAMETER_SET,
      payload: testSet
    })

    expect(newState).toEqual({
      ...initialState,
      [testSet.id]: testSet
    })

    const updatedState = reducer(newState, {
      type: REMOVE_PARAMETER_SETS,
      payload: { sets: [testSet.id] }
    })

    expect(updatedState).toEqual(initialState)
  })
  it("can DUPLICATE_PARAMETER_SET", () => {
    const testSet = {
      name: "a",
      id: "set-id",
      parent: "set-parent",
      showHidden: true,
      tabId: "set-tab"
    }
    const newState = reducer(initialState, {
      type: ADD_PARAMETER_SET,
      payload: testSet
    })

    expect(newState).toEqual({
      ...initialState,
      [testSet.id]: testSet
    })

    const newId = "duplicate-id"

    const updatedState = reducer(newState, {
      type: DUPLICATE_PARAMETER_SET,
      payload: { id: testSet.id, newId, tabId: testSet.tabId }
    })

    expect(updatedState).toEqual({
      ...newState,
      [newId]: { ...testSet, id: newId }
    })
  })
})
