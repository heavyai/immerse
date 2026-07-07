// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import reducer, { INITIAL } from "./parameter-values"
import { paramState, mockVariables } from "../parameter-mock-store"

import {
  REMOVE_ALL_PARAMETER_VALUES,
  SET_PARAMETER_VALUE,
  REMOVE_PARAMETER_VALUE,
  SET_PARAMETER_DEFAULT,
  REMOVE_PARAMETER_DEFAULT,
  DUPLICATE_PARAMETER_SET,
  REMOVE_PARAMETER_DEFINITION,
  REMOVE_PARAMETER_SETS
} from "../constants"

const initialState = paramState.parameters.values

const { sampleName, sampleParameterSetId } = mockVariables

describe("parameter-values reducer test suite", () => {
  it("can REMOVE_ALL_PARAMETER_VALUES", () => {
    const newState = reducer(initialState, {
      type: REMOVE_ALL_PARAMETER_VALUES
    })
    expect(newState).toEqual(INITIAL)
  })

  it("can SET_PARAMETER_VALUE", () => {
    const testValue = {
      name: "param-name",
      value: "param-value",
      parameterSetId: "param-set-id"
    }
    const newState = reducer(initialState, {
      type: SET_PARAMETER_VALUE,
      payload: testValue
    })

    expect(newState).toEqual({
      ...initialState,
      [testValue.name]: { [testValue.parameterSetId]: testValue }
    })
  })

  it("can SET_PARAMETER_VALUE w/2 sets", () => {
    const testValue = {
      name: "param-name",
      value: "param-value",
      parameterSetId: "param-set-id"
    }
    const newState = reducer(initialState, {
      type: SET_PARAMETER_VALUE,
      payload: testValue
    })

    expect(newState).toEqual({
      ...initialState,
      [testValue.name]: { [testValue.parameterSetId]: testValue }
    })

    const test2Value = {
      name: "param-name",
      value: "param-value",
      parameterSetId: "param-set-id-2"
    }
    const updatedState = reducer(newState, {
      type: SET_PARAMETER_VALUE,
      payload: test2Value
    })

    expect(updatedState).toEqual({
      ...initialState,
      [testValue.name]: {
        [testValue.parameterSetId]: testValue,
        [test2Value.parameterSetId]: test2Value
      }
    })
  })

  it("can REMOVE_PARAMETER_VALUE w/one set", () => {
    const testValue = {
      name: "param-name",
      value: "param-value",
      parameterSetId: "param-set-id"
    }
    const newState = reducer(initialState, {
      type: SET_PARAMETER_VALUE,
      payload: testValue
    })

    expect(newState).toEqual({
      ...initialState,
      [testValue.name]: { [testValue.parameterSetId]: testValue }
    })

    const updatedState = reducer(newState, {
      type: REMOVE_PARAMETER_VALUE,
      payload: testValue
    })

    expect(updatedState).toEqual(initialState)
  })

  it("can REMOVE_PARAMETER_VALUE w/2 sets", () => {
    const testValue = {
      name: "param-name",
      value: "param-value",
      parameterSetId: "param-set-id"
    }
    const newState = reducer(initialState, {
      type: SET_PARAMETER_VALUE,
      payload: testValue
    })

    expect(newState).toEqual({
      ...initialState,
      [testValue.name]: { [testValue.parameterSetId]: testValue }
    })

    const test2Value = {
      name: "param-name",
      value: "param-value",
      parameterSetId: "param-set-id-2"
    }
    const updatedState = reducer(newState, {
      type: SET_PARAMETER_VALUE,
      payload: test2Value
    })

    expect(updatedState).toEqual({
      ...initialState,
      [testValue.name]: {
        [testValue.parameterSetId]: testValue,
        [test2Value.parameterSetId]: test2Value
      }
    })

    const deletedState = reducer(updatedState, {
      type: REMOVE_PARAMETER_VALUE,
      payload: testValue
    })

    expect(deletedState).toEqual({
      ...initialState,
      [testValue.name]: {
        [test2Value.parameterSetId]: test2Value
      }
    })
  })

  it("can SET_PARAMETER_DEFAULT", () => {
    const testdefaultValue = {
      name: "param-name",
      defaultValue: "param-defaultValue",
      parameterSetId: "param-set-id"
    }
    const newState = reducer(initialState, {
      type: SET_PARAMETER_DEFAULT,
      payload: testdefaultValue
    })

    expect(newState).toEqual({
      ...initialState,
      [testdefaultValue.name]: {
        [testdefaultValue.parameterSetId]: testdefaultValue
      }
    })
  })

  it("can SET_PARAMETER_DEFAULT w/2 sets", () => {
    const testdefaultValue = {
      name: "param-name",
      defaultValue: "param-defaultValue",
      parameterSetId: "param-set-id"
    }
    const newState = reducer(initialState, {
      type: SET_PARAMETER_DEFAULT,
      payload: testdefaultValue
    })

    expect(newState).toEqual({
      ...initialState,
      [testdefaultValue.name]: {
        [testdefaultValue.parameterSetId]: testdefaultValue
      }
    })

    const test2defaultValue = {
      name: "param-name",
      defaultValue: "param-defaultValue",
      parameterSetId: "param-set-id-2"
    }
    const updatedState = reducer(newState, {
      type: SET_PARAMETER_DEFAULT,
      payload: test2defaultValue
    })

    expect(updatedState).toEqual({
      ...initialState,
      [testdefaultValue.name]: {
        [testdefaultValue.parameterSetId]: testdefaultValue,
        [test2defaultValue.parameterSetId]: test2defaultValue
      }
    })
  })

  it("can REMOVE_PARAMETER_DEFAULT w/one set", () => {
    const testdefaultValue = {
      name: "param-name",
      defaultValue: "param-defaultValue",
      parameterSetId: "param-set-id"
    }
    const newState = reducer(initialState, {
      type: SET_PARAMETER_DEFAULT,
      payload: testdefaultValue
    })

    expect(newState).toEqual({
      ...initialState,
      [testdefaultValue.name]: {
        [testdefaultValue.parameterSetId]: testdefaultValue
      }
    })

    const updatedState = reducer(newState, {
      type: REMOVE_PARAMETER_DEFAULT,
      payload: testdefaultValue
    })

    expect(updatedState).toEqual(initialState)
  })

  it("can REMOVE_PARAMETER_DEFAULT w/2 sets", () => {
    const testdefaultValue = {
      name: "param-name",
      defaultValue: "param-defaultValue",
      parameterSetId: "param-set-id"
    }
    const newState = reducer(initialState, {
      type: SET_PARAMETER_DEFAULT,
      payload: testdefaultValue
    })

    expect(newState).toEqual({
      ...initialState,
      [testdefaultValue.name]: {
        [testdefaultValue.parameterSetId]: testdefaultValue
      }
    })

    const test2defaultValue = {
      name: "param-name",
      defaultValue: "param-defaultValue",
      parameterSetId: "param-set-id-2"
    }
    const updatedState = reducer(newState, {
      type: SET_PARAMETER_DEFAULT,
      payload: test2defaultValue
    })

    expect(updatedState).toEqual({
      ...initialState,
      [testdefaultValue.name]: {
        [testdefaultValue.parameterSetId]: testdefaultValue,
        [test2defaultValue.parameterSetId]: test2defaultValue
      }
    })

    const deletedState = reducer(updatedState, {
      type: REMOVE_PARAMETER_DEFAULT,
      payload: testdefaultValue
    })

    expect(deletedState).toEqual({
      ...initialState,
      [testdefaultValue.name]: {
        [test2defaultValue.parameterSetId]: test2defaultValue
      }
    })
  })

  it("can DUPLICATE_PARAMETER_SET w/values", () => {
    const testValue = {
      name: "param-name",
      value: "param-value",
      parameterSetId: "param-set-id"
    }
    const newState = reducer(initialState, {
      type: SET_PARAMETER_VALUE,
      payload: testValue
    })

    expect(newState).toEqual({
      ...initialState,
      [testValue.name]: { [testValue.parameterSetId]: testValue }
    })

    const newSetId = "param-set-id-dupe"

    const duplicatedState = reducer(newState, {
      type: DUPLICATE_PARAMETER_SET,
      payload: { id: testValue.parameterSetId, newId: newSetId }
    })

    expect(duplicatedState).toEqual({
      ...initialState,
      [testValue.name]: {
        [testValue.parameterSetId]: testValue,
        [newSetId]: { ...testValue, parameterSetId: newSetId }
      }
    })
  })

  it("can DUPLICATE_PARAMETER_SET w/o values", () => {
    const testValue = {
      name: "param-name",
      value: "param-value",
      parameterSetId: "param-set-id"
    }
    const newState = reducer(initialState, {
      type: SET_PARAMETER_VALUE,
      payload: testValue
    })

    expect(newState).toEqual({
      ...initialState,
      [testValue.name]: { [testValue.parameterSetId]: testValue }
    })

    const newSetId = "param-set-id-dupe"

    const duplicatedState = reducer(newState, {
      type: DUPLICATE_PARAMETER_SET,
      payload: { id: "fake-parameter-set-id", newId: newSetId }
    })

    expect(duplicatedState).toEqual(newState)
  })

  it("can REMOVE_PARAMETER_DEFINITION", () => {
    const newState = reducer(initialState, {
      type: REMOVE_PARAMETER_DEFINITION,
      payload: { name: sampleName }
    })
    const modifiedState = { ...initialState }
    delete modifiedState[sampleName]
    expect(newState).toEqual(modifiedState)
  })
  it("can REMOVE_PARAMETER_SETS", () => {
    const newState = reducer(initialState, {
      type: REMOVE_PARAMETER_SETS,
      payload: { sets: [sampleParameterSetId] }
    })
    const modifiedState = {
      ...initialState,
      [sampleName]: { ...initialState[sampleName] }
    }
    delete modifiedState[sampleName][sampleParameterSetId]

    expect(newState).toEqual(modifiedState)
  })
})
