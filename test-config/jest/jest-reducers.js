// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import app from "../../src/reducers/app-reducer"
import autosuggest from "../../src/reducers/autosuggest-reducer"
import chartEditor from "../../src/reducers/chart-editor-reducer"
import connection from "../../src/reducers/connection"
import dashboard from "../../src/reducers/dashboard"
import dashboards from "../../src/reducers/dashboards-reducer"
import dashboardSharing from "../../src/reducers/dashboard-sharing.js"
import dc from "../../src/reducers/dc-reducer"
import filters from "../../src/reducers/filters-reducer"
import importer from "../../src/reducers/importer-reducer"
import navBar from "../../src/reducers/nav-bar-reducer"
import tablePreview from "../../src/reducers/table-preview-reducer"
import tables from "../../src/reducers/tables-reducer"
import tablesReference from "../../src/reducers/tables-reference-reducer"
import cohorts from "../../src/components/new-filters/cohorts-reducer"
import ui from "../../src/reducers/ui-reducer"
import { createBrowserHistory } from "history"
import { connectRouter } from "connected-react-router"
import omnifilters from "../../src/vega/reducers/filters-reducer"
import charts from "../../src/reducers/charts/charts-reducer"
import { joinDataSourcesReducer as joinDataSources } from "../../src/reducers/join-reducer"
import userConfigurableUI from "reducers/user-configurable-ui-reducer"
import settings from "reducers/settings-reducer"
import parameters from "components/parameters/reducer"
import { sharedSettings } from "reducers/shared-settings-reducer"

// These reducers are causing a parsing error in JEST because of something in heavyai-charting:
// import sqlEditor from "../../src/reducers/sql-editor-reducer"
// import filterZones from "../../src/components/new-filters/filter-zones-reducer"
// import history from "services/history"

export default {
  charts,
  omnifilters,
  // sqlEditor,
  // filterZones,
  router: connectRouter(createBrowserHistory()),
  app,
  chartEditor,
  connection,
  dashboard,
  dashboards,
  dashboardSharing,
  dc,
  autosuggest,
  filters,
  importer,
  navBar,
  settings,
  tablePreview,
  tables,
  tablesReference,
  parameters,
  ui,
  cohorts,
  joinDataSources,
  sharedSettings,
  userConfigurableUI
}
