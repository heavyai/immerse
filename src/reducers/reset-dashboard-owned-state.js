// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { cloneDeep } from "lodash"
import { initialState as initialChartEditor } from "./chart-editor-reducer"
import { initialState as initialDc } from "./dc-reducer"
import { initialState as initialUi } from "./ui-reducer"

export const resetDashboardWorkflows = (state) => ({
  ...state,
  chartData: {},
  columnValues: {},
  chartEditor: cloneDeep(initialChartEditor)
})

export const resetDashboardOwnedState = (state) => ({
  ...resetDashboardWorkflows(state),
  annotations: { annotations: {}, enabled: true, editMode: false },
  omnifilters: [],
  filterZones: {},
  cohorts: {},
  parameters: {
    definitions: {},
    values: {},
    sets: {},
    usage: {},
    crossfilterTokens: {}
  },
  crossLinks: [],
  chartAddons: {},
  joinDataSources: [],
  sharedSettings: { mappings: [] },
  sharedSettingsImport: {
    error: "",
    loading: false,
    sharedSettings: { mappings: [] }
  },
  ui: cloneDeep(initialUi),
  dc: cloneDeep(initialDc)
})
