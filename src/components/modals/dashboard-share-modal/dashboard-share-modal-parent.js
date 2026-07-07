// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import DashboardShareModal from "./dashboard-share-modal"
import {
  closeDashboardShareModal,
  updateDashboardSharedUsersList,
  addDashboardSharedUser,
  removeDashboardSharedUser,
  updateDashboardAutosuggestValue,
  updateDashboardShareSuggestions,
  shareDashboard
} from "actions/dashboard-sharing-action-creators"
import { bulkShare, bulkUnshare } from "actions/dashboards-action-creator"
import { ESCAPE_KEY } from "constants/magic-variables"
import withKeyPressListener from "utils/with-key-press-listener"
import { compose } from "redux"
import { connect } from "react-redux"

const hideOnEscape = (props) => (event) => {
  if (event.keyCode === ESCAPE_KEY) {
    props.closeDashboardShareModal()
  }
}

const mapStateToProps = ({
  dashboardSharing: {
    sharedUsersList,
    allUsersAndRoles,
    autosuggestValue,
    suggestions
  },
  dashboard: { id, owner } = {}
}) => ({
  allUsersAndRoles,
  sharedUsersList,
  autosuggestValue,
  suggestions,
  dashboardId: id,
  dashboardOwner: owner
})

export default compose(
  connect(mapStateToProps, {
    closeDashboardShareModal,
    updateDashboardSharedUsersList,
    addDashboardSharedUser,
    removeDashboardSharedUser,
    updateDashboardAutosuggestValue,
    updateDashboardShareSuggestions,
    shareDashboard,
    bulkShare,
    bulkUnshare
  }),
  withKeyPressListener(hideOnEscape)
)(DashboardShareModal)
