// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const ROUTE_ROOT = "/"
export const ROUTE_DASHBOARDS = "/:database/dashboards"
export const ROUTE_DASHBOARD =
  "/:database?/dashboard/:dashboardId?/:selectedFilterSet?"
export const ROUTE_DATA_MANAGER = "/:database?/data-manager"
export const ROUTE_TABLES = "/:database?/tables"
export const ROUTE_SQL_EDITOR = "/:database?/sql-editor"
export const ROUTE_SQL_NOTEBOOK = "/:database?/sql-notebook"
export const ROUTE_CONTROL_PANEL = "/control-panel"
export const ROUTE_LOGIN = "/:database?/login"
export const ROUTE_LOGGED_OUT = "/logged-out"
export const ROUTE_SETTINGS = "/:database?/settings/:settingsSection?"
export const ROUTE_ROLE_SETTINGS = "/:database?/settings/roles/:role?"
export const ROUTE_SYSTEM_DASHBOARDS =
  "/information_schema/system-dashboards/:dashboardName"

export const ROUTE_DATA_MANAGEMENT = "/:dbName/data-manager/:tableName?"
export const ROUTE_DATA_MANAGEMENT_IMPORT = `${ROUTE_DATA_MANAGEMENT}/import/:importAction`
export const ROUTE_DATA_MANAGEMENT_IMPORT_TABLE_PREVIEW = `${ROUTE_DATA_MANAGEMENT_IMPORT}/:connectorType/table-preview/:connect?`

export const ROUTE_CHART_EDITOR =
  "/:database?/dashboard/:dashboardId?/chart/:chartId/edit"
