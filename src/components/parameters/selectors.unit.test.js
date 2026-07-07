// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  paramState,
  mockVariables,
  linkedParamState
} from "./parameter-mock-store"

const {
  sampleName,
  otherName,
  thirdName,
  selectedParameterSetId,
  selectedTabId,
  otherTabId,
  unusedParameterSetId,
  defaultParameterSetId,
  sampleDashboardParameterSetId,
  linkedParameterName
} = mockVariables

import {
  getParameterSets,
  getParameterValues,
  getParameterDefinitions,
  getSelectedTab,
  makeGetParameterSetIdsForTabId,
  getParameterSetIdForSelectedTab,
  isParameterDefinedInSet,
  getParameterSetForDashboard,
  getParameterSetsForTabId,
  getSharedParameterSets,
  makeGetParameterValue,
  makeGetParametersInSet,
  makeGetParameterUsage,
  makeIsParameterInUse,
  makeHasLinkedSiblings
} from "./selectors"

describe("parameter selectors test suite", () => {
  it("can getParameterSets", () => {
    expect(getParameterSets(paramState)).toEqual(paramState.parameters.sets)
  })
  it("can getParameterValues", () => {
    expect(getParameterValues(paramState)).toEqual(paramState.parameters.values)
  })
  it("can getParameterDefinitions", () => {
    expect(getParameterDefinitions(paramState)).toEqual(
      paramState.parameters.definitions
    )
  })
  it("can getSelectedTab", () => {
    expect(getSelectedTab(paramState)).toEqual(
      paramState.dashboard.selectedTabId
    )
  })
  it("can makeGetParameterSetIdsForTabId", () => {
    expect(makeGetParameterSetIdsForTabId(paramState)(selectedTabId)).toEqual([
      paramState.parameters.sets[selectedParameterSetId].id
    ])
  })
  it("can getParameterSetIdForSelectedTab", () => {
    expect(getParameterSetIdForSelectedTab(paramState)).toEqual(
      selectedParameterSetId
    )
  })

  it("can getParametersInSet", () => {
    const getParamsInSet = makeGetParametersInSet(paramState)

    expect(getParamsInSet(selectedParameterSetId)).toEqual(
      new Set([sampleName])
    )

    expect(getParamsInSet(unusedParameterSetId)).toEqual(new Set())

    expect(getParamsInSet()).toEqual(new Set([sampleName]))
  })

  it("can find if isParameterDefinedInSet", () => {
    expect(
      isParameterDefinedInSet(paramState)(sampleName, selectedParameterSetId)
    ).toEqual(true)
    expect(
      isParameterDefinedInSet(paramState)(sampleName, unusedParameterSetId)
    ).toEqual(false)
  })
  it("can getParameterSetForDashboard", () => {
    expect(getParameterSetForDashboard(paramState)).toEqual(
      paramState.parameters.sets[sampleDashboardParameterSetId]
    )
  })
  it("can getParameterSetsForTabId", () => {
    expect(getParameterSetsForTabId(paramState)(selectedTabId)).toEqual([
      paramState.parameters.sets[selectedParameterSetId]
    ])
  })
  it("can getSharedParameterSets", () => {
    expect(getSharedParameterSets(paramState)).toEqual([
      paramState.parameters.sets[sampleDashboardParameterSetId]
    ])
  })
  it("can makeGetParameterValue", () => {
    const getParameterValue = makeGetParameterValue(paramState)
    expect(getParameterValue(sampleName, selectedParameterSetId)).toEqual(
      "sampleValue2"
    )
    expect(getParameterValue(sampleName, defaultParameterSetId)).toEqual(
      "default-value"
    )
    expect(getParameterValue(sampleName, unusedParameterSetId)).toEqual(
      "dashValue1"
    )
  })

  it("can makeGetParameterUsage", () => {
    const getParameterUsage = makeGetParameterUsage(paramState)

    expect(getParameterUsage(sampleName)).toEqual(
      new Set(["1", "2", "3", "4", "5", "90"])
    )
    expect(getParameterUsage(otherName)).toEqual(new Set(["1", "3"]))
    expect(getParameterUsage(thirdName)).toEqual(new Set([]))
  })

  it("can makeGetParameterUsage w/tabId", () => {
    const getParameterUsage = makeGetParameterUsage(paramState)
    expect(getParameterUsage(sampleName, selectedTabId)).toEqual(
      new Set(["1", "2", "3", "4", "5"])
    )
    expect(getParameterUsage(sampleName, otherTabId)).toEqual(new Set(["90"]))
    expect(getParameterUsage(sampleName, "unknown-tab-id")).toEqual(new Set([]))
  })

  it("can makeIsParameterInUse", () => {
    const isParameterInUse = makeIsParameterInUse(paramState)
    expect(isParameterInUse(sampleName)).toEqual(true)
    expect(isParameterInUse(otherName)).toEqual(true)
    expect(isParameterInUse(thirdName)).toEqual(false)
  })

  it("can makeIsParameterInUse w/tabId", () => {
    const isParameterInUse = makeIsParameterInUse(paramState)
    expect(isParameterInUse(sampleName, selectedTabId)).toEqual(true)
    expect(isParameterInUse(sampleName, otherTabId)).toEqual(true)
    expect(isParameterInUse(otherName, otherTabId)).toEqual(false)
    expect(isParameterInUse(thirdName, "unknown-tab-id")).toEqual(false)
  })

  it("can makeGetLinkedSiblings", () => {
    expect(
      makeHasLinkedSiblings(paramState)(sampleName, selectedParameterSetId)
    ).toEqual(false)

    expect(
      makeHasLinkedSiblings(linkedParamState)(
        linkedParameterName,
        selectedParameterSetId
      )
    ).toEqual(true)
  })
})
