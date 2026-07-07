// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"

import { hideModal, showModal } from "actions/ui-action-creators"
import {
  copyDashboardWithId,
  exportDashboard
} from "actions/dashboard-action-creators"
import { deleteDashboard } from "actions/dashboards-action-creator"
import { getDatabase } from "selectors"

import DashboardRowItem from "./dashboard-row-item"

export function primaryAction(dispatch, id) {
  return function hideModalAndDeleteDashboard() {
    dispatch(hideModal())
    dispatch(deleteDashboard(id))
  }
}

export function mapStateToProps(state, { dashboard_id }) {
  return {
    isPendingDelete:
      state.dashboards.delete.id === dashboard_id &&
      state.dashboards.delete.done,
    username: state.connection.user.username,
    database: getDatabase(state)
  }
}

export function mapDispatchToProps(dispatch, { dashboard_id, dashboard_name }) {
  return {
    copyDashboard() {
      dispatch(copyDashboardWithId(dashboard_id))
    },
    exportDashboard() {
      dispatch(exportDashboard(dashboard_id))
    },
    showDeleteDashboardModal() {
      dispatch(
        showModal({
          heading: "Delete Dashboard",
          content: `Delete “${dashboard_name}”?`,
          primaryAction: {
            action: primaryAction(dispatch, dashboard_id),
            text: "OK"
          },
          secondaryAction: {
            action: () => dispatch(hideModal()),
            text: "CANCEL"
          }
        })
      )
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardRowItem)
