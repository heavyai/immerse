// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  getPopulatedMockStore,
  linkedParamState,
  mockVariables
} from "../parameter-mock-store"

import {
  SET_PARAMETER_VALUE,
  SET_PARAMETER_DEFAULT,
  CLEAR_PARAMETER_VALUES
} from "../constants"

import { simpleSetParameterValue } from "components/parameters/actions/simple-action-wrappers"
import {
  linkParameter,
  unlinkParameter
} from "components/parameters/actions/parameter-link-actions"

import { UPDATE_DASHBOARD_SAVE_STATE } from "constants/action-types"

const {
  sampleName,
  selectedParameterSetId,
  sampleDashboardParameterSetId,
  selectedParameterSetValue,
  linkedParameterName
} = mockVariables

describe("simple action wrappers test suite", () => {
  it("can simpleSetParameterValue when linked", async () => {
    const sampleValue = "sample-value"
    const store = getPopulatedMockStore()
    await store.dispatch(simpleSetParameterValue(sampleName, sampleValue))
    const actions = store.getActions()
    expect(actions[0].type).toEqual(SET_PARAMETER_VALUE)
    expect(actions[0].payload.name).toEqual(sampleName)
    expect(actions[0].payload.value).toEqual(sampleValue)
    expect(actions[0].payload.parameterSetId).toEqual(selectedParameterSetId)
  })

  it("can simpleSetParameterValue w/default when linked", async () => {
    const sampleValue = "sample-value"
    const store = getPopulatedMockStore()
    await store.dispatch(simpleSetParameterValue(sampleName, sampleValue, true))
    const actions = store.getActions()
    expect(actions[0].type).toEqual(SET_PARAMETER_DEFAULT)
    expect(actions[0].payload.name).toEqual(sampleName)
    expect(actions[0].payload.defaultValue).toEqual(sampleValue)
    expect(actions[0].payload.parameterSetId).toEqual(selectedParameterSetId)
  })

  it("can simpleSetParameterValue when unlinked", async () => {
    const sampleValue = "sample-value"
    const store = getPopulatedMockStore({
      dashboard: { selectedTabId: "tab7" }
    })
    await store.dispatch(simpleSetParameterValue(sampleName, sampleValue))
    const actions = store.getActions()
    expect(actions[0].type).toEqual(SET_PARAMETER_VALUE)
    expect(actions[0].payload.name).toEqual(sampleName)
    expect(actions[0].payload.value).toEqual(sampleValue)
    expect(actions[0].payload.parameterSetId).toEqual(
      sampleDashboardParameterSetId
    )
  })

  it("can simpleSetParameterValue w/default when unlinked", async () => {
    const sampleValue = "sample-value"
    const store = getPopulatedMockStore({
      dashboard: { selectedTabId: "tab7" }
    })
    await store.dispatch(simpleSetParameterValue(sampleName, sampleValue, true))
    const actions = store.getActions()
    expect(actions[0].type).toEqual(SET_PARAMETER_DEFAULT)
    expect(actions[0].payload.name).toEqual(sampleName)
    expect(actions[0].payload.defaultValue).toEqual(sampleValue)
    expect(actions[0].payload.parameterSetId).toEqual(
      sampleDashboardParameterSetId
    )
  })

  it("clears local value on linkParameter", async () => {
    const store = getPopulatedMockStore()
    await store.dispatch(linkParameter(sampleName))
    const actions = store.getActions()

    expect(actions[0].type).toEqual(CLEAR_PARAMETER_VALUES)
    expect(actions[0].payload.name).toEqual(sampleName)
  })

  it("promotes value to parent value when linking parameter if no other linked values exist", async () => {
    const store = getPopulatedMockStore()
    await store.dispatch(linkParameter(sampleName))
    const actions = store.getActions()

    expect(actions[1].type).toEqual(SET_PARAMETER_VALUE)
    expect(actions[1].payload.name).toEqual(sampleName)
    expect(actions[1].payload.parameterSetId).toEqual(
      sampleDashboardParameterSetId
    )
    expect(actions[1].payload.value).toEqual(selectedParameterSetValue)

    expect(actions[2].type).toEqual(SET_PARAMETER_DEFAULT)
    expect(actions[2].payload.name).toEqual(sampleName)
    expect(actions[2].payload.parameterSetId).toEqual(
      sampleDashboardParameterSetId
    )
    expect(actions[2].payload.value).toBeUndefined()
  })

  it("does not set a value when linking parameter if another linked value already exists", async () => {
    const store = getPopulatedMockStore(linkedParamState)
    await store.dispatch(linkParameter(linkedParameterName, "discard-value"))
    const actions = store.getActions()

    expect(actions[0].type).toEqual(CLEAR_PARAMETER_VALUES)
    expect(actions[0].payload.name).toEqual(linkedParameterName)

    expect(actions[1].type).toEqual(UPDATE_DASHBOARD_SAVE_STATE)
  })

  it("can linkParameter with value", async () => {
    const store = getPopulatedMockStore()
    const newValue = "new-value"
    await store.dispatch(linkParameter(sampleName, newValue))
    const actions = store.getActions()

    expect(actions[1].type).toEqual(SET_PARAMETER_VALUE)
    expect(actions[1].payload.name).toEqual(sampleName)
    expect(actions[1].payload.parameterSetId).toEqual(
      sampleDashboardParameterSetId
    )
    expect(actions[1].payload.value).toEqual(newValue)
  })

  it("can unlinkParameter", async () => {
    const store = getPopulatedMockStore()
    await store.dispatch(unlinkParameter(sampleName, "value"))
    const actions = store.getActions()

    expect(actions[0].type).toEqual(SET_PARAMETER_VALUE)
    expect(actions[0].payload.name).toEqual(sampleName)
    expect(actions[0].payload.parameterSetId).toEqual(selectedParameterSetId)
    expect(actions[0].payload.value).toEqual("value")

    expect(actions[1].type).toEqual(SET_PARAMETER_DEFAULT)
    expect(actions[1].payload.name).toEqual(sampleName)
    expect(actions[1].payload.parameterSetId).toEqual(selectedParameterSetId)
    expect(actions[1].payload.defaultValue).toBeUndefined()
  })

  it("can unlinkParameter w/values", async () => {
    const sampleValue = "sample-value"
    const sampleDefault = "sample-default"
    const store = getPopulatedMockStore()
    await store.dispatch(
      unlinkParameter(sampleName, sampleValue, sampleDefault)
    )
    const actions = store.getActions()

    expect(actions[0].type).toEqual(SET_PARAMETER_VALUE)
    expect(actions[0].payload.name).toEqual(sampleName)
    expect(actions[0].payload.parameterSetId).toEqual(selectedParameterSetId)
    expect(actions[0].payload.value).toEqual(sampleValue)

    expect(actions[1].type).toEqual(SET_PARAMETER_DEFAULT)
    expect(actions[1].payload.name).toEqual(sampleName)
    expect(actions[1].payload.parameterSetId).toEqual(selectedParameterSetId)
    expect(actions[1].payload.defaultValue).toEqual(sampleDefault)
  })
})
