// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getPopulatedMockStore } from "../parameter-mock-store"

import {
  REMOVE_ALL_PARAMETER_DEFINITIONS,
  ADD_PARAMETER_DEFINITION,
  UPDATE_PARAMETER_DEFINITION,
  REMOVE_PARAMETER_DEFINITION
} from "../constants"
import { UPDATE_DASHBOARD_SAVE_STATE } from "constants/action-types"

import {
  removeAllParameterDefinitions,
  addParameterDefinition,
  updateParameterDefinition,
  removeParameterDefinition
} from "./parameter-definitions-action-creators"

const definition = {
  name: "test param",
  val1: "some value",
  val2: "other value"
}

describe("parameter definition action creators suite", () => {
  it("can removeAllParameterDefinitions", () => {
    expect(removeAllParameterDefinitions()).toEqual({
      type: REMOVE_ALL_PARAMETER_DEFINITIONS
    })
  })
  it("can addParameterDefinition", async () => {
    const store = getPopulatedMockStore()
    await store.dispatch(addParameterDefinition(definition))
    const actions = store.getActions()

    expect(actions[0].type).toEqual(ADD_PARAMETER_DEFINITION)
    expect(actions[0].payload).toEqual(definition)
    expect(actions[1].type).toEqual(UPDATE_DASHBOARD_SAVE_STATE)
  })
  it("can updateParameterDefinition", async () => {
    const store = getPopulatedMockStore()
    await store.dispatch(updateParameterDefinition(definition))
    const actions = store.getActions()

    expect(actions[0].type).toEqual(UPDATE_PARAMETER_DEFINITION)
    expect(actions[0].payload).toEqual(definition)
    expect(actions[1].type).toEqual(UPDATE_DASHBOARD_SAVE_STATE)
  })
  it("can removeParameterDefinition", async () => {
    const store = getPopulatedMockStore()
    await store.dispatch(removeParameterDefinition(definition.name))
    const actions = store.getActions()

    expect(actions[0].type).toEqual(REMOVE_PARAMETER_DEFINITION)
    expect(actions[0].payload).toEqual({ name: definition.name })
    expect(actions[1].type).toEqual(UPDATE_DASHBOARD_SAVE_STATE)
  })
})
