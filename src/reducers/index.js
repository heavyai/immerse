// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import app from "./app-reducer"
import annotations from "./annotation-reducer"
import autosuggest from "./autosuggest-reducer"
import chartEditor from "./chart-editor-reducer"
import charts from "./charts/charts-reducer"
import chartData from "components/chart-data/chart-data-reducer"
import columnValues from "reducers/column-values-reducer"
import { combineReducers } from "redux"
import crossLinks from "./crosslink-reducer.ts"
import session from "./session-reducer"
import connection from "./connection"
import { sharedSettings } from "./shared-settings-reducer"
import { sharedSettingsImport } from "./shared-settings-import-reducer"
import omnifilters from "vega/reducers/filters-reducer"
import dashboard from "./dashboard"
import dashboards from "./dashboards-reducer"
import dashboardSharing from "./dashboard-sharing.js"
import dc from "./dc-reducer"
import filters from "reducers/filters-reducer"
import importer from "./importer-reducer"
import navBar from "./nav-bar-reducer"
import sqlEditor from "reducers/sql-editor-reducer"
import sqlNotebook from "../components/sql-notebook/redux/sql-notebook-reducer"
import tablePreview from "reducers/table-preview-reducer"
import tables from "reducers/tables-reducer"
import tablesMeta from "reducers/tables-meta-reducer"
import tablesReference from "reducers/tables-reference-reducer"
import filterSets from "components/new-filters/filter-sets-reducer"
import cohorts from "components/new-filters/cohorts-reducer"
import parameters from "components/parameters/reducer"
import chartAddons from "chart-addons/chart-addon-reducer"
import snapshots from "components/migration/snapshots-reducer"
import backendFunctions from "reducers/backend-functions-reducer"
import ui from "./ui-reducer"
import userConfigurableUI from "./user-configurable-ui-reducer"
import settings from "./settings-reducer"
import { joinDataSourcesReducer as joinDataSources } from "./join-reducer"
import history from "services/history"
import { connectRouter } from "connected-react-router"

export default combineReducers({
  app,
  annotations,
  backendFunctions,
  chartEditor,
  charts,
  sharedSettings,
  sharedSettingsImport,
  columnValues,
  crossLinks,
  session,
  connection,
  omnifilters,
  dashboard,
  dashboards,
  dashboardSharing,
  dc,
  autosuggest,
  filters,
  importer,
  navBar,
  router: connectRouter(history),
  tablePreview,
  tables,
  tablesMeta,
  tablesReference,
  ui,
  sqlEditor,
  sqlNotebook,
  filterZones: filterSets,
  cohorts,
  snapshots,
  userConfigurableUI,
  parameters,
  chartData,
  chartAddons,
  settings,
  joinDataSources
})
