// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getPopulatedMockStore, mockVariables } from "../parameter-mock-store"

import {
  REMOVE_ALL_PARAMETER_SETS,
  ADD_PARAMETER_SET,
  RENAME_PARAMETER_SET,
  REMOVE_PARAMETER_SETS,
  DUPLICATE_PARAMETER_SET,
  REMOVE_PARAMETER_VALUE,
  REMOVE_PARAMETER_DEFAULT,
  SET_PARAMETER_VALUE,
  SET_PARAMETER_DEFAULT
} from "../constants"

import {
  removeAllParameterSets,
  addParameterSet,
  getParameterSet,
  getDefaultParameterSet,
  addDefaultParameterSet,
  renameParameterSet,
  addParameterToParameterSet,
  removeParameterFromParameterSet,
  removeParameterSet,
  removeParameterSets,
  duplicateParameterSet,
  DEFAULT_PARAMETER_SET_NAME
} from "./parameter-sets-action-creators"

const pushIdRegex = /^-[-\w]+$/
const expectIdRegex = expect.stringMatching(pushIdRegex)

describe("parameter set action creators suite", () => {
  it("can removeAllParameterSets", () => {
    expect(removeAllParameterSets()).toEqual({
      type: REMOVE_ALL_PARAMETER_SETS
    })
  })
  it("can addParameterSet w/defaults", async () => {
    const store = getPopulatedMockStore()
    await store.dispatch(addParameterSet())
    const actions = store.getActions()

    expect(actions[0].type).toEqual(ADD_PARAMETER_SET)
    expect(actions[0].payload.name).toEqual(DEFAULT_PARAMETER_SET_NAME)
    expect(actions[0].payload.parent).toEqual(undefined)
    expect(actions[0].payload.id).toEqual(expectIdRegex)
    expect(actions[0].payload.tabId).toEqual(undefined)
  })
  it("can addParameterSet", async () => {
    const sampleParameterSet = {
      tabId: "sample-tab",
      name: "sample-name",
      id: "sample-id",
      parent: "sample-parent"
    }
    const store = getPopulatedMockStore()
    await store.dispatch(addParameterSet(sampleParameterSet))
    const actions = store.getActions()

    expect(actions[0].type).toEqual(ADD_PARAMETER_SET)
    expect(actions[0].payload.name).toEqual(sampleParameterSet.name)
    expect(actions[0].payload.parent).toEqual(sampleParameterSet.parent)
    expect(actions[0].payload.id).toEqual(sampleParameterSet.id)
    expect(actions[0].payload.tabId).toEqual(sampleParameterSet.tabId)
  })
  it("can getParameterSet", () => {
    const sampleParameterSet = {
      tabId: "sample-tab",
      name: "sample-name",
      id: "sample-id"
    }
    expect(getParameterSet(sampleParameterSet)).toEqual(sampleParameterSet)
  })
  it("can getParameterSet w/defaults", () => {
    const parameterSet = getParameterSet()
    expect(parameterSet.tabId).toEqual(undefined)
    expect(parameterSet.name).toEqual(DEFAULT_PARAMETER_SET_NAME)
    expect(parameterSet.id).toEqual(expectIdRegex)
  })

  it("can getDefaultParameterSet", () => {
    const defaultParameterSet = getDefaultParameterSet()
    expect(defaultParameterSet.tabId).toEqual(undefined)
    expect(defaultParameterSet.name).toEqual("Shared Parameter Set")
    expect(defaultParameterSet.id).toEqual(expectIdRegex)
  })

  it("can addDefaultParameterSet", async () => {
    const defaultParameterSet = getDefaultParameterSet()
    const store = getPopulatedMockStore()
    await store.dispatch(addDefaultParameterSet())
    const actions = store.getActions()

    expect(actions[0].type).toEqual(ADD_PARAMETER_SET)
    expect(actions[0].payload.name).toEqual(defaultParameterSet.name)
    expect(actions[0].payload.parent).toEqual(defaultParameterSet.parent)
    expect(actions[0].payload.id).toEqual(expectIdRegex)
    expect(actions[0].payload.tabId).toEqual(defaultParameterSet.tabId)
  })

  it("can renameParameterSet", () => {
    expect(renameParameterSet("a", "b")).toEqual({
      type: RENAME_PARAMETER_SET,
      payload: { id: "a", name: "b" }
    })
  })

  it("can addParameterToParameterSet w/o values", async () => {
    const name = "test-param-id"

    const store = getPopulatedMockStore()
    await store.dispatch(addParameterToParameterSet({ name }))
    const actions = store.getActions()

    expect(actions[0].type).toEqual(SET_PARAMETER_VALUE)
    expect(actions[0].payload.name).toEqual(name)
    expect(actions[0].payload.parameterSetId).toEqual(
      mockVariables.selectedParameterSetId
    )
    expect(actions[0].payload.value).toEqual(undefined)
    expect(actions[1].type).toEqual(SET_PARAMETER_DEFAULT)
    expect(actions[1].payload.name).toEqual(name)
    expect(actions[1].payload.parameterSetId).toEqual(
      mockVariables.selectedParameterSetId
    )
    expect(actions[1].payload.defaultValue).toEqual(undefined)
  })

  it("can addParameterToParameterSet w/values", async () => {
    const parameterSetId = "test-param-set-id"
    const name = "test-param-id"
    const value = "test-value"
    const defaultValue = "test-default"

    const store = getPopulatedMockStore()
    await store.dispatch(
      addParameterToParameterSet({ parameterSetId, name, value, defaultValue })
    )
    const actions = store.getActions()

    expect(actions[0].type).toEqual(SET_PARAMETER_VALUE)
    expect(actions[0].payload.name).toEqual(name)
    expect(actions[0].payload.parameterSetId).toEqual(parameterSetId)
    expect(actions[0].payload.value).toEqual(value)
    expect(actions[1].type).toEqual(SET_PARAMETER_DEFAULT)
    expect(actions[1].payload.name).toEqual(name)
    expect(actions[1].payload.parameterSetId).toEqual(parameterSetId)
    expect(actions[1].payload.defaultValue).toEqual(defaultValue)
  })

  it("can removeParameterFromParameterSet", async () => {
    const parameterSetId = "test-param-set-id"
    const name = "test-param-id"

    const store = getPopulatedMockStore()
    await store.dispatch(removeParameterFromParameterSet(name, parameterSetId))
    const actions = store.getActions()

    expect(actions[0].type).toEqual(REMOVE_PARAMETER_VALUE)
    expect(actions[0].payload.name).toEqual(name)
    expect(actions[0].payload.parameterSetId).toEqual(parameterSetId)
    expect(actions[1].type).toEqual(REMOVE_PARAMETER_DEFAULT)
    expect(actions[1].payload.name).toEqual(name)
    expect(actions[1].payload.parameterSetId).toEqual(parameterSetId)
  })

  it("can removeParameterSet", () => {
    const id = "test-parameter-set"
    expect(removeParameterSet(id)).toEqual({
      type: REMOVE_PARAMETER_SETS,
      payload: { sets: [id] }
    })
  })

  it("can removeParameterSets", () => {
    const sets = ["test-set-1", "test-set-2"]
    expect(removeParameterSets(sets)).toEqual({
      type: REMOVE_PARAMETER_SETS,
      payload: { sets }
    })
  })

  it("can duplicateParameterSet", () => {
    const id = "test-parameter-set"
    const action = duplicateParameterSet(id)
    expect(action.type).toEqual(DUPLICATE_PARAMETER_SET)
    expect(action.payload.id).toEqual(id)
    expect(action.payload.newId).toEqual(expectIdRegex)
  })
})
