// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getPopulatedMockStore, mockVariables } from "../parameter-mock-store"

import {
  REMOVE_ALL_PARAMETER_VALUES,
  SET_PARAMETER_VALUE,
  REMOVE_PARAMETER_VALUE,
  SET_PARAMETER_DEFAULT,
  REMOVE_PARAMETER_DEFAULT
} from "../constants"

import {
  removeAllParameterValues,
  setParameterValue,
  removeParameterValue,
  setParameterDefault,
  removeParameterDefault
} from "./parameter-values-action-creators"

const {
  sampleName,
  sampleParameterSetId,
  selectedParameterSetId
} = mockVariables

describe("parameter values action-creators suite", () => {
  it("can removeAllParameterValues", () => {
    expect(removeAllParameterValues()).toEqual({
      type: REMOVE_ALL_PARAMETER_VALUES
    })
  })

  it("can setParameterValue w/parameterSetId", async () => {
    const sampleValue = "param-value-1"
    const store = getPopulatedMockStore()
    await store.dispatch(
      setParameterValue({
        name: sampleName,
        value: sampleValue,
        parameterSetId: sampleParameterSetId
      })
    )
    const actions = store.getActions()
    expect(actions[0].type).toEqual(SET_PARAMETER_VALUE)
    expect(actions[0].payload.name).toEqual(sampleName)
    expect(actions[0].payload.value).toEqual(sampleValue)
    expect(actions[0].payload.parameterSetId).toEqual(sampleParameterSetId)
  })

  it("can setParameterValue w/o parameterSetId", async () => {
    const sampleValue = "param-value-1"
    const store = getPopulatedMockStore()
    await store.dispatch(
      setParameterValue({
        name: sampleName,
        value: sampleValue
      })
    )
    const actions = store.getActions()

    expect(actions[0].type).toEqual(SET_PARAMETER_VALUE)
    expect(actions[0].payload.name).toEqual(sampleName)
    expect(actions[0].payload.value).toEqual(sampleValue)
    expect(actions[0].payload.parameterSetId).toEqual(selectedParameterSetId)
  })

  it("can removeParameterValue", () => {
    expect(removeParameterValue(sampleName, sampleParameterSetId)).toEqual({
      type: REMOVE_PARAMETER_VALUE,
      payload: { name: sampleName, parameterSetId: sampleParameterSetId }
    })
  })

  it("can setParameterDefault w/parameterSetId", async () => {
    const sampleValue = "param-value-1"
    const store = getPopulatedMockStore()
    await store.dispatch(
      setParameterDefault({
        name: sampleName,
        defaultValue: sampleValue,
        parameterSetId: sampleParameterSetId
      })
    )
    const actions = store.getActions()
    expect(actions[0].type).toEqual(SET_PARAMETER_DEFAULT)
    expect(actions[0].payload.name).toEqual(sampleName)
    expect(actions[0].payload.defaultValue).toEqual(sampleValue)
    expect(actions[0].payload.parameterSetId).toEqual(sampleParameterSetId)
  })

  it("can setParameterDefault w/o parameterSetId", async () => {
    const sampleValue = "param-value-1"
    const store = getPopulatedMockStore()
    await store.dispatch(
      setParameterDefault({
        name: sampleName,
        defaultValue: sampleValue
      })
    )
    const actions = store.getActions()

    expect(actions[0].type).toEqual(SET_PARAMETER_DEFAULT)
    expect(actions[0].payload.name).toEqual(sampleName)
    expect(actions[0].payload.defaultValue).toEqual(sampleValue)
    expect(actions[0].payload.parameterSetId).toEqual(selectedParameterSetId)
  })

  it("can removeParameterDefault", () => {
    expect(removeParameterDefault(sampleName, sampleParameterSetId)).toEqual({
      type: REMOVE_PARAMETER_DEFAULT,
      payload: { name: sampleName, parameterSetId: sampleParameterSetId }
    })
  })
})
