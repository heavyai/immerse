// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import DashboardLoadingContainer from "components/dashboard/dashboard-loading-container"
import Dashboards from "components/dashboards/dashboards-parent"
import Login from "components/login/login-parent"
import LoggedOutContainer from "components/logged-out/logged-out-container"
import React from "react"
import SqlEditorParent from "components/sql-editor/sql-editor-parent"
import CreateTable from "components/data-manager/import-table"
import TablePickerParent from "components/table-picker/table-picker-parent"
import ControlPanel from "components/control-panel"
import { Route, Switch } from "react-router-dom"
import AuthProtected from "routes/auth-protected"
import { importableStore as store } from "store/importableStore"
import DataManager from "components/data-manager/data-manager-parent"
import ImportPage from "components/data-manager/import-page/import-page"
import SettingsPage from "components/settings/settings-page"
import SystemDashboardsRoute from "components/system-dashboards-route"
import { SqlNotebook } from "components/sql-notebook/sql-notebook"
import * as ROUTES from "./paths"
import { isSqlNotebookEnabled } from "utils/is-sql-notebook-enabled"

const enable_control_panel = process.env.ENABLE_CONTROL_PANEL
// If we want anybody to access the control panel, then just disable the above line and enable the following.
// const enable_control_panel = true

/* XXX TODO -
  those first two routes SHOULD be a single route. And the path SHOULD be:
  /:database((?!dashboard)[^\/]*)

  But react-router internally uses path-to-regexp 1.7.0, which does not support
  zero width negative lookahead assertions, unlike the current release (6.1.0) which does.

  So we're stuck with the old backwards compatible route (/) as well as the new route
  which now has to be /:database/dashboards. Why the word "dashboards" afterwards? because
  otherwise it becomes ambiguous.

  We can't make it /:database? because the /dashboard URL would get picked by it (we'd be fine if
  we had negative lookaheads). /:database is out for the same reason, in addition to not being
  backwards compatible.
*/

const ProtectedRoutes = () => (
  <Switch>
    <Route
      {...{
        path: ROUTES.ROUTE_ROOT,
        exact: true
      }}
    >
      <Dashboards />
    </Route>
    {enable_control_panel && (
      <Route
        {...{
          path: ROUTES.ROUTE_CONTROL_PANEL,
          component: ControlPanel,
          exact: true
        }}
      />
    )}
    <Route
      {...{
        path: ROUTES.ROUTE_DATA_MANAGEMENT_IMPORT_TABLE_PREVIEW,
        component: ImportPage
      }}
    />
    <Route
      {...{
        path: ROUTES.ROUTE_DATA_MANAGEMENT_IMPORT,
        component: CreateTable
      }}
    />
    <Route
      {...{
        path: ROUTES.ROUTE_DATA_MANAGEMENT,
        component: DataManager
      }}
    />
    <Route
      {...{
        path: ROUTES.ROUTE_DATA_MANAGER,
        component: TablePickerParent
      }}
    />
    {/* TODO: find out why the heck we have 2 routes doing the same thing */}
    <Route
      {...{
        path: ROUTES.ROUTE_TABLES,
        component: TablePickerParent
      }}
    />
    <Route
      {...{
        path: ROUTES.ROUTE_SQL_EDITOR,
        component: SqlEditorParent
      }}
    />
    {isSqlNotebookEnabled() && (
      <Route
        {...{
          path: ROUTES.ROUTE_SQL_NOTEBOOK,
          component: SqlNotebook
        }}
      />
    )}
    <Route
      {...{
        path: ROUTES.ROUTE_DASHBOARDS,
        exact: true
      }}
    >
      <Dashboards />
    </Route>
    <Route
      {...{
        path: ROUTES.ROUTE_DASHBOARD,
        component: DashboardLoadingContainer
      }}
    />
    <Route
      {...{
        path: ROUTES.ROUTE_SETTINGS,
        component: SettingsPage
      }}
    />
    <Route
      {...{
        path: ROUTES.ROUTE_SYSTEM_DASHBOARDS,
        component: SystemDashboardsRoute
      }}
    />
  </Switch>
)

const Routes = () => (
  <Switch>
    <Route
      {...{
        path: ROUTES.ROUTE_LOGIN,
        component: Login
      }}
    />
    <Route component={LoggedOutContainer} path={ROUTES.ROUTE_LOGGED_OUT} />
    <AuthProtected
      {...{
        authenticated: store.getState().connection.isConnected
      }}
    >
      <ProtectedRoutes />
    </AuthProtected>
  </Switch>
)

export default Routes
