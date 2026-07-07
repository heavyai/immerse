// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import reducer, { INITIAL } from "./parameter-definitions"
import { paramState } from "../parameter-mock-store"

import {
  REMOVE_ALL_PARAMETER_DEFINITIONS,
  ADD_PARAMETER_DEFINITION,
  UPDATE_PARAMETER_DEFINITION,
  REMOVE_PARAMETER_DEFINITION
} from "../constants"

describe("parameter-definitions reducer test suite", () => {
  it("can REMOVE_ALL_PARAMETER_DEFINITIONS", () => {
    const initialState = paramState.parameters.definitions
    const newState = reducer(initialState, {
      type: REMOVE_ALL_PARAMETER_DEFINITIONS
    })
    expect(newState).toEqual(INITIAL)
  })

  it("can ADD_PARAMETER_DEFINITION", () => {
    const initialState = paramState.parameters.definitions
    const testDef = { name: "a", foo: "b", bar: "c" }
    const newState = reducer(initialState, {
      type: ADD_PARAMETER_DEFINITION,
      payload: testDef
    })

    expect(newState).toEqual({
      ...initialState,
      [testDef.name]: testDef
    })
  })

  it("can UPDATE_PARAMETER_DEFINITION", () => {
    const initialState = paramState.parameters.definitions
    const testDef = { name: "a", foo: "b", bar: "c" }
    const newState = reducer(initialState, {
      type: ADD_PARAMETER_DEFINITION,
      payload: testDef
    })

    const updatedDef = { name: "a", foo: "b52", bar: "c4" }
    const updatedState = reducer(initialState, {
      type: UPDATE_PARAMETER_DEFINITION,
      payload: updatedDef
    })

    expect(updatedState).toEqual({
      ...newState,
      [updatedDef.name]: updatedDef
    })
  })

  it("can REMOVE_PARAMETER_DEFINITION", () => {
    const initialState = paramState.parameters.definitions
    const testDef = { name: "a", foo: "b", bar: "c" }
    const newState = reducer(initialState, {
      type: ADD_PARAMETER_DEFINITION,
      payload: testDef
    })
    const test2Def = { name: "a2", foo: "b2", bar: "c2" }
    const new2State = reducer(newState, {
      type: ADD_PARAMETER_DEFINITION,
      payload: test2Def
    })

    expect(new2State).toEqual({
      ...initialState,
      [testDef.name]: testDef,
      [test2Def.name]: test2Def
    })

    const updatedState = reducer(new2State, {
      type: REMOVE_PARAMETER_DEFINITION,
      payload: { name: test2Def.name }
    })

    expect(updatedState).toEqual(newState)
  })
})
