// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

const mockStore = configureStore([thunk])

export const chartIdWithParamTitle = "90"
export const sampleName = "sample_parameter_name"
const otherName = "other_parameter_name"
const thirdName = "third_parameter_name"
const someToken = "some-token"
const sampleParameterSetId = "sample-parameter-set-id"
const selectedParameterSetId = "selected-parameter-set-id"
const selectedTabId = "sample-selected-tab"
const otherTabId = "other-tab"
const sampleDashboardParameterSetId = "sample-dashboard-parameter-set-id"
const unusedParameterSetId = "unused-parameter-set-id"
const defaultParameterSetId = "default-parameter-set-id"
export const selectedParameterSetValue = "sampleValue2"
const linkedParameterName = "linked_parameter_name"
const inheritedDashValue = "inherited-dash-value"

export const paramState = {
  parameters: {
    usage: {
      [selectedTabId]: {
        [sampleName]: {
          [someToken]: ["1", "2-Lx", "3"],
          "other-test-token": ["4", "5"]
        },
        [otherName]: {
          [someToken]: ["1", "3"]
        }
      },
      [otherTabId]: {
        [sampleName]: { [someToken]: ["90-7"] }
      }
    },
    sets: {
      [sampleDashboardParameterSetId]: {
        id: sampleDashboardParameterSetId
      },
      [unusedParameterSetId]: {
        id: unusedParameterSetId,
        tabId: "tab3",
        parent: sampleDashboardParameterSetId
      },
      [sampleParameterSetId]: {
        id: sampleParameterSetId,
        tabId: "tab2",
        parent: sampleDashboardParameterSetId
      },
      [selectedParameterSetId]: {
        id: selectedParameterSetId,
        tabId: selectedTabId,
        parent: sampleDashboardParameterSetId
      },
      tab7Set: {
        id: "tab7Set",
        tabId: "tab7",
        parent: sampleDashboardParameterSetId
      },
      [defaultParameterSetId]: {
        id: defaultParameterSetId,
        tabId: "tab8",
        parent: sampleDashboardParameterSetId
      }
    },
    values: {
      [sampleName]: {
        [sampleParameterSetId]: {
          value: "sampleValue1",
          defaultValue: "sampleDefault1"
        },
        [selectedParameterSetId]: {
          value: selectedParameterSetValue,
          defaultValue: "sampleDefault2"
        },
        [defaultParameterSetId]: {
          defaultValue: "default-value"
        },
        [sampleDashboardParameterSetId]: {
          value: "dashValue1",
          defaultValue: "dashDefault1"
        }
      }
    },
    definitions: {
      [sampleName]: { id: sampleName, type: "string" },
      [otherName]: { id: otherName, type: "string" },
      [thirdName]: { id: thirdName, type: "string" }
    }
  },
  dashboard: { selectedTabId },
  charts: {
    1: {},
    2: {},
    3: {},
    4: {
      title: "Chart Title"
    },
    5: {},
    [chartIdWithParamTitle]: { title: `$\{${sampleName}}` }
  }
}

export const linkedParamState = {
  parameters: {
    values: {
      [linkedParameterName]: {
        [sampleParameterSetId]: {
          value: null,
          defaultValue: null
        },
        [selectedParameterSetId]: {
          value: "localValue"
        },
        [sampleDashboardParameterSetId]: {
          value: inheritedDashValue
        }
      }
    },
    sets: {
      [sampleDashboardParameterSetId]: {
        id: sampleDashboardParameterSetId
      },
      [sampleParameterSetId]: {
        id: sampleParameterSetId,
        tabId: "tab2",
        parent: sampleDashboardParameterSetId
      },
      [selectedParameterSetId]: {
        id: selectedParameterSetId,
        tabId: selectedTabId,
        parent: sampleDashboardParameterSetId
      }
    },
    definitions: {
      [linkedParameterName]: { id: linkedParameterName, type: "string" }
    }
  }
}

export const getPopulatedMockStore = (modifiedState) => {
  return mockStore({ ...paramState, ...modifiedState })
}

export const mockVariables = {
  sampleName,
  otherName,
  thirdName,
  someToken,
  sampleParameterSetId,
  selectedParameterSetId,
  selectedTabId,
  otherTabId,
  sampleDashboardParameterSetId,
  unusedParameterSetId,
  defaultParameterSetId,
  selectedParameterSetValue,
  inheritedDashValue,
  linkedParamState,
  linkedParameterName
}
