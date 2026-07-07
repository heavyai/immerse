// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { matchPath } from "react-router"
import {
  ROUTE_ROOT,
  ROUTE_DASHBOARDS,
  ROUTE_LOGIN,
  ROUTE_LOGGED_OUT,
  ROUTE_DATA_MANAGER,
  ROUTE_SQL_EDITOR,
  ROUTE_DASHBOARD,
  ROUTE_CHART_EDITOR,
  ROUTE_DATA_MANAGEMENT_IMPORT,
  ROUTE_SETTINGS
} from "routes/paths"

export function atDashboardsList(path) {
  return (
    Boolean(matchPath(path, { path: ROUTE_ROOT, exact: true })) ||
    Boolean(matchPath(path, { path: ROUTE_DASHBOARDS }))
  )
}

export function routeToDashboardsList(database) {
  // there's a single solitary edge case for this route - the `/login` prompt. You can be
  // on it and attempt to hit the home logo, which'll bounce you to the dashboards list.
  // BUT - that is the sole "old style" route that still exists, so it'd try to construct
  // the dashboards list with an "undefined" database, and then bump you to a login prompt
  // for undefined. And here we are.
  return `/${database !== undefined ? `${database}/` : ""}dashboards`
}

export function inDashboard(path) {
  return Boolean(matchPath(path, { path: ROUTE_DASHBOARD }))
}

export function routeToDashboard(database, dashboardId, tabId, filterSetId) {
  const params = new URLSearchParams()

  if (tabId) {
    params.set("tab", tabId)
  }

  if (filterSetId) {
    params.set("filterSet", filterSetId)
  }

  const search = params.toString()

  return {
    pathname: `/${database}/dashboard${dashboardId ? `/${dashboardId}` : ""}`,
    search
  }
}

export function onEditPath(path) {
  return Boolean(matchPath(path, { path: ROUTE_CHART_EDITOR }))
}

export function routeToChartEditor(database, dashboardId, chartId) {
  return `/${database}/dashboard/${
    dashboardId ? `${dashboardId}/` : ""
  }chart/${chartId}/edit`
}

export function atLoginPath(path) {
  return Boolean(matchPath(path, { path: ROUTE_LOGIN }))
}

export function atLoggedOutPath(path) {
  return Boolean(matchPath(path, { path: ROUTE_LOGGED_OUT }))
}

export function atDataManagerPath(path) {
  return Boolean(matchPath(path, { path: ROUTE_DATA_MANAGER }))
}

export function routeToDataManager(database) {
  return `/${database}/data-manager`
}

export function atSqlEditorPath(path) {
  return Boolean(matchPath(path, { path: ROUTE_SQL_EDITOR }))
}

export function atImporterPath(path) {
  return Boolean(
    matchPath(path, {
      path: ROUTE_DATA_MANAGEMENT_IMPORT
    })
  )
}

export function atSettingsPath(path) {
  return Boolean(matchPath(path, { path: ROUTE_SETTINGS }))
}

export function routeToSqlEditor(database) {
  return `/${database}/sql-editor`
}

export function routeToSqlNotebook(database) {
  return `/${database}/sql-notebook`
}

export function routeToSettings(database) {
  return `/${database}/settings`
}

export const getNavigationTitle = (route) => {
  if (atDashboardsList(route)) {
    return "Dashboards"
  }

  if (onEditPath(route)) {
    return "Editor"
  }

  if (inDashboard(route)) {
    return "Dashboard"
  }

  if (atImporterPath(route)) {
    return "Importer"
  }

  if (atDataManagerPath(route)) {
    return "Data Manager"
  }

  if (atSqlEditorPath(route)) {
    return "SQL Editor"
  }

  if (atSettingsPath(route)) {
    return "Control Panel"
  }

  return ""
}

export const getNavigationBaseRoute = (route, database) => {
  if (atDashboardsList(route) || inDashboard(route)) {
    return routeToDashboardsList(database)
  }

  if (atDataManagerPath(route)) {
    return routeToDataManager(database)
  }

  if (atSqlEditorPath(route)) {
    return routeToSqlEditor(database)
  }

  return ""
}
