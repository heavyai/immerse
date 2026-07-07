// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"
import compose from "recompose/compose"

import {
  getDashboards,
  initializeDashboard
} from "actions/dashboards-action-creator"
import {
  loadDashboardLink,
  clearDashboard
} from "actions/dashboard-action-creators"
import {
  hideModal,
  showModal,
  showDashboardImportModal
} from "actions/ui-action-creators"
import resetAppState from "actions/reset-app-state-action-creator"

import Dashboards from "./dashboards"

export const mapStateToProps = ({
  connection,
  dashboard,
  dashboards,
  router
}) => {
  const { location: { pathname } = {} } = router
  return {
    canCreateDashboard: connection.privileges.createDashboard,
    dashboards,
    isDemo: connection.isDemo,
    loadLinkId: dashboard.loadState.loadLinkId,
    version: connection.version,
    pathname,
    dbName: connection.sessionInfo ? connection.sessionInfo.database : null,
    username: connection.sessionInfo?.user
  }
}

export const mapDispatchToProps = {
  getDashboards,
  hideModal,
  showDashboardImportModal,
  loadDashboardLink,
  showModal,
  clearDashboard,
  resetAppState,
  initializeDashboard
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(Dashboards)
