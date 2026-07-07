// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { initialState as initialChartsState } from "reducers/charts/charts-reducer"
import { initialState as initialDashboardState } from "reducers/dashboard"
import { initialState as initialDCState } from "reducers/dc-reducer"
import { initialState as initialFiltersState } from "reducers/filters-reducer"
import { initialState as initialTablesState } from "reducers/tables-reducer"
import { initialState as initialSqlEditorState } from "reducers/sql-editor-reducer"
import { initialState as initialSnapshotsState } from "components/migration/snapshots-reducer"
import { initialState as initialCrossLinksState } from "reducers/crosslink-reducer"
import { initialSqlNotebookState } from "components/sql-notebook/redux/sql-notebook-reducer"

import { RESET_APP_STATE } from "constants/action-types"

export default function resetAppState(reducer) {
  return (state, action) => {
    if (action.type === RESET_APP_STATE) {
      return Object.assign({}, state, {
        dc: initialDCState,
        dashboard: initialDashboardState,
        charts: initialChartsState,
        filters: initialFiltersState,
        tables: initialTablesState,
        sqlEditor: initialSqlEditorState,
        snapshots: initialSnapshotsState,
        crossLinks: initialCrossLinksState,
        sqlNotebook: initialSqlNotebookState
      })
    } else {
      return reducer(state, action)
    }
  }
}
